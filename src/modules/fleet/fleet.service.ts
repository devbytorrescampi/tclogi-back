import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { Vehicle, VehicleStatus } from './vehicle.entity';
import { VehicleMaintenance } from './vehicle-maintenance.entity';
import { VehicleType } from './vehicle-type.entity';
import { Driver } from './driver.entity';
import { DriverLicenseType } from './driver-license-type.entity';
import { Trailer, TrailerStatus } from './trailer.entity';
import { TrailerMaintenance } from './trailer-maintenance.entity';
import { TrailerType } from './trailer-type.entity';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { CreateDriverDto } from './dto/create-driver.dto';
import { CreateTrailerDto } from './dto/create-trailer.dto';
import { CreateMaintenanceDto } from './dto/create-maintenance.dto';
import { CreateVehicleTypeDto } from './dto/create-vehicle-type.dto';
import { CreateDriverLicenseTypeDto } from './dto/create-driver-license-type.dto';
import { CreateTrailerTypeDto } from './dto/create-trailer-type.dto';
import { PlanLimitService } from '../../common/guards/plan-limit.service';

@Injectable()
export class FleetService {
  constructor(
    @InjectRepository(Vehicle) private readonly vehicleRepo: Repository<Vehicle>,
    @InjectRepository(VehicleMaintenance)
    private readonly vehicleMaintenanceRepo: Repository<VehicleMaintenance>,
    @InjectRepository(VehicleType) private readonly vehicleTypeRepo: Repository<VehicleType>,
    @InjectRepository(Driver) private readonly driverRepo: Repository<Driver>,
    @InjectRepository(DriverLicenseType)
    private readonly driverLicenseTypeRepo: Repository<DriverLicenseType>,
    @InjectRepository(Trailer) private readonly trailerRepo: Repository<Trailer>,
    @InjectRepository(TrailerMaintenance)
    private readonly trailerMaintenanceRepo: Repository<TrailerMaintenance>,
    @InjectRepository(TrailerType) private readonly trailerTypeRepo: Repository<TrailerType>,
    private readonly planLimitService: PlanLimitService,
  ) {}

  private sanitizeMaintenance<T extends { responsibleUser?: { passwordHash?: string } | null }>(
    maintenance: T,
  ) {
    if (!maintenance.responsibleUser) return maintenance;
    const { passwordHash: _passwordHash, ...rest } = maintenance.responsibleUser;
    return { ...maintenance, responsibleUser: rest };
  }

  async createVehicle(tenantId: string, dto: CreateVehicleDto) {
    const currentCount = await this.vehicleRepo.count({
      where: { tenantId, status: Not(VehicleStatus.INACTIVE) },
    });
    await this.planLimitService.assertWithinLimit(tenantId, 'maxVehicles', currentCount);
    const vehicle = this.vehicleRepo.create({ ...dto, tenantId });
    return this.vehicleRepo.save(vehicle);
  }

  findAllVehicles(tenantId: string) {
    return this.vehicleRepo.find({ where: { tenantId }, order: { licensePlate: 'ASC' } });
  }

  async findVehicle(tenantId: string, id: string) {
    const vehicle = await this.vehicleRepo.findOne({ where: { id, tenantId } });
    if (!vehicle) throw new NotFoundException('Vehículo no encontrado');
    return vehicle;
  }

  async updateVehicle(tenantId: string, id: string, dto: Partial<CreateVehicleDto>) {
    const vehicle = await this.findVehicle(tenantId, id);
    Object.assign(vehicle, dto);
    return this.vehicleRepo.save(vehicle);
  }

  async removeVehicle(tenantId: string, id: string) {
    const vehicle = await this.findVehicle(tenantId, id);
    vehicle.status = VehicleStatus.INACTIVE;
    return this.vehicleRepo.save(vehicle);
  }

  createDriver(tenantId: string, dto: CreateDriverDto) {
    const driver = this.driverRepo.create({ ...dto, tenantId });
    return this.driverRepo.save(driver);
  }

  findAllDrivers(tenantId: string) {
    return this.driverRepo.find({ where: { tenantId }, order: { fullName: 'ASC' } });
  }

  async findDriver(tenantId: string, id: string) {
    const driver = await this.driverRepo.findOne({ where: { id, tenantId } });
    if (!driver) throw new NotFoundException('Chofer no encontrado');
    return driver;
  }

  async updateDriver(tenantId: string, id: string, dto: Partial<CreateDriverDto>) {
    const driver = await this.findDriver(tenantId, id);
    Object.assign(driver, dto);
    return this.driverRepo.save(driver);
  }

  async removeDriver(tenantId: string, id: string) {
    const driver = await this.findDriver(tenantId, id);
    driver.isActive = false;
    return this.driverRepo.save(driver);
  }

  createTrailer(tenantId: string, dto: CreateTrailerDto) {
    const trailer = this.trailerRepo.create({ ...dto, tenantId });
    return this.trailerRepo.save(trailer);
  }

  findAllTrailers(tenantId: string) {
    return this.trailerRepo.find({ where: { tenantId }, order: { licensePlate: 'ASC' } });
  }

  async findTrailer(tenantId: string, id: string) {
    const trailer = await this.trailerRepo.findOne({ where: { id, tenantId } });
    if (!trailer) throw new NotFoundException('Acoplado no encontrado');
    return trailer;
  }

  async updateTrailer(tenantId: string, id: string, dto: Partial<CreateTrailerDto>) {
    const trailer = await this.findTrailer(tenantId, id);
    Object.assign(trailer, dto);
    return this.trailerRepo.save(trailer);
  }

  async removeTrailer(tenantId: string, id: string) {
    const trailer = await this.findTrailer(tenantId, id);
    trailer.status = TrailerStatus.INACTIVE;
    return this.trailerRepo.save(trailer);
  }

  async createVehicleMaintenance(
    tenantId: string,
    vehicleId: string,
    dto: CreateMaintenanceDto,
  ) {
    await this.findVehicle(tenantId, vehicleId);
    const maintenance = this.vehicleMaintenanceRepo.create({
      ...dto,
      tenantId,
      vehicleId,
    });
    return this.vehicleMaintenanceRepo.save(maintenance);
  }

  async findAllVehicleMaintenances(tenantId: string, vehicleId: string) {
    await this.findVehicle(tenantId, vehicleId);
    const maintenances = await this.vehicleMaintenanceRepo.find({
      where: { tenantId, vehicleId },
      relations: { responsibleUser: true },
      order: { performedAt: 'DESC' },
    });
    return maintenances.map((m) => this.sanitizeMaintenance(m));
  }

  private async findVehicleMaintenance(tenantId: string, vehicleId: string, id: string) {
    const maintenance = await this.vehicleMaintenanceRepo.findOne({
      where: { id, tenantId, vehicleId },
    });
    if (!maintenance) throw new NotFoundException('Mantenimiento no encontrado');
    return maintenance;
  }

  async updateVehicleMaintenance(
    tenantId: string,
    vehicleId: string,
    id: string,
    dto: Partial<CreateMaintenanceDto>,
  ) {
    const maintenance = await this.findVehicleMaintenance(tenantId, vehicleId, id);
    Object.assign(maintenance, dto);
    return this.vehicleMaintenanceRepo.save(maintenance);
  }

  async removeVehicleMaintenance(tenantId: string, vehicleId: string, id: string) {
    const maintenance = await this.findVehicleMaintenance(tenantId, vehicleId, id);
    await this.vehicleMaintenanceRepo.remove(maintenance);
    return { id };
  }

  async createTrailerMaintenance(
    tenantId: string,
    trailerId: string,
    dto: CreateMaintenanceDto,
  ) {
    await this.findTrailer(tenantId, trailerId);
    const maintenance = this.trailerMaintenanceRepo.create({
      ...dto,
      tenantId,
      trailerId,
    });
    return this.trailerMaintenanceRepo.save(maintenance);
  }

  async findAllTrailerMaintenances(tenantId: string, trailerId: string) {
    await this.findTrailer(tenantId, trailerId);
    const maintenances = await this.trailerMaintenanceRepo.find({
      where: { tenantId, trailerId },
      relations: { responsibleUser: true },
      order: { performedAt: 'DESC' },
    });
    return maintenances.map((m) => this.sanitizeMaintenance(m));
  }

  private async findTrailerMaintenance(tenantId: string, trailerId: string, id: string) {
    const maintenance = await this.trailerMaintenanceRepo.findOne({
      where: { id, tenantId, trailerId },
    });
    if (!maintenance) throw new NotFoundException('Mantenimiento no encontrado');
    return maintenance;
  }

  async updateTrailerMaintenance(
    tenantId: string,
    trailerId: string,
    id: string,
    dto: Partial<CreateMaintenanceDto>,
  ) {
    const maintenance = await this.findTrailerMaintenance(tenantId, trailerId, id);
    Object.assign(maintenance, dto);
    return this.trailerMaintenanceRepo.save(maintenance);
  }

  async removeTrailerMaintenance(tenantId: string, trailerId: string, id: string) {
    const maintenance = await this.findTrailerMaintenance(tenantId, trailerId, id);
    await this.trailerMaintenanceRepo.remove(maintenance);
    return { id };
  }

  async createVehicleType(tenantId: string, dto: CreateVehicleTypeDto) {
    const existing = await this.vehicleTypeRepo.findOne({
      where: { tenantId, name: dto.name },
    });
    if (existing) throw new ConflictException('Ya existe un tipo de vehículo con ese nombre');
    const vehicleType = this.vehicleTypeRepo.create({ ...dto, tenantId });
    return this.vehicleTypeRepo.save(vehicleType);
  }

  findAllVehicleTypes(tenantId: string) {
    return this.vehicleTypeRepo.find({ where: { tenantId }, order: { name: 'ASC' } });
  }

  async removeVehicleType(tenantId: string, id: string) {
    const vehicleType = await this.vehicleTypeRepo.findOne({ where: { id, tenantId } });
    if (!vehicleType) throw new NotFoundException('Tipo de vehículo no encontrado');
    await this.vehicleTypeRepo.remove(vehicleType);
    return { id };
  }

  async createDriverLicenseType(tenantId: string, dto: CreateDriverLicenseTypeDto) {
    const existing = await this.driverLicenseTypeRepo.findOne({
      where: { tenantId, name: dto.name },
    });
    if (existing) throw new ConflictException('Ya existe una categoría de licencia con ese nombre');
    const licenseType = this.driverLicenseTypeRepo.create({ ...dto, tenantId });
    return this.driverLicenseTypeRepo.save(licenseType);
  }

  findAllDriverLicenseTypes(tenantId: string) {
    return this.driverLicenseTypeRepo.find({ where: { tenantId }, order: { name: 'ASC' } });
  }

  async removeDriverLicenseType(tenantId: string, id: string) {
    const licenseType = await this.driverLicenseTypeRepo.findOne({ where: { id, tenantId } });
    if (!licenseType) throw new NotFoundException('Categoría de licencia no encontrada');
    await this.driverLicenseTypeRepo.remove(licenseType);
    return { id };
  }

  async createTrailerType(tenantId: string, dto: CreateTrailerTypeDto) {
    const existing = await this.trailerTypeRepo.findOne({
      where: { tenantId, name: dto.name },
    });
    if (existing) throw new ConflictException('Ya existe un tipo de acoplado con ese nombre');
    const trailerType = this.trailerTypeRepo.create({ ...dto, tenantId });
    return this.trailerTypeRepo.save(trailerType);
  }

  findAllTrailerTypes(tenantId: string) {
    return this.trailerTypeRepo.find({ where: { tenantId }, order: { name: 'ASC' } });
  }

  async removeTrailerType(tenantId: string, id: string) {
    const trailerType = await this.trailerTypeRepo.findOne({ where: { id, tenantId } });
    if (!trailerType) throw new NotFoundException('Tipo de acoplado no encontrado');
    await this.trailerTypeRepo.remove(trailerType);
    return { id };
  }
}
