import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from 'src/auth/auth.module';
import { UserModule } from 'src/user/user.module';
import { GoogleAuthenticationController } from './google-authentication.controller';
import { GoogleAuthenticationService } from './google-authentication.service';

@Module({
  imports: [ConfigModule, UserModule, AuthModule],
  controllers: [GoogleAuthenticationController],
  providers: [GoogleAuthenticationService],
})
export class GoogleAuthenticationModule {}
