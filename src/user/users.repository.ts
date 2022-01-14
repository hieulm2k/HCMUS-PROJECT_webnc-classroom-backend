import {
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { EntityRepository, Repository } from 'typeorm';
import { User, UserStatus } from './user.entity';
import * as bcrypt from 'bcrypt';
import * as moment from 'moment';
import { AuthCredentialsDto } from '../auth/dto/index.dto';
import { randomBytes } from 'crypto';
import { CreateAdmin } from './dto/user.dto';

const PWD_TOKEN_EXPIRATION = 3; //in days

@EntityRepository(User)
export class UsersRepository extends Repository<User> {
  async createUser(signUpDto: AuthCredentialsDto.SignUpDto): Promise<User> {
    const { email, password, name } = signUpDto;
    const token = randomBytes(48).toString('base64');
    // hash
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = this.create({
      email,
      password: hashedPassword,
      name,
      status: UserStatus.UNCONFIRMED,
      token: token,
      tokenExpiration: moment().add(PWD_TOKEN_EXPIRATION, 'days').toDate(),
    });

    try {
      return await this.save(user);
    } catch (error) {
      if (error.code === '23505') {
        // duplicate email
        throw new ConflictException('Email already exists');
      } else {
        throw new InternalServerErrorException();
      }
    }
  }

  async createAdmin(dto: CreateAdmin): Promise<User> {
    const { email, name } = dto;
    const token = randomBytes(48).toString('base64');

    const user = this.create({
      email,
      name,
      status: UserStatus.UNCONFIRMED,
      token: token,
      tokenExpiration: moment().add(PWD_TOKEN_EXPIRATION, 'days').toDate(),
    });

    try {
      return await this.save(user);
    } catch (error) {
      if (error.code === '23505') {
        // duplicate email
        throw new ConflictException('Email already exists');
      } else {
        throw new InternalServerErrorException();
      }
    }
  }
}
