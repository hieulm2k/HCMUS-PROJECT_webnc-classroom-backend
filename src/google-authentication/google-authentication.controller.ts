import {
  Controller,
  Post,
  ClassSerializerInterceptor,
  UseInterceptors,
  Body,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import TokenVerificationDto from './dto/token-verification.dto';
import { GoogleAuthenticationService } from './google-authentication.service';

@Controller('google-authentication')
@ApiTags('google-authentication')
@UseInterceptors(ClassSerializerInterceptor)
export class GoogleAuthenticationController {
  constructor(
    private readonly googleAuthenticationService: GoogleAuthenticationService,
  ) {}

  @Post()
  async authenticate(@Body() tokenData: TokenVerificationDto) {
    return this.googleAuthenticationService.authenticate(tokenData.token);
  }
}
