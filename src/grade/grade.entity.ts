import { GradeStructure } from 'src/grade-structure/grade-structure.entity';
import { BaseEntity } from 'src/utils/base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity()
export class Grade extends BaseEntity {
  @Column()
  studentId: string;

  @Column({ nullable: true, default: null })
  name: string;

  @Column({ type: 'double precision', nullable: true, default: null })
  grade: number;

  @Column({ default: false })
  isFinalize: boolean;

  @Column({ default: false })
  isReported: boolean;

  @Column({ type: 'double precision', nullable: true, default: null })
  expectedGrade: number;

  @Column({ nullable: true, default: null })
  message: string;

  @Column({ type: 'uuid' })
  classroomId: string;

  @Column({ type: 'uuid', nullable: true, default: null })
  userId: string;

  @ManyToOne(
    (_type) => GradeStructure,
    (gradeStructure) => gradeStructure.grades,
    {
      eager: false,
    },
  )
  @JoinColumn()
  gradeStructure: GradeStructure;
}
