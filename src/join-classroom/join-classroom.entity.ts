import { Role } from 'src/auth/enum/role.enum';
import { Classroom } from 'src/classrooms/classroom.entity';
import { User } from 'src/user/user.entity';
import { BaseEntity } from 'src/utils/base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity()
export class JoinClassroom extends BaseEntity {
  @Column({ enum: Role, type: 'enum', array: true })
  roles: Role[];

  @ManyToOne(() => User, (user) => user.joinClassrooms, {
    eager: false,
  })
  @JoinColumn()
  user: User;

  @ManyToOne(() => Classroom, (classroom) => classroom.joinClassrooms, {
    eager: false,
  })
  @JoinColumn()
  classroom: Classroom;
}
