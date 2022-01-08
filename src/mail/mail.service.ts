import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { Role } from 'src/auth/enum/role.enum';
import { Classroom } from 'src/classrooms/classroom.entity';
import { User } from 'src/user/user.entity';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  sendInviteJoinClassroom(
    userName: string,
    email: string,
    role: Role,
    classroom: Classroom,
  ) {
    const { name, code } = classroom;
    const link =
      process.env.FE_URL +
      '/classrooms/' +
      classroom.id +
      '/join?code=' +
      code +
      '&role=' +
      role;

    return this.mailerService.sendMail({
      to: email,
      subject: 'Webnc Classroom - Join classroom by email',
      html:
        userName +
        ' invite you to join classroom "' +
        name +
        '", please click this link to join: ' +
        link,
    });
  }

  sendResetPwdMail(email: string, token: string) {
    const link = process.env.FE_URL + '/reset-password?token=' + token;

    return this.mailerService.sendMail({
      to: email,
      subject: 'Webnc Classroom - Reset your password',
      html: 'Click the following link to reset your password: ' + link,
    });
  }

  sendActivationMail(target: User) {
    const link = process.env.FE_URL + '/activation?token=' + target.token;

    return this.mailerService.sendMail({
      to: target.email,
      subject: 'Webnc Classroom - Account activation',
      html: 'Please click the following link to activate your account: ' + link,
    });
  }
}
