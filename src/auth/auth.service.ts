import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthCredentialsDto } from './dto/index.dto';
import { UsersRepository } from '../user/users.repository';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './jwt-payload.interface';
import * as moment from 'moment';
import {
  FindByTokenQuery,
  RequestResetPwd,
  ResetPwd,
} from 'src/user/dto/user.dto';
import { UserStatus } from 'src/user/user.entity';
import { randomBytes } from 'crypto';
import { MailService } from 'src/mail/mail.service';
import { Role } from './enum/role.enum';

const PWD_TOKEN_EXPIRATION = 3; //in days

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UsersRepository)
    private userRepository: UsersRepository,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  async signUp(signUpDto: AuthCredentialsDto.SignUpDto): Promise<void> {
    const user = await this.userRepository.createUser(signUpDto);
    try {
      return this.mailService.sendActivationMail(user);
    } catch (error) {
      await this.userRepository.delete({ id: user.id });
      throw new BadRequestException('Email is not available!');
    }
  }

  async signIn(signInDto: AuthCredentialsDto.SignInDto): Promise<object> {
    const { email, password } = signInDto;
    const user = await this.userRepository.findOne({ email });

    if (user && user.isRegisteredWithGoogle) {
      throw new BadRequestException('Please login this email with google');
    }

    if (
      user &&
      user.status === UserStatus.ACTIVE &&
      (await bcrypt.compare(password, user.password))
    ) {
      const accessToken = await this.getJwtAccessToken(user.email);
      return {
        user: user,
        accessToken,
      };
    }

    if (user && user.status === UserStatus.BANNED) {
      throw new BadRequestException('Your account banned by admin');
    }

    throw new UnauthorizedException('Please check your login credentials');
  }

  async getJwtAccessToken(email: string) {
    const payload: JwtPayload = { email };
    const accessToken: string = await this.jwtService.sign(payload);
    return accessToken;
  }

  async requestResetPwdEmail(dto: RequestResetPwd) {
    const user = await this.userRepository.findOne({
      where: { email: dto.email },
    });

    if (!user || user.status === UserStatus.UNCONFIRMED)
      throw new BadRequestException('User does not exist');

    if (user && String(user.isRegisteredWithGoogle) === 'true') {
      throw new BadRequestException(
        'Cannot reset password because you are login with google',
      );
    }

    const token = randomBytes(48).toString('base64');

    return this.mailService
      .sendResetPwdMail(user.email, token)
      .then(async () => {
        user.token = token;
        user.tokenExpiration = moment()
          .add(PWD_TOKEN_EXPIRATION, 'days')
          .toDate();

        await this.userRepository.save(user);
        return true;
      });
  }

  async findByResetPwdToken(dto: FindByTokenQuery) {
    const user = await this.userRepository.findOne({
      where: { token: dto.token },
    });

    if (!user) throw new BadRequestException('Token does not exist');

    return true;
  }

  async resetPwd(dto: ResetPwd) {
    const user = await this.userRepository.findOne({
      where: { token: dto.token },
    });

    if (!user || (user.role === Role.USER && user.status !== UserStatus.ACTIVE))
      throw new BadRequestException('User does not exist');

    if (moment().isSameOrAfter(user.tokenExpiration)) {
      throw new BadRequestException('Token has expired');
    }
    const salt = await bcrypt.genSalt();
    user.password = await bcrypt.hash(dto.password, salt);
    user.status = UserStatus.ACTIVE;
    user.token = null;
    user.tokenExpiration = null;

    return this.userRepository.save(user);
  }

  async activateAccount(dto: FindByTokenQuery) {
    const user = await this.userRepository.findOne({
      where: { token: dto.token },
    });

    if (
      !user ||
      user.status !== UserStatus.UNCONFIRMED ||
      user.role === Role.ADMIN
    )
      throw new BadRequestException('Activate account fail');

    if (moment().isSameOrAfter(user.tokenExpiration)) {
      throw new BadRequestException('Token has expired');
    }

    user.status = UserStatus.ACTIVE;
    user.token = null;
    user.tokenExpiration = null;

    return this.userRepository.save(user);
  }
}
