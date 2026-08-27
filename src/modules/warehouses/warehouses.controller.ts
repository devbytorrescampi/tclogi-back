import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { WarehousesService } from './warehouses.service';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('warehouses')
export class WarehousesController {
  constructor(private readonly warehousesService: WarehousesService) {}

  @Post()
  create(@CurrentUser() user: { tenantId: string }, @Body() dto: CreateWarehouseDto) {
    return this.warehousesService.create(user.tenantId, dto);
  }

  @Get()
  findAll(@CurrentUser() user: { tenantId: string }) {
    return this.warehousesService.findAll(user.tenantId);
  }

  @Get(':id')
  findOne(@CurrentUser() user: { tenantId: string }, @Param('id') id: string) {
    return this.warehousesService.findOne(user.tenantId, id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: { tenantId: string },
    @Param('id') id: string,
    @Body() dto: Partial<CreateWarehouseDto>,
  ) {
    return this.warehousesService.update(user.tenantId, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: { tenantId: string }, @Param('id') id: string) {
    return this.warehousesService.remove(user.tenantId, id);
  }
}
