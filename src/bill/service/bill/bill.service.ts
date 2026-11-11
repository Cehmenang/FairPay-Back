import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateBillDto } from 'dtos/bill.dto';
import { PrismaService } from 'src/prisma/service/prisma/prisma.service';

@Injectable()
export class BillService {
    private readonly groqUrl = process.env.GROQ_URL as string
    private readonly groqApi = process.env.GROQ_API as string
    private readonly MAX_RETRIES = 2;
    private readonly SYSTEM_PROMPT = `OCR struk belanja. Balas HANYA JSON murni (tanpa markdown, tanpa penjelasan):
{"isReceipt":bool,"title":string|null,"currency":string|null,"items":[{"name":string,"qty":number,"unitPrice":number,"subTotal":number}],"grossAmount":number|null,"tax":number|null,"note":string|null}

Angka murni, tanpa simbol/titik ribuan.

Aturan:
- Bukan struk (orang/dokumen lain) -> isReceipt=false, field lain null/[], note=alasan singkat.
- title=nama toko. currency=ISO 4217 dari petunjuk di struk (bahasa/simbol/format/nama toko), default "IDR" jika tak ada petunjuk.
- items: gabung baris duplikat (jumlah qty). unitPrice=harga satuan (hitung mundur dari subtotal/qty jika perlu). subTotal=qty*unitPrice. Skip baris subtotal/pajak/diskon/service charge.
- grossAmount=total sebelum pajak (baris Subtotal, atau jumlah subTotal item).
- tax=nominal pajak/PPN/VAT, null jika tak ada.
- note=null jika jelas; isi singkat jika ada bagian buram/tebakan. Jangan skip item karena buram — tebak.
- Jangan mengarang item. Selalu keluarkan JSON lengkap walau harus menebak.`

    constructor(private readonly prisma: PrismaService){}

   slugify(text: string) {
	return text
		.toLowerCase()
		.normalize('NFKD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/(^-|-$)+/g, '');
    }

    generateShareToken(title: string) {
	    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
	    const slugPart = this.slugify(title).slice(0, 30) || 'bill';
	    const randomPart = crypto.randomUUID().slice(0, 6); 
	    return `${datePart}-${slugPart}-${randomPart}`;
    }

    async getBillDetail(url: string){
        return await this.prisma.bill.findFirst({ where: { id: url },
        include: { participants: { include: { items: true, contact: true } }, owner: true } })
    }

    async getBillClaim(url: string){
        return await this.prisma.bill.findFirst({ where: { shareToken: url },
        include: { participants: { include: { items: true, contact: true } }, owner: true } })
    }

    async callGroq(dataUrl: string){
        
	for (let attempt = 0; attempt <= this.MAX_RETRIES; attempt++) {
		const groqRes = await fetch(this.groqUrl, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${this.groqApi}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				model: 'qwen/qwen3.8-27b',
				temperature: 0,
				max_tokens: 700,
				reasoning_effort: 'none',
				reasoning_format: 'hidden',
				response_format: { type: 'json_object' },
				messages: [
					{ role: 'system', content: this.SYSTEM_PROMPT },
					{
						role: 'user',
						content: [
							{ type: 'text', text: 'Ini fotonya.' },
							{ type: 'image_url', image_url: { url: dataUrl } }
						]
					}
				]
			})
		});

		if (groqRes.ok) {
			try {
				return { data : await groqRes.json()}
			} catch {
				console.warn(`Attempt ${attempt + 1}: hasil bukan JSON valid`)
				continue
			}
		}
	}

	
    }

    async scanBill(file: Express.Multer.File){
        const dataUrl = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
        const ocr = await this.callGroq(dataUrl) as any
        // if(!ocr || !ocr.data.isReceipt) throw new BadRequestException('OCR Bukan Sebuah Struk!')
        ocr.data.choices.message.forEach(m=>console.log(m, 'DATA'))
        return true
    }

    async createBill(body: CreateBillDto, id: string){
        const { items, participants, ...billData } = body
        const data = await this.prisma.$transaction(async(tx)=>{
            const bill = await tx.bill.create({
                data: {
                    ...billData,
                    ownerId: id,
                    shareToken: this.generateShareToken(body.title),
                    participants: {
                        create: participants.map((p)=>({
                            contactId: p.contactId,
                            shareAmount: p.shareAmount,
                        }))
                    }
                }, include: { participants: true }
            })

            const participantsMap = new Map(
                bill.participants.map((p)=>[p.contactId, p.id])
            )

            await tx.billItem.createMany({
                data: items.map(item=>{
                    const participantId = participantsMap.get(item.contactId)
                    if (!participantId) {
                        throw new BadRequestException(
                            `Contact ${item.contactId} tidak ditemukan di participants bill ini`,
                        );
                    }
                    return {
                        name: item.name,
                        qty: item.qty,
                        unitPrice: item.unitPrice,
                        subTotal: item.qty * item.unitPrice,
                        billId: bill.id,
                        participantId,
                    }
                })
            })

            return tx.bill.findUnique({
                where: { id: bill.id },
                include: { participants: { include: { contact: true } }, items: true },
            });
        })
        return { msg: 'BERHASIL MENAMBAH BILL!', data }
    }

    async getBills(id: string){
       return await this.prisma.bill.findMany({
        where: { ownerId: id },
        include: {
            participants: {
                include: { contact: true }
            }
        },
        orderBy: { createdAt: 'desc' }
    });

    }

    async deleteBill(id){
        await this.prisma.bill.delete({ where: {id} })
        return { msg: 'Berhasil Menghapus Bill' }
    }
}
