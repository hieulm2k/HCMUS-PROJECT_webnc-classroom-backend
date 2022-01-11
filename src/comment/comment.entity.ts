import { Grade } from 'src/grade/grade.entity';
import { User } from 'src/user/user.entity';
import { BaseEntity } from 'src/utils/base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity()
export class Comment extends BaseEntity {
  @ManyToOne(() => User, (user) => user.comments, {
    eager: false,
  })
  @JoinColumn()
  sender: User;

  @ManyToOne(() => Grade, (grade) => grade.comments, {
    eager: false,
  })
  @JoinColumn()
  grade: Grade;

  @Column()
  message: string;
}
