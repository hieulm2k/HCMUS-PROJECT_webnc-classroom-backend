import { Exclude } from 'class-transformer';
import { Comment } from 'src/comment/comment.entity';
import { GradeStructure } from 'src/grade-structure/grade-structure.entity';
import { Notification } from 'src/notification/notification.entity';
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

  @ManyToOne(() => GradeStructure, (gradeStructure) => gradeStructure.grades, {
    eager: false,
  })
  @JoinColumn()
  gradeStructure: GradeStructure;

  @OneToMany(() => Comment, (comment) => comment.grade)
  @Exclude({ toPlainOnly: true })
  comments: Comment[];

  @OneToMany(() => Notification, (notification) => notification.grade)
  @Exclude({ toPlainOnly: true })
  notifications: Notification[];
}
