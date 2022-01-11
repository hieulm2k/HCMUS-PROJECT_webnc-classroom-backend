import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import { User } from 'src/user/user.entity';
import { Notification } from './notification.entity';
import { NotificationService } from './notification.service';

@Controller('notification')
@ApiTags('notification')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class NotificationController {
  constructor(private notiService: NotificationService) {}

  @Get()
  @ApiOperation({
    summary: 'to get all notifications of current user',
  })
  getAllNotifications(@GetUser() user: User): Promise<Notification[]> {
    return this.notiService.getAllNotifications(user);
  }

  @Patch()
  @ApiOperation({
    summary: 'to update all notifications status to To Read',
  })
  updateToRead(@GetUser() user: User): Promise<void> {
    return this.notiService.updateToRead(user);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'to update a notification status to done',
  })
  updateDone(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser() user: User,
  ): Promise<void> {
    return this.notiService.updateDone(id, user);
  }
}
