import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { FleetService } from './fleet.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { CreateDriverDto } from './dto/create-driver.dto';
import { CreateTrailerDto } from './dto/create-trailer.dto';
import { CreateMaintenanceDto } from './dto/create-maintenance.dto';
import { CreateVehicleTypeDto } from './dto/create-vehicle-type.dto';
import { CreateDriverLicenseTypeDto } from './dto/create-driver-license-type.dto';
import { CreateTrailerTypeDto } from './dto/create-trailer-type.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller()
export class FleetController {
  constructor(private readonly fleetService: FleetService) {}

  @Post('vehicles')
  createVehicle(@CurrentUser() user: { tenantId: string }, @Body() dto: CreateVehicleDto) {
    return this.fleetService.createVehicle(user.tenantId, dto);
  }

  @Get('vehicles')
  findAllVehicles(@CurrentUser() user: { tenantId: string }) {
    return this.fleetService.findAllVehicles(user.tenantId);
  }

  @Get('vehicles/:id')
  findVehicle(@CurrentUser() user: { tenantId: string }, @Param('id') id: string) {
    return this.fleetService.findVehicle(user.tenantId, id);
  }

  @Patch('vehicles/:id')
  updateVehicle(
    @CurrentUser() user: { tenantId: string },
    @Param('id') id: string,
    @Body() dto: Partial<CreateVehicleDto>,
  ) {
    return this.fleetService.updateVehicle(user.tenantId, id, dto);
  }

  @Delete('vehicles/:id')
  removeVehicle(@CurrentUser() user: { tenantId: string }, @Param('id') id: string) {
    return this.fleetService.removeVehicle(user.tenantId, id);
  }

  @Post('drivers')
  createDriver(@CurrentUser() user: { tenantId: string }, @Body() dto: CreateDriverDto) {
    return this.fleetService.createDriver(user.tenantId, dto);
  }

  @Get('drivers')
  findAllDrivers(@CurrentUser() user: { tenantId: string }) {
    return this.fleetService.findAllDrivers(user.tenantId);
  }

  @Get('drivers/:id')
  findDriver(@CurrentUser() user: { tenantId: string }, @Param('id') id: string) {
    return this.fleetService.findDriver(user.tenantId, id);
  }

  @Patch('drivers/:id')
  updateDriver(
    @CurrentUser() user: { tenantId: string },
    @Param('id') id: string,
    @Body() dto: Partial<CreateDriverDto>,
  ) {
    return this.fleetService.updateDriver(user.tenantId, id, dto);
  }

  @Delete('drivers/:id')
  removeDriver(@CurrentUser() user: { tenantId: string }, @Param('id') id: string) {
    return this.fleetService.removeDriver(user.tenantId, id);
  }

  @Post('trailers')
  createTrailer(@CurrentUser() user: { tenantId: string }, @Body() dto: CreateTrailerDto) {
    return this.fleetService.createTrailer(user.tenantId, dto);
  }

  @Get('trailers')
  findAllTrailers(@CurrentUser() user: { tenantId: string }) {
    return this.fleetService.findAllTrailers(user.tenantId);
  }

  @Get('trailers/:id')
  findTrailer(@CurrentUser() user: { tenantId: string }, @Param('id') id: string) {
    return this.fleetService.findTrailer(user.tenantId, id);
  }

  @Patch('trailers/:id')
  updateTrailer(
    @CurrentUser() user: { tenantId: string },
    @Param('id') id: string,
    @Body() dto: Partial<CreateTrailerDto>,
  ) {
    return this.fleetService.updateTrailer(user.tenantId, id, dto);
  }

  @Delete('trailers/:id')
  removeTrailer(@CurrentUser() user: { tenantId: string }, @Param('id') id: string) {
    return this.fleetService.removeTrailer(user.tenantId, id);
  }

  @Post('vehicles/:vehicleId/maintenances')
  createVehicleMaintenance(
    @CurrentUser() user: { tenantId: string },
    @Param('vehicleId') vehicleId: string,
    @Body() dto: CreateMaintenanceDto,
  ) {
    return this.fleetService.createVehicleMaintenance(user.tenantId, vehicleId, dto);
  }

  @Get('vehicles/:vehicleId/maintenances')
  findAllVehicleMaintenances(
    @CurrentUser() user: { tenantId: string },
    @Param('vehicleId') vehicleId: string,
  ) {
    return this.fleetService.findAllVehicleMaintenances(user.tenantId, vehicleId);
  }

  @Patch('vehicles/:vehicleId/maintenances/:id')
  updateVehicleMaintenance(
    @CurrentUser() user: { tenantId: string },
    @Param('vehicleId') vehicleId: string,
    @Param('id') id: string,
    @Body() dto: Partial<CreateMaintenanceDto>,
  ) {
    return this.fleetService.updateVehicleMaintenance(user.tenantId, vehicleId, id, dto);
  }

  @Delete('vehicles/:vehicleId/maintenances/:id')
  removeVehicleMaintenance(
    @CurrentUser() user: { tenantId: string },
    @Param('vehicleId') vehicleId: string,
    @Param('id') id: string,
  ) {
    return this.fleetService.removeVehicleMaintenance(user.tenantId, vehicleId, id);
  }

  @Post('trailers/:trailerId/maintenances')
  createTrailerMaintenance(
    @CurrentUser() user: { tenantId: string },
    @Param('trailerId') trailerId: string,
    @Body() dto: CreateMaintenanceDto,
  ) {
    return this.fleetService.createTrailerMaintenance(user.tenantId, trailerId, dto);
  }

  @Get('trailers/:trailerId/maintenances')
  findAllTrailerMaintenances(
    @CurrentUser() user: { tenantId: string },
    @Param('trailerId') trailerId: string,
  ) {
    return this.fleetService.findAllTrailerMaintenances(user.tenantId, trailerId);
  }

  @Patch('trailers/:trailerId/maintenances/:id')
  updateTrailerMaintenance(
    @CurrentUser() user: { tenantId: string },
    @Param('trailerId') trailerId: string,
    @Param('id') id: string,
    @Body() dto: Partial<CreateMaintenanceDto>,
  ) {
    return this.fleetService.updateTrailerMaintenance(user.tenantId, trailerId, id, dto);
  }

  @Delete('trailers/:trailerId/maintenances/:id')
  removeTrailerMaintenance(
    @CurrentUser() user: { tenantId: string },
    @Param('trailerId') trailerId: string,
    @Param('id') id: string,
  ) {
    return this.fleetService.removeTrailerMaintenance(user.tenantId, trailerId, id);
  }

  @Post('vehicle-types')
  createVehicleType(@CurrentUser() user: { tenantId: string }, @Body() dto: CreateVehicleTypeDto) {
    return this.fleetService.createVehicleType(user.tenantId, dto);
  }

  @Get('vehicle-types')
  findAllVehicleTypes(@CurrentUser() user: { tenantId: string }) {
    return this.fleetService.findAllVehicleTypes(user.tenantId);
  }

  @Delete('vehicle-types/:id')
  removeVehicleType(@CurrentUser() user: { tenantId: string }, @Param('id') id: string) {
    return this.fleetService.removeVehicleType(user.tenantId, id);
  }

  @Post('driver-license-types')
  createDriverLicenseType(
    @CurrentUser() user: { tenantId: string },
    @Body() dto: CreateDriverLicenseTypeDto,
  ) {
    return this.fleetService.createDriverLicenseType(user.tenantId, dto);
  }

  @Get('driver-license-types')
  findAllDriverLicenseTypes(@CurrentUser() user: { tenantId: string }) {
    return this.fleetService.findAllDriverLicenseTypes(user.tenantId);
  }

  @Delete('driver-license-types/:id')
  removeDriverLicenseType(@CurrentUser() user: { tenantId: string }, @Param('id') id: string) {
    return this.fleetService.removeDriverLicenseType(user.tenantId, id);
  }

  @Post('trailer-types')
  createTrailerType(@CurrentUser() user: { tenantId: string }, @Body() dto: CreateTrailerTypeDto) {
    return this.fleetService.createTrailerType(user.tenantId, dto);
  }

  @Get('trailer-types')
  findAllTrailerTypes(@CurrentUser() user: { tenantId: string }) {
    return this.fleetService.findAllTrailerTypes(user.tenantId);
  }

  @Delete('trailer-types/:id')
  removeTrailerType(@CurrentUser() user: { tenantId: string }, @Param('id') id: string) {
    return this.fleetService.removeTrailerType(user.tenantId, id);
  }
}
