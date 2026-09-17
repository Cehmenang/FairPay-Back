import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateBillDto } from 'dtos/bill.dto';
import { PrismaService } from 'src/prisma/service/prisma/prisma.service';

@Injectable()
export class BillService {
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
