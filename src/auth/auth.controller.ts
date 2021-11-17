import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { AuthCredentialsDto } from './dto/index.dto';

@Controller('auth')
@ApiTags('authenticate')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/signup')
  @Public()
  signUp(@Body() signUpDto: AuthCredentialsDto.SignUpDto): Promise<void> {
    return this.authService.signUp(signUpDto);
  }

  @Post('/signin')
  @Public()
  signIn(@Body() signInDto: AuthCredentialsDto.SignInDto): Promise<object> {
    return this.authService.signIn(signInDto);
  }
}
