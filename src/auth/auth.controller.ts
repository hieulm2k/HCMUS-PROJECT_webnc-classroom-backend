import { Body, Controller, Get, Patch, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  FindByTokenQuery,
  RequestResetPwd,
  ResetPwd,
} from 'src/user/dto/user.dto';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { AuthCredentialsDto } from './dto/index.dto';

@Controller('auth')
@ApiTags('authenticate')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/signup')
  @Public()
  @ApiOperation({ summary: 'to signup a new user' })
  signUp(@Body() signUpDto: AuthCredentialsDto.SignUpDto): Promise<void> {
    return this.authService.signUp(signUpDto);
  }

  @Post('/signin')
  @Public()
  @ApiOperation({ summary: 'to login and create access token' })
  signIn(@Body() signInDto: AuthCredentialsDto.SignInDto): Promise<object> {
    return this.authService.signIn(signInDto);
  }

  @Public()
  @Post('reset-password')
  @ApiOperation({ summary: 'to request for reset password by email' })
  requestResetPwdEmail(@Body() dto: RequestResetPwd) {
    return this.authService.requestResetPwdEmail(dto);
  }

  @Public()
  @Get('validate-token')
  @ApiOperation({ summary: 'to validate reset password token' })
  validateToken(@Query() dto: FindByTokenQuery) {
    return this.authService.findByResetPwdToken(dto);
  }

  @Public()
  @Patch('password')
  @ApiOperation({ summary: 'to update password with token' })
  resetPwd(@Body() dto: ResetPwd) {
    return this.authService.resetPwd(dto);
  }

  @Public()
  @Get('activate-account')
  @ApiOperation({ summary: 'to activate account with token' })
  activateAccount(@Query() dto: FindByTokenQuery) {
    return this.authService.activateAccount(dto);
  }
}
