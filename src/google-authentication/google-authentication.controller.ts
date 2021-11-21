import {
  Controller,
  Post,
  ClassSerializerInterceptor,
  UseInterceptors,
  Body,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from 'src/auth/decorators/public.decorator';

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
  @Public()
  async authenticate(@Body() tokenData: TokenVerificationDto) {
    return this.googleAuthenticationService.authenticate(tokenData.token);
  }
}
