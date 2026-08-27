import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import {
  WarehouseTransfer,
  WarehouseTransferLine,
  WarehouseTransferStatus,
} from './warehouse-transfer.entity';
import { StockMovement, StockMovementType } from './stock-movement.entity';
import { CreateWarehouseTransferDto } from './dto/create-warehouse-transfer.dto';

@Injectable()
export class WarehouseTransfersService {
  constructor(
    @InjectRepository(WarehouseTransfer)
    private readonly transferRepo: Repository<WarehouseTransfer>,
    private readonly dataSource: DataSource,
  ) {}

  async create(tenantId: string, dto: CreateWarehouseTransferDto) {
    if (dto.originWarehouseId === dto.destinationWarehouseId) {
      throw new BadRequestException('El depósito de origen y destino no pueden ser el mismo');
    }

    return this.dataSource.transaction(async (manager) => {
      const transfer = await manager.save(WarehouseTransfer, {
        tenantId,
        originWarehouseId: dto.originWarehouseId,
        destinationWarehouseId: dto.destinationWarehouseId,
        status: WarehouseTransferStatus.PENDING,
      });

      for (const line of dto.lines) {
        await manager.save(WarehouseTransferLine, {
          transferId: transfer.id,
          productId: line.productId,
          quantityInBaseUnit: line.quantityInBaseUnit,
        });
      }

      return transfer;
    });
  }

  findAll(tenantId: string) {
    return this.transferRepo.find({
      where: { tenantId },
      relations: { originWarehouse: true, destinationWarehouse: true, lines: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(tenantId: string, id: string) {
    const transfer = await this.transferRepo.findOne({
      where: { id, tenantId },
      relations: { originWarehouse: true, destinationWarehouse: true, lines: true },
    });
    if (!transfer) throw new NotFoundException('Transferencia no encontrada');
    return transfer;
  }

  async dispatch(tenantId: string, id: string) {
    return this.dataSource.transaction(async (manager) => {
      const transfer = await manager.findOne(WarehouseTransfer, {
        where: { id, tenantId },
        relations: { lines: true },
      });
      if (!transfer) throw new NotFoundException('Transferencia no encontrada');
      if (transfer.status !== WarehouseTransferStatus.PENDING) {
        throw new BadRequestException('Solo se puede despachar una transferencia pendiente');
      }

      for (const line of transfer.lines) {
        await manager.save(StockMovement, {
          tenantId,
          productId: line.productId,
          warehouseId: transfer.originWarehouseId,
          type: StockMovementType.TRANSFER_OUT,
          quantityInBaseUnit: line.quantityInBaseUnit,
          referenceType: 'WAREHOUSE_TRANSFER',
          referenceId: transfer.id,
        });
      }

      transfer.status = WarehouseTransferStatus.IN_TRANSIT;
      transfer.dispatchedAt = new Date();
      return manager.save(WarehouseTransfer, transfer);
    });
  }

  async receive(tenantId: string, id: string) {
    return this.dataSource.transaction(async (manager) => {
      const transfer = await manager.findOne(WarehouseTransfer, {
        where: { id, tenantId },
        relations: { lines: true },
      });
      if (!transfer) throw new NotFoundException('Transferencia no encontrada');
      if (transfer.status !== WarehouseTransferStatus.IN_TRANSIT) {
        throw new BadRequestException('Solo se puede recibir una transferencia en tránsito');
      }

      for (const line of transfer.lines) {
        await manager.save(StockMovement, {
          tenantId,
          productId: line.productId,
          warehouseId: transfer.destinationWarehouseId,
          type: StockMovementType.TRANSFER_IN,
          quantityInBaseUnit: line.quantityInBaseUnit,
          referenceType: 'WAREHOUSE_TRANSFER',
          referenceId: transfer.id,
        });
      }

      transfer.status = WarehouseTransferStatus.RECEIVED;
      transfer.receivedAt = new Date();
      return manager.save(WarehouseTransfer, transfer);
    });
  }

  async cancel(tenantId: string, id: string) {
    const transfer = await this.findOne(tenantId, id);
    if (transfer.status !== WarehouseTransferStatus.PENDING) {
      throw new BadRequestException(
        'Solo se puede cancelar una transferencia pendiente (todavía sin despachar)',
      );
    }
    transfer.status = WarehouseTransferStatus.CANCELLED;
    return this.transferRepo.save(transfer);
  }
}
