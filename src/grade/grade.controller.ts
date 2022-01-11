import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import { User } from 'src/user/user.entity';
import { RequestReviewDto } from './dto/update-grade.dto';
import { Grade } from './grade.entity';
import { GradeService } from './grade.service';

@Controller('grade')
@ApiTags('grade')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class GradeController {
  constructor(private gradeService: GradeService) {}

  @Get(':classroomId/request-review')
  @ApiOperation({
    summary: 'to get all request reviews of teacher by classroom Id',
  })
  getAllRequestReview(
    @Param('classroomId', ParseUUIDPipe) classroomId: string,
    @GetUser() user: User,
  ): Promise<Grade[]> {
    return this.gradeService.getAllRequestReviews(classroomId, user);
  }

  @Post(':id/request-review')
  @ApiOperation({ summary: 'to request grade review of current student' })
  requestReview(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser() user: User,
    @Body() dto: RequestReviewDto,
  ): Promise<void> {
    return this.gradeService.requestReview(id, user, dto);
  }
}
