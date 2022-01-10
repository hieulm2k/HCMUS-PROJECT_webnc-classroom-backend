import { Exclude } from 'class-transformer';
import { Comment } from 'src/comment/comment.entity';
import { GradeStructure } from 'src/grade-structure/grade-structure.entity';
import { BaseEntity } from 'src/utils/base.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';

export enum ReportStatus {
  NEW = 'New',
  OPEN = 'Open',
  CLOSED = 'Closed',
}

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

  @Column({ enum: ReportStatus, type: 'enum', default: ReportStatus.NEW })
  reportStatus: ReportStatus;

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

  @OneToMany((_type) => Comment, (comment) => comment.grade, {
    eager: true,
  })
  @Exclude({ toPlainOnly: true })
  comments: Comment[];
}
