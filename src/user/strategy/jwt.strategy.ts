import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Request } from "express";
import { ExtractJwt, Strategy } from "passport-jwt"

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt'){
    constructor(config: ConfigService){
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                (req: Request)=>{
                    return req.cookies?.accessToken ?? null
                }
            ]),
            ignoreExpiration: false,
            secretOrKey: config.get<string>('JWT_SECRET')!
        })
    }

    async validate(payload: { id: string, username: string, email: string }){
        return { id: payload.id, username: payload.username, email: payload.email }
    }
}