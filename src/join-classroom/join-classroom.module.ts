import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { JoinClassroomRepository } from './join-classroom.repository';
import { JoinClassroomService } from './join-classroom.service';

@Module({
  imports: [TypeOrmModule.forFeature([JoinClassroomRepository]), AuthModule],
  providers: [JoinClassroomService],
  exports: [JoinClassroomService],
})
export class JoinClassroomModule {}
