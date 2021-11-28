import { GradeStructure } from 'src/grade-structure/grade-structure.entity';
import { BaseEntity } from 'src/utils/base.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { JoinClassroom } from '../join-classroom/join-classroom.entity';

@Entity()
export class Classroom extends BaseEntity {
  @Column()
  name: string;

  @Column({ unique: true })
  code: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  section: string;

  @Column({ nullable: true })
  subject: string;

  @Column({ nullable: true })
  room: string;

  @OneToMany(
    (_type) => JoinClassroom,
    (joinClassroom) => joinClassroom.classroom,
    {
      eager: true,
    },
  )
  joinClassrooms: JoinClassroom[];

  @OneToMany(
    (_type) => GradeStructure,
    (gradeStructure) => gradeStructure.classroom,
    {
      eager: true,
    },
  )
  gradeStructures: GradeStructure[];
}
