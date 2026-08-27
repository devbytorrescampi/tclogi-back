import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Destination } from './destination.entity';
import { CreateDestinationDto } from './dto/create-destination.dto';

@Injectable()
export class DestinationsService {
  constructor(
    @InjectRepository(Destination)
    private readonly destinationRepo: Repository<Destination>,
  ) {}

  create(tenantId: string, dto: CreateDestinationDto) {
    const destination = this.destinationRepo.create({ ...dto, tenantId });
    return this.destinationRepo.save(destination);
  }

  findAll(tenantId: string) {
    return this.destinationRepo.find({ where: { tenantId }, order: { name: 'ASC' } });
  }

  async findOne(tenantId: string, id: string) {
    const destination = await this.destinationRepo.findOne({ where: { id, tenantId } });
    if (!destination) throw new NotFoundException('Destino no encontrado');
    return destination;
  }

  async update(tenantId: string, id: string, dto: Partial<CreateDestinationDto>) {
    const destination = await this.findOne(tenantId, id);
    Object.assign(destination, dto);
    return this.destinationRepo.save(destination);
  }

  async remove(tenantId: string, id: string) {
    const destination = await this.findOne(tenantId, id);
    destination.isActive = false;
    return this.destinationRepo.save(destination);
  }
}
