import { Role } from 'src/auth/enum/role.enum';
import { Classroom } from 'src/classrooms/classroom.entity';
import { User } from 'src/user/user.entity';
import { BaseEntity } from 'src/utils/base.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity()
export class JoinClassroom extends BaseEntity {
  @Column({ enum: Role, type: 'enum', array: true })
  role: Role[];

  @ManyToOne((_type) => User, (user: User) => user.joinClassrooms, {
    eager: false,
  })
  user: User;

  @ManyToOne(
    (_type) => Classroom,
    (classroom: Classroom) => classroom.joinClassrooms,
    {
      eager: false,
    },
  )
  classroom: Classroom;
}
