import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { WarehouseLocationsService } from './warehouse-locations.service';
import { CreateWarehouseLocationDto } from './dto/create-warehouse-location.dto';
import { UpdateWarehouseLocationDto } from './dto/update-warehouse-location.dto';
import { BulkCreateLocationsDto } from './dto/bulk-create-locations.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('warehouses/:warehouseId/locations')
export class WarehouseLocationsController {
  constructor(private readonly locationsService: WarehouseLocationsService) {}

  @Post()
  create(
    @CurrentUser() user: { tenantId: string },
    @Param('warehouseId') warehouseId: string,
    @Body() dto: CreateWarehouseLocationDto,
  ) {
    return this.locationsService.create(user.tenantId, warehouseId, dto);
  }

  @Post('bulk')
  bulkCreate(
    @CurrentUser() user: { tenantId: string },
    @Param('warehouseId') warehouseId: string,
    @Body() dto: BulkCreateLocationsDto,
  ) {
    return this.locationsService.bulkCreate(user.tenantId, warehouseId, dto);
  }

  @Get()
  findAll(
    @CurrentUser() user: { tenantId: string },
    @Param('warehouseId') warehouseId: string,
  ) {
    return this.locationsService.findAll(user.tenantId, warehouseId);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: { tenantId: string },
    @Param('warehouseId') warehouseId: string,
    @Param('id') id: string,
    @Body() dto: UpdateWarehouseLocationDto,
  ) {
    return this.locationsService.update(user.tenantId, warehouseId, id, dto);
  }

  @Delete()
  clearAll(
    @CurrentUser() user: { tenantId: string },
    @Param('warehouseId') warehouseId: string,
  ) {
    return this.locationsService.clearAll(user.tenantId, warehouseId);
  }

  @Delete(':id')
  remove(
    @CurrentUser() user: { tenantId: string },
    @Param('warehouseId') warehouseId: string,
    @Param('id') id: string,
  ) {
    return this.locationsService.remove(user.tenantId, warehouseId, id);
  }
}
