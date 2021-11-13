import { Classroom } from 'src/classrooms/classroom.entity';
import { BaseEntity } from 'src/utils/base.entity';
import { Entity, Column, OneToMany } from 'typeorm';

@Entity()
export class User extends BaseEntity {
  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  studentId: string;

  @OneToMany((_type) => Classroom, (classroom) => classroom.user, {
    eager: true,
  })
  classrooms: Classroom[];
}
