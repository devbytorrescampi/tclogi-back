import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './product.entity';
import { ProductCategory } from './product-category.entity';
import { ProductPackaging } from './product-packaging.entity';
import { StockMovement } from '../warehouses/stock-movement.entity';
import { Warehouse } from '../warehouses/warehouse.entity';
import { WarehouseLocation } from '../warehouses/warehouse-location.entity';
import { ProductsService } from './products.service';
import { StockService } from './stock.service';
import { PackagingService } from './packaging.service';
import { ProductsController } from './products.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Product,
      ProductCategory,
      ProductPackaging,
      StockMovement,
      Warehouse,
      WarehouseLocation,
    ]),
  ],
  providers: [ProductsService, StockService, PackagingService],
  controllers: [ProductsController],
  exports: [TypeOrmModule],
})
export class ProductsModule {}
