import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { PaymentMethod } from '@prisma/client';
import { ParticipantService } from 'src/participant/service/participant/participant.service';
import { JwtGuard } from 'src/user/guard/jwt.guard';

@Controller('participant')
export class ParticipantController {
    constructor(private readonly service: ParticipantService){}

    @UseGuards(JwtGuard)
    @Get('contact')
    getContacts(@Req() { user }){
        return this.service.getContacts(user.id)
    }

    @UseGuards(JwtGuard)
    @Post('contact')
    createContact(@Body() body, @Req() { user }){
        return this.service.createContact(body, user.id)
    }

    @Patch(':id/claim/:url')
    payBillClaim(@Param('url') url: string, @Param('id') id: string, @Body() body: { paymentMethod: PaymentMethod }){
        return this.service.payBillClaim(url, id, body.paymentMethod)
    }

    @UseGuards(JwtGuard)
    @Get(':id/verify/:url')
    verifyBillClaim(@Param('url') url: string, @Param('id') id: string){
        return this.service.verifyBillClaim(url, id)
    }
}
