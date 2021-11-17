import { Controller, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt.guard';

@Controller('join-classroom')
@ApiTags('join-classroom')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class JoinClassroomController {}
