import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ShipmentsService } from './shipments.service';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { CreateRouteDto } from './dto/create-route.dto';
import { ProofOfDeliveryDto } from './dto/proof-of-delivery.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller()
export class ShipmentsController {
  constructor(private readonly shipmentsService: ShipmentsService) {}

  @Post('shipments')
  create(@CurrentUser() user: { tenantId: string }, @Body() dto: CreateShipmentDto) {
    return this.shipmentsService.createShipment(user.tenantId, dto);
  }

  @Get('shipments')
  findAll(@CurrentUser() user: { tenantId: string }) {
    return this.shipmentsService.findAll(user.tenantId);
  }

  @Get('shipments/:id')
  findOne(@CurrentUser() user: { tenantId: string }, @Param('id') id: string) {
    return this.shipmentsService.findOne(user.tenantId, id);
  }

  @Post('shipments/:id/proof-of-delivery')
  deliver(
    @CurrentUser() user: { tenantId: string },
    @Param('id') id: string,
    @Body() dto: ProofOfDeliveryDto,
  ) {
    return this.shipmentsService.deliverShipment(user.tenantId, id, dto);
  }

  @Post('shipments/:id/cost')
  recordCost(
    @CurrentUser() user: { tenantId: string },
    @Param('id') id: string,
    @Body()
    dto: { fuelCost?: number; driverCost?: number; otherCost?: number; distanceKm?: number },
  ) {
    return this.shipmentsService.recordCost(user.tenantId, id, dto);
  }

  @Post('routes')
  createRoute(@CurrentUser() user: { tenantId: string }, @Body() dto: CreateRouteDto) {
    return this.shipmentsService.createRoute(user.tenantId, dto);
  }

  @Patch('routes/:id/dispatch')
  dispatchRoute(@CurrentUser() user: { tenantId: string }, @Param('id') id: string) {
    return this.shipmentsService.dispatchRoute(user.tenantId, id);
  }
}
