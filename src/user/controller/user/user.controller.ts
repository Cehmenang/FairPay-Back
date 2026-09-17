import { Body, Controller, Delete, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { JwtGuard } from 'src/user/guard/jwt.guard';
import { UserService } from 'src/user/service/user/user.service';

@Controller('user')
export class UserController {
    constructor(private readonly service: UserService){}

    
    @Post()
    async createUser(@Body() body, @Res({ passthrough: true }) response: Response){
        const data = await this.service.createUser(body)
        if(data){
            this.service.generateAccessToken(data.token, response)
            return data
        }
    }

    @Post('login')
    async login(@Body() body, @Res({ passthrough: true }) response: Response){
        const data = await this.service.login(body)
        if(data){
            this.service.generateAccessToken(data.token, response)
            return data
        }
    }

    @Get()
    @UseGuards(JwtGuard)
    getUsers(){
        return this.service.getUsers()
    }

    @Delete('all')
    async deleteAll(){
        return this.service.deleteAll()
    }

    @UseGuards(JwtGuard)
    @Delete()
    async delete(@Res({ passthrough: true }) response: Response){
        try{
            await response.clearCookie('accessToken')
            return { msg: 'Berhasil Logout!' }
        }catch(err){ console.log(err) }
    }

}
