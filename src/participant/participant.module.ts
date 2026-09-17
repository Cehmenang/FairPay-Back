import { Module } from '@nestjs/common';
import { ParticipantController } from './controller/participant/participant.controller';
import { ParticipantService } from './service/participant/participant.service';
import { JwtStrategy } from 'src/user/strategy/jwt.strategy';
import { MailModule } from 'src/mail/mail.module';

@Module({
  imports: [MailModule],
  controllers: [ParticipantController],
  providers: [ParticipantService, JwtStrategy]
})
export class ParticipantModule {}
