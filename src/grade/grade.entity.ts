import { GradeStructure } from 'src/grade-structure/grade-structure.entity';
import { BaseEntity } from 'src/utils/base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity()
export class Grade extends BaseEntity {
  @Column()
  studentId: string;

  @Column()
  name: string;

  @Column({ type: 'double precision', nullable: true, default: null })
  grade: number;

  @Column({ default: false })
  isFinalize: boolean;

  @Column({ type: 'uuid' })
  classroomId: string;

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
