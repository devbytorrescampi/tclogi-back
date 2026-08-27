import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';

@Controller('users')
@Roles(UserRole.ADMIN)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@CurrentUser() user: { tenantId: string }, @Body() dto: CreateUserDto) {
    return this.usersService.create(user.tenantId, dto);
  }

  @Get()
  findAll(@CurrentUser() user: { tenantId: string }) {
    return this.usersService.findAll(user.tenantId);
  }

  // Minimal team directory (id/fullName/role of active users) used to
  // populate pickers like "responsable de mantenimiento" — open to any
  // authenticated role, unlike full user management above.
  @Get('directory')
  @Roles()
  findDirectory(@CurrentUser() user: { tenantId: string }) {
    return this.usersService.findAllLite(user.tenantId);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: { tenantId: string },
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
  ) {
    return this.usersService.update(user.tenantId, id, dto);
  }
}
