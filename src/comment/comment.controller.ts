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
import { Comment } from './comment.entity';
import { CommentService } from './comment.service';
import { PostCommentDto } from './dto/post-comment.dto';

@Controller('comment')
@ApiTags('comment')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class CommentController {
  constructor(private commentService: CommentService) {}

  @Get(':gradeId')
  @ApiOperation({ summary: 'to get all comments of a grade review' })
  getAllComments(
    @Param('gradeId', ParseUUIDPipe) gradeId: string,
    @GetUser() user: User,
  ): Promise<Comment[]> {
    return this.commentService.getAllComments(gradeId, user);
  }

  @Post(':gradeId')
  @ApiOperation({ summary: 'to post a comment of a grade review' })
  postComment(
    @Param('gradeId', ParseUUIDPipe) gradeId: string,
    @GetUser() user: User,
    @Body() dto: PostCommentDto,
  ): Promise<void> {
    return this.commentService.postComment(gradeId, user, dto);
  }
}
