import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Classroom {
  @PrimaryGeneratedColumn('uuid')
  id: string;

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
}
