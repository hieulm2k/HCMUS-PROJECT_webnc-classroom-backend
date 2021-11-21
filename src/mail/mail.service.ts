import { User } from 'src/user/user.entity';
import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { Role } from 'src/auth/enum/role.enum';
import { Classroom } from 'src/classrooms/classroom.entity';

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
      'http://' + process.env.FE_URL + '/join?code=' + code + '?role=' + role;

    return this.mailerService.sendMail({
      to: email,
      subject: 'Webnc Classroom - Join classroom by email',
      html:
        userName +
        ' invite you to join classroom ' +
        name +
        ', please click this link to join: ' +
        link,
    });
  }
}
