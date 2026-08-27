import { Controller, Get } from '@nestjs/common';
import { PlansService } from './plans.service';
import { Public } from '../../common/decorators/public.decorator';

@Controller('plans')
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  @Public()
  @Get()
  findAll() {
    return this.plansService.findAllVisible();
  }
}
