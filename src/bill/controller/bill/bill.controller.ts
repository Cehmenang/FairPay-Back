import { BadRequestException, Body, Controller, Delete, Get, Param, Post, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateBillDto } from 'dtos/bill.dto';
import { BillService } from 'src/bill/service/bill/bill.service';
import { JwtGuard } from 'src/user/guard/jwt.guard';

@Controller('bill')
export class BillController {
    constructor(private readonly billService: BillService){}

    @UseGuards(JwtGuard)
    @Post()
    createBill(@Body() body: CreateBillDto, @Req() request){
        return this.billService.createBill(body, request.user.id!)
    }

    @UseGuards(JwtGuard)
    @UseInterceptors(
        FileInterceptor('file', {
            limits: { fileSize: 1024 * 1024 * 15 },
            fileFilter: (req, file, cb)=>{
                if (!/^image\/(jpeg|jpg|png|webp)$/.test(file.mimetype)) {
                    return cb(new BadRequestException('Format gambar salah!'), false);
                }
                return cb(null, true)
            }
        })
    )
    @Post('scan')
    scanBill(@UploadedFile() file: Express.Multer.File, @Body() body: { base: string }){
        if(!file) throw new BadRequestException("Gambar wajib dikirim!")
        return this.billService.scanBill(file)
    }

    @UseGuards(JwtGuard)
    @Get()
    getBills(@Req() request){
        const { user } = request
        return this.billService.getBills(user.id)
    }

    @UseGuards(JwtGuard)
    @Get(':url')
    getBillDetail(@Param('url') url: string){
        return this.billService.getBillDetail(url)
    }

    @Get('/claim/:url')
    getBillClaim(@Param('url') url: string){
        return this.billService.getBillClaim(url)
    }

    @Delete(':id')
    deleteBill(@Param('id') id:string){
        return this.billService.deleteBill(id)
    }
}
