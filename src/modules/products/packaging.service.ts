import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import {
  PACKAGING_LEVEL_ORDER,
  PackagingLevel,
  ProductPackaging,
} from './product-packaging.entity';
import { Product } from './product.entity';
import { CreatePackagingDto } from './dto/create-packaging.dto';

@Injectable()
export class PackagingService {
  constructor(
    @InjectRepository(ProductPackaging)
    private readonly packagingRepo: Repository<ProductPackaging>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  private async assertProductExists(tenantId: string, productId: string) {
    const product = await this.productRepo.findOne({ where: { id: productId, tenantId } });
    if (!product) throw new NotFoundException('Producto no encontrado');
  }

  // Recomputes quantityInBaseUnit for every level of a product's packaging
  // chain, in order (BOX, then PALLET, then EQUIPMENT), so each level's
  // total always reflects whatever change was just made below it.
  private async recomputeChain(productId: string) {
    const rows = await this.packagingRepo.find({ where: { productId } });
    const byLevel = new Map(rows.map((r) => [r.level, r]));

    let belowTotal = 1; // the implicit loose unit
    for (const level of PACKAGING_LEVEL_ORDER) {
      const row = byLevel.get(level);
      if (!row) continue;
      row.quantityInBaseUnit = row.containsQuantity * belowTotal;
      await this.packagingRepo.save(row);
      belowTotal = row.quantityInBaseUnit;
    }
  }

  async findAll(tenantId: string, productId: string) {
    await this.assertProductExists(tenantId, productId);
    const rows = await this.packagingRepo.find({ where: { productId } });
    return rows.sort(
      (a, b) => PACKAGING_LEVEL_ORDER.indexOf(a.level) - PACKAGING_LEVEL_ORDER.indexOf(b.level),
    );
  }

  async create(tenantId: string, productId: string, dto: CreatePackagingDto) {
    await this.assertProductExists(tenantId, productId);

    const levelIndex = PACKAGING_LEVEL_ORDER.indexOf(dto.level);
    if (levelIndex > 0) {
      const requiredBelow = PACKAGING_LEVEL_ORDER[levelIndex - 1];
      const belowExists = await this.packagingRepo.findOne({
        where: { productId, level: requiredBelow },
      });
      if (!belowExists) {
        throw new BadRequestException(
          `Para definir ${dto.level} primero necesitás definir ${requiredBelow}`,
        );
      }
    }

    const existing = await this.packagingRepo.findOne({ where: { productId, level: dto.level } });
    if (existing) {
      throw new BadRequestException(`Ya existe una definición de ${dto.level} para este producto`);
    }

    const packaging = this.packagingRepo.create({
      ...dto,
      productId,
      quantityInBaseUnit: dto.containsQuantity, // placeholder, recomputed right after
    });
    await this.packagingRepo.save(packaging);
    await this.recomputeChain(productId);
    return this.packagingRepo.findOne({ where: { id: packaging.id } });
  }

  async update(
    tenantId: string,
    productId: string,
    packagingId: string,
    dto: Partial<CreatePackagingDto>,
  ) {
    await this.assertProductExists(tenantId, productId);
    const packaging = await this.packagingRepo.findOne({
      where: { id: packagingId, productId },
    });
    if (!packaging) throw new NotFoundException('Empaque no encontrado');

    if (dto.containsQuantity !== undefined) packaging.containsQuantity = dto.containsQuantity;
    if (dto.isDefaultPurchaseUnit !== undefined)
      packaging.isDefaultPurchaseUnit = dto.isDefaultPurchaseUnit;
    if (dto.isDefaultSaleUnit !== undefined) packaging.isDefaultSaleUnit = dto.isDefaultSaleUnit;
    await this.packagingRepo.save(packaging);
    await this.recomputeChain(productId);
    return this.packagingRepo.findOne({ where: { id: packagingId } });
  }

  async remove(tenantId: string, productId: string, packagingId: string) {
    await this.assertProductExists(tenantId, productId);
    const packaging = await this.packagingRepo.findOne({
      where: { id: packagingId, productId },
    });
    if (!packaging) throw new NotFoundException('Empaque no encontrado');

    const levelIndex = PACKAGING_LEVEL_ORDER.indexOf(packaging.level);
    const higherLevels = PACKAGING_LEVEL_ORDER.slice(levelIndex + 1);
    if (higherLevels.length > 0) {
      const higherExists = await this.packagingRepo.findOne({
        where: { productId, level: In(higherLevels) },
      });
      if (higherExists) {
        throw new BadRequestException(
          `Eliminá primero ${higherExists.level}, que depende de ${packaging.level}`,
        );
      }
    }

    await this.packagingRepo.remove(packaging);
    return { id: packagingId };
  }
}
