import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Headers,
  Param,
  Post,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TrackingService } from './tracking.service';
import { IngestPositionDto } from './dto/ingest-position.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';

@Controller('tracking')
export class TrackingController {
  constructor(
    private readonly trackingService: TrackingService,
    private readonly configService: ConfigService,
  ) {}

  // Called by the GPS provider's webhook. Tenant is resolved from the
  // vehicle itself since the provider has no notion of our JWT/tenants.
  @Public()
  @Post('ingest')
  ingest(
    @Headers('x-webhook-secret') secret: string,
    @Body() dto: IngestPositionDto & { tenantId: string },
  ) {
    const expected = this.configService.get<string>('TRACKING_WEBHOOK_SECRET');
    if (!expected || secret !== expected) {
      throw new ForbiddenException('Invalid webhook secret');
    }
    return this.trackingService.ingest(dto.tenantId, dto);
  }

  @Get('vehicles/:id/position')
  getVehiclePosition(
    @CurrentUser() user: { tenantId: string },
    @Param('id') vehicleId: string,
  ) {
    return this.trackingService.getVehicleLastPosition(user.tenantId, vehicleId);
  }

  @Get('shipments/:id/location')
  getShipmentLocation(
    @CurrentUser() user: { tenantId: string },
    @Param('id') shipmentId: string,
  ) {
    return this.trackingService.getShipmentLocation(user.tenantId, shipmentId);
  }
}
