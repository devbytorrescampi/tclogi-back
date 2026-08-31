import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Not, Repository } from 'typeorm';
import { User } from './user.entity';
import { UserRole } from '../../common/enums/user-role.enum';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  async create(tenantId: string, dto: CreateUserDto) {
    const existing = await this.userRepo.findOne({ where: { tenantId, email: dto.email } });
    if (existing) {
      throw new ConflictException('Ya existe un usuario con ese email en tu empresa');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = this.userRepo.create({
      tenantId,
      fullName: dto.fullName,
      email: dto.email,
      passwordHash,
      role: dto.role ?? UserRole.WAREHOUSE_OPERATOR,
    });
    return this.sanitize(await this.userRepo.save(user));
  }

  async findAll(tenantId: string) {
    const users = await this.userRepo.find({ where: { tenantId }, order: { fullName: 'ASC' } });
    return users.map((u) => this.sanitize(u));
  }

  async findAllLite(tenantId: string) {
    const users = await this.userRepo.find({
      where: { tenantId, isActive: true },
      order: { fullName: 'ASC' },
    });
    return users.map((u) => ({ id: u.id, fullName: u.fullName, role: u.role }));
  }

  async findOne(tenantId: string, id: string) {
    const user = await this.userRepo.findOne({ where: { id, tenantId } });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user;
  }

  async findMe(tenantId: string, id: string) {
    return this.sanitize(await this.findOne(tenantId, id));
  }

  private async assertNotLastActiveAdmin(tenantId: string, userId: string) {
    const otherActiveAdmins = await this.userRepo.count({
      where: { tenantId, role: UserRole.ADMIN, isActive: true, id: Not(userId) },
    });
    if (otherActiveAdmins === 0) {
      throw new BadRequestException(
        'No podés quitarle el rol de administrador o desactivar al único admin activo de la empresa',
      );
    }
  }

  async update(tenantId: string, id: string, dto: UpdateUserDto) {
    const user = await this.findOne(tenantId, id);

    const losingAdmin =
      user.role === UserRole.ADMIN &&
      ((dto.role !== undefined && dto.role !== UserRole.ADMIN) || dto.isActive === false);
    if (losingAdmin) {
      await this.assertNotLastActiveAdmin(tenantId, id);
    }

    if (dto.fullName !== undefined) user.fullName = dto.fullName;
    if (dto.role !== undefined) user.role = dto.role;
    if (dto.isActive !== undefined) user.isActive = dto.isActive;
    if (dto.password) {
      user.passwordHash = await bcrypt.hash(dto.password, 10);
      user.tokenVersion += 1; // force re-login on other devices
    }

    return this.sanitize(await this.userRepo.save(user));
  }

  private sanitize(user: User) {
    const { passwordHash: _passwordHash, ...rest } = user;
    return rest;
  }
}
