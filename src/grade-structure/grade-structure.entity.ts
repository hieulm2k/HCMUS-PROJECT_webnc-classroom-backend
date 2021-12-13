import { Exclude } from 'class-transformer';
import { Classroom } from 'src/classrooms/classroom.entity';
import { Grade } from 'src/grade/grade.entity';
import { BaseEntity } from 'src/utils/base.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';

@Entity()
export class GradeStructure extends BaseEntity {
  @Column()
  name: string;

  @Column({ type: 'double precision' })
  grade: number;

  @Column({ type: 'int' })
  order: number;

  @Column({ default: false })
  isFinalize: boolean;

  @ManyToOne((_type) => Classroom, (classroom) => classroom.joinClassrooms, {
    eager: false,
  })
  @JoinColumn()
  classroom: Classroom;

  @OneToMany((_type) => Grade, (grade) => grade.gradeStructure, {
    eager: true,
  })
  @Exclude({ toPlainOnly: true })
  grades: Grade[];
}
