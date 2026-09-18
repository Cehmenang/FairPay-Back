import { Injectable, NotFoundException } from '@nestjs/common';
import { PaymentMethod } from '@prisma/client';
import { MailService } from 'src/mail/service/mail/mail.service';
import { PrismaService } from 'src/prisma/service/prisma/prisma.service';

@Injectable()
export class ParticipantService {
    constructor(private readonly prisma: PrismaService, private readonly mailService: MailService){}

    async getContacts(id: string){
        return await this.prisma.contact.findMany({ where: { ownerId: id } })
    }
    
    async createContact(body: { name: string, whatsapp?: string }, id: string){
        return await this.prisma.contact.create({ data: { 
            ...body,
            ownerId: id
        } })
    }

    async payBillClaim(url: string, id: string, paymentMethod: PaymentMethod){
        const result = await this.prisma.billParticipant.update({ 
            where: { id, bill: { shareToken: url } },
            data: { claimedAt: new Date(), paymentMethod }
        })
        if (!result) {
            throw new NotFoundException('Peserta tidak ditemukan untuk tagihan ini');
        }
        return result
    }

    async verifyBillClaim(url: string, id: string){
        const result = await this.prisma.billParticipant.update({ 
            where: { id, bill: { shareToken: url } },
            data: { paidAt: new Date() },
            include: { bill: { include: { owner: true, participants: true } } }
        })
        if (!result) {
            throw new NotFoundException('Peserta tidak ditemukan untuk tagihan ini');
        }

        const allPaid = result.bill.participants.every(p=>p.paidAt !== null)
        if(allPaid) await this.mailService.sendBillCompletedEmail(
            result.bill.owner.email, result.bill.title)
        return result
    }
}
