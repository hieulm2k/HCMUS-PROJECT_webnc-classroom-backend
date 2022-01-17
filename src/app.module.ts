import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassroomsModule } from './classrooms/classrooms.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { configValidationSchema } from './config.schema';
import { AuthModule } from './auth/auth.module';
import { UserController } from './user/user.controller';
import { UserModule } from './user/user.module';
import { JoinClassroomModule } from './join-classroom/join-classroom.module';
import { GoogleAuthenticationModule } from './google-authentication/google-authentication.module';
import { MailModule } from './mail/mail.module';
import { GradeStructureModule } from './grade-structure/grade-structure.module';
import { GradeModule } from './grade/grade.module';
import { CommentModule } from './comment/comment.module';
import { NotificationModule } from './notification/notification.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [`.env.stage.${process.env.STAGE}`],
      validationSchema: configValidationSchema,
    }),
    ClassroomsModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const isProduction = configService.get('STAGE') === 'prod';

        return {
          ssl: isProduction,
          extra: {
            ssl: isProduction ? { rejectUnauthorized: false } : null,
          },
          type: 'postgres',
          autoLoadEntities: true,
          synchronize: true,
          host: configService.get('DB_HOST'),
          port: configService.get('DB_PORT'),
          username: configService.get('DB_USERNAME'),
          password: configService.get('DB_PASSWORD'),
          database: configService.get('DB_DATABASE'),
        };
      },
    }),
    AuthModule,
    UserModule,
    JoinClassroomModule,
    GoogleAuthenticationModule,
    MailModule,
    GradeStructureModule,
    GradeModule,
    CommentModule,
    NotificationModule,
  ],
  controllers: [UserController],
})
export class AppModule {}
