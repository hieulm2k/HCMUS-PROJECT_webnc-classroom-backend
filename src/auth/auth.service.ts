import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthCredentialsDto } from './dto/index.dto';
import { UsersRepository } from '../user/users.repository';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UsersRepository)
    private userRepository: UsersRepository,
    private jwtService: JwtService,
  ) {}

  async signUp(signUpDto: AuthCredentialsDto.SignUpDto): Promise<void> {
    return this.userRepository.createUser(signUpDto);
  }

  async signIn(signInDto: AuthCredentialsDto.SignInDto): Promise<object> {
    const { email, password } = signInDto;
    const user = await this.userRepository.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      const accessToken = await this.getJwtAccessToken(user.email);
      return {
        user: user,
        accessToken,
      };
    } else {
      throw new UnauthorizedException('Please check your login credentials');
    }
  }

  async getJwtAccessToken(email: string) {
    const payload: JwtPayload = { email };
    const accessToken: string = await this.jwtService.sign(payload);
    return accessToken;
  }
}
