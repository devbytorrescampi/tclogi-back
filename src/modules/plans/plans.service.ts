import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Plan } from './plan.entity';

@Injectable()
export class PlansService {
  constructor(
    @InjectRepository(Plan) private readonly planRepo: Repository<Plan>,
  ) {}

  findAllVisible() {
    return this.planRepo.find({
      where: { isActive: true, isVisible: true },
      order: { sortOrder: 'ASC' },
    });
  }
}
