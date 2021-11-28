import { Classroom } from 'src/classrooms/classroom.entity';
import { BaseEntity } from 'src/utils/base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity()
export class GradeStructure extends BaseEntity {
  @Column({ unique: true })
  name: string;

  @Column({ type: 'double' })
  grade: number;

  @Column({ type: 'int' })
  priority: number;

  @ManyToOne((_type) => Classroom, (classroom) => classroom.joinClassrooms, {
    eager: false,
  })
  @JoinColumn()
  classroom: Classroom;
}
