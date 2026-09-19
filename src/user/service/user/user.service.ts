import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { PrismaService } from 'src/prisma/service/prisma/prisma.service';
import * as bcrypt from 'bcrypt'

@Injectable()
export class UserService {
    constructor(private readonly prisma: PrismaService, private readonly jwt: JwtService){}

    generateAccessToken(token: string, response: Response){
        return response.cookie('accessToken', token, {
            maxAge: 1000 * 60 * 60, httpOnly: true, secure: true, sameSite: 'none' as const
        })
    }

    createToken(user){
        const token = this.jwt.sign({ id: user.id, username: user.username, email: user.email })
        return token
    }

    async createUser(body){
        body.password = await bcrypt.hash(body.password, 10)
        const user = await this.prisma.user.create({ data: body })
        if(user){
            return { message: 'Berhasil Membuat Akun!', token : this.createToken(user) }
        }
    }

    async login(body){
        const user = await this.prisma.user.findFirst({ where: { email: body.email } })
        if(!user) throw new BadRequestException('Akun tidak ditemukan!')
        const validatePassword = await bcrypt.compare(body.password, user.password)
        if(!validatePassword) throw new BadRequestException('Password tidak sesuai!')
        return { message: 'Berhasil Login!', token : this.createToken(user) }
    }

    async getUsers(){
        return await this.prisma.user.findMany()
    }

    async deleteAll(){
        return await this.prisma.user.deleteMany()
    }
}
