import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/user.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        return {
          transport: {
            host: configService.get('EMAIL_HOST'),
            port: configService.get('EMAIL_PORT'),
            secure: false,
            auth: {
              user: configService.get('EMAIL_USER'),
              pass: configService.get('EMAIL_PASSWORD'),
            },
          },
          defaults: {
            from: configService.get('EMAIL_FROM'),
          },
        };
      },
    }),
    TypeOrmModule.forFeature([User]),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
