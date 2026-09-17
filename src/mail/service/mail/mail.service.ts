import { Injectable } from '@nestjs/common';
import nodemailer from 'nodemailer';

@Injectable()
export class MailService {
    private readonly transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_APP_PASS
        }
    })

    async sendBillCompletedEmail(to: string, billTitle: string){
        await this.transporter.sendMail({
            from: `"FairPay" <${process.env.GMAIL_USER}>`,
            to,
            subject: `Tagihan "${billTitle}" sudah lunas`,
            html: `<p>Semua peserta sudah menyelesaikan pembayaran untuk tagihan <strong>${billTitle}</strong>.</p>`
        })
    }
}
