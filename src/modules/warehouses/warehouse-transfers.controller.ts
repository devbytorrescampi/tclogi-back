import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { WarehouseTransfersService } from './warehouse-transfers.service';
import { CreateWarehouseTransferDto } from './dto/create-warehouse-transfer.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('warehouse-transfers')
export class WarehouseTransfersController {
  constructor(private readonly transfersService: WarehouseTransfersService) {}

  @Post()
  create(@CurrentUser() user: { tenantId: string }, @Body() dto: CreateWarehouseTransferDto) {
    return this.transfersService.create(user.tenantId, dto);
  }

  @Get()
  findAll(@CurrentUser() user: { tenantId: string }) {
    return this.transfersService.findAll(user.tenantId);
  }

  @Get(':id')
  findOne(@CurrentUser() user: { tenantId: string }, @Param('id') id: string) {
    return this.transfersService.findOne(user.tenantId, id);
  }

  @Patch(':id/dispatch')
  dispatch(@CurrentUser() user: { tenantId: string }, @Param('id') id: string) {
    return this.transfersService.dispatch(user.tenantId, id);
  }

  @Patch(':id/receive')
  receive(@CurrentUser() user: { tenantId: string }, @Param('id') id: string) {
    return this.transfersService.receive(user.tenantId, id);
  }

  @Patch(':id/cancel')
  cancel(@CurrentUser() user: { tenantId: string }, @Param('id') id: string) {
    return this.transfersService.cancel(user.tenantId, id);
  }
}
