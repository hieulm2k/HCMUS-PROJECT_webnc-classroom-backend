import { Exclude } from 'class-transformer';
import { User } from 'src/auth/user.entity';
import { BaseEntity } from 'src/utils/base.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity()
export class Classroom extends BaseEntity {
  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  section: string;

  @Column()
  subject: string;

  @Column()
  room: string;

  @ManyToOne((_type) => User, (user) => user.classrooms, { eager: false })
  @Exclude({ toPlainOnly: true })
  user: User;
}
