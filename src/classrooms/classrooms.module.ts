import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JoinClassroomModule } from 'src/join-classroom/join-classroom.module';
import { UserModule } from 'src/user/user.module';
import { AuthModule } from '../auth/auth.module';
import { ClassroomsRepository } from './classroom.repository';
import { ClassroomsController } from './classrooms.controller';
import { ClassroomsService } from './classrooms.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ClassroomsRepository]),
    AuthModule,
    JoinClassroomModule,
    UserModule,
  ],
  controllers: [ClassroomsController],
  providers: [ClassroomsService],
})
export class ClassroomsModule {}
