import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { DestinationsService } from './destinations.service';
import { CreateDestinationDto } from './dto/create-destination.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('destinations')
export class DestinationsController {
  constructor(private readonly destinationsService: DestinationsService) {}

  @Post()
  create(@CurrentUser() user: { tenantId: string }, @Body() dto: CreateDestinationDto) {
    return this.destinationsService.create(user.tenantId, dto);
  }

  @Get()
  findAll(@CurrentUser() user: { tenantId: string }) {
    return this.destinationsService.findAll(user.tenantId);
  }

  @Get(':id')
  findOne(@CurrentUser() user: { tenantId: string }, @Param('id') id: string) {
    return this.destinationsService.findOne(user.tenantId, id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: { tenantId: string },
    @Param('id') id: string,
    @Body() dto: Partial<CreateDestinationDto>,
  ) {
    return this.destinationsService.update(user.tenantId, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: { tenantId: string }, @Param('id') id: string) {
    return this.destinationsService.remove(user.tenantId, id);
  }
}
