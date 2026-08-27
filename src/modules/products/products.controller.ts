import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { StockService } from './stock.service';
import { PackagingService } from './packaging.service';
import { CreateProductDto } from './dto/create-product.dto';
import { AddStockDto } from './dto/add-stock.dto';
import { UpdateStockMovementDto } from './dto/update-stock-movement.dto';
import { CreatePackagingDto } from './dto/create-packaging.dto';
import { CreateProductCategoryDto } from './dto/create-product-category.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly stockService: StockService,
    private readonly packagingService: PackagingService,
  ) {}

  @Post()
  create(@CurrentUser() user: { tenantId: string }, @Body() dto: CreateProductDto) {
    return this.productsService.create(user.tenantId, dto);
  }

  @Get()
  findAll(@CurrentUser() user: { tenantId: string }) {
    return this.productsService.findAll(user.tenantId);
  }

  @Post('categories')
  createCategory(
    @CurrentUser() user: { tenantId: string },
    @Body() dto: CreateProductCategoryDto,
  ) {
    return this.productsService.createCategory(user.tenantId, dto);
  }

  @Get('categories')
  findAllCategories(@CurrentUser() user: { tenantId: string }) {
    return this.productsService.findAllCategories(user.tenantId);
  }

  @Delete('categories/:id')
  removeCategory(@CurrentUser() user: { tenantId: string }, @Param('id') id: string) {
    return this.productsService.removeCategory(user.tenantId, id);
  }

  @Get(':id')
  findOne(@CurrentUser() user: { tenantId: string }, @Param('id') id: string) {
    return this.productsService.findOne(user.tenantId, id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: { tenantId: string },
    @Param('id') id: string,
    @Body() dto: Partial<CreateProductDto>,
  ) {
    return this.productsService.update(user.tenantId, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: { tenantId: string }, @Param('id') id: string) {
    return this.productsService.remove(user.tenantId, id);
  }

  @Delete(':id/permanent')
  hardDelete(@CurrentUser() user: { tenantId: string }, @Param('id') id: string) {
    return this.productsService.hardDelete(user.tenantId, id);
  }

  @Get(':id/stock')
  getStock(@CurrentUser() user: { tenantId: string }, @Param('id') id: string) {
    return this.stockService.getBalances(user.tenantId, id);
  }

  @Post(':id/stock')
  addStock(
    @CurrentUser() user: { tenantId: string },
    @Param('id') id: string,
    @Body() dto: AddStockDto,
  ) {
    return this.stockService.addStock(user.tenantId, id, dto);
  }

  @Get(':id/stock/movements')
  getStockMovements(@CurrentUser() user: { tenantId: string }, @Param('id') id: string) {
    return this.stockService.getMovements(user.tenantId, id);
  }

  @Patch(':id/stock/movements/:movementId')
  updateStockMovement(
    @CurrentUser() user: { tenantId: string },
    @Param('id') id: string,
    @Param('movementId') movementId: string,
    @Body() dto: UpdateStockMovementDto,
  ) {
    return this.stockService.updateMovement(user.tenantId, id, movementId, dto);
  }

  @Delete(':id/stock/movements/:movementId')
  removeStockMovement(
    @CurrentUser() user: { tenantId: string },
    @Param('id') id: string,
    @Param('movementId') movementId: string,
  ) {
    return this.stockService.removeMovement(user.tenantId, id, movementId);
  }

  @Get(':id/packagings')
  getPackagings(@CurrentUser() user: { tenantId: string }, @Param('id') id: string) {
    return this.packagingService.findAll(user.tenantId, id);
  }

  @Post(':id/packagings')
  createPackaging(
    @CurrentUser() user: { tenantId: string },
    @Param('id') id: string,
    @Body() dto: CreatePackagingDto,
  ) {
    return this.packagingService.create(user.tenantId, id, dto);
  }

  @Patch(':id/packagings/:packagingId')
  updatePackaging(
    @CurrentUser() user: { tenantId: string },
    @Param('id') id: string,
    @Param('packagingId') packagingId: string,
    @Body() dto: Partial<CreatePackagingDto>,
  ) {
    return this.packagingService.update(user.tenantId, id, packagingId, dto);
  }

  @Delete(':id/packagings/:packagingId')
  removePackaging(
    @CurrentUser() user: { tenantId: string },
    @Param('id') id: string,
    @Param('packagingId') packagingId: string,
  ) {
    return this.packagingService.remove(user.tenantId, id, packagingId);
  }
}
