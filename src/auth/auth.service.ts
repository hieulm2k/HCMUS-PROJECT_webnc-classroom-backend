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
      const payload: JwtPayload = { email };
      const accessToken: string = await this.jwtService.sign(payload);
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        studentId: user.studentId,
        accessToken,
      };
    } else {
      throw new UnauthorizedException('Please check your login credentials');
    }
  }
}
