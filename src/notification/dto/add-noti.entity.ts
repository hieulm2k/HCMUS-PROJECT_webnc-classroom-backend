import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { Grade } from 'src/grade/grade.entity';
import { User } from 'src/user/user.entity';
import { NotificationStatus, NotificationType } from '../notification.entity';

export class AddNotificationDto {
  @ApiProperty()
  @IsNotEmpty()
  receiver: User;

  @ApiProperty()
  @IsNotEmpty()
  grade: Grade;

  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(NotificationStatus)
  status: NotificationStatus;

  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(NotificationType)
  type: NotificationType;
}
