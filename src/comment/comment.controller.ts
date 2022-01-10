import {
  Body,
  Controller,
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

  @Post(':gradeId')
  @ApiOperation({ summary: 'to post a comment of a grade review' })
  postComment(
    @Param('gradeId', ParseUUIDPipe) gradeId: string,
    @GetUser() user: User,
    @Body() dto: PostCommentDto,
  ): Promise<Comment> {
    return this.commentService.postComment(gradeId, user, dto);
  }
}
