import {
  Body,
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
import { UpdateUserDto } from './dto/user.dto';
import { ChangePwd } from './dto/user.dto';
import { User } from './user.entity';
import { UserService } from './user.service';

@Controller('user')
@ApiTags('user')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('/')
  @ApiOperation({ summary: 'to get current user information' })
  async getCurrentUserInfo(@GetUser() user: User): Promise<User> {
    return user;
  }

  @Patch('/')
  @ApiOperation({ summary: 'to update current user' })
  updateUser(
    @Body() updateUserDto: UpdateUserDto,
    @GetUser() user: User,
  ): Promise<User> {
    return this.userService.updateUser(user, updateUserDto);
  }

  @Get('/:id')
  @ApiOperation({ summary: 'to get user information by ID' })
  async getUserById(@Param('id', ParseUUIDPipe) id: string): Promise<User> {
    return this.userService.getUserById(id);
  }

  @Patch('password')
  @ApiOperation({ summary: 'to request change password' })
  changePwd(@Body() dto: ChangePwd, @GetUser() user: User) {
    return this.userService.changePwd(dto, user);
  }
}
