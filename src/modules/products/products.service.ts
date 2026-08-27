import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';
import { ProductCategory } from './product-category.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { CreateProductCategoryDto } from './dto/create-product-category.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product) private readonly productRepo: Repository<Product>,
    @InjectRepository(ProductCategory)
    private readonly productCategoryRepo: Repository<ProductCategory>,
  ) {}

  async create(tenantId: string, dto: CreateProductDto) {
    const existing = await this.productRepo.findOne({ where: { tenantId, sku: dto.sku } });
    if (existing) {
      throw new ConflictException(`Ya existe un producto con el SKU "${dto.sku}"`);
    }
    const product = this.productRepo.create({ ...dto, tenantId });
    return this.productRepo.save(product);
  }

  findAll(tenantId: string) {
    return this.productRepo.find({ where: { tenantId }, order: { name: 'ASC' } });
  }

  async findOne(tenantId: string, id: string) {
    const product = await this.productRepo.findOne({ where: { id, tenantId } });
    if (!product) throw new NotFoundException('Producto no encontrado');
    return product;
  }

  async update(tenantId: string, id: string, dto: Partial<CreateProductDto>) {
    const product = await this.findOne(tenantId, id);
    if (dto.sku && dto.sku !== product.sku) {
      const existing = await this.productRepo.findOne({ where: { tenantId, sku: dto.sku } });
      if (existing) {
        throw new ConflictException(`Ya existe un producto con el SKU "${dto.sku}"`);
      }
    }
    Object.assign(product, dto);
    return this.productRepo.save(product);
  }

  async remove(tenantId: string, id: string) {
    const product = await this.findOne(tenantId, id);
    product.isActive = false;
    return this.productRepo.save(product);
  }

  // Permanent delete — only allowed once the product has already been
  // deactivated, so nothing disappears from the system without the
  // deactivate-then-confirm step first.
  async hardDelete(tenantId: string, id: string) {
    const product = await this.findOne(tenantId, id);
    if (product.isActive) {
      throw new BadRequestException(
        'Primero tenés que dar de baja el producto antes de eliminarlo definitivamente.',
      );
    }
    await this.productRepo.remove(product);
    return { id };
  }

  async createCategory(tenantId: string, dto: CreateProductCategoryDto) {
    const existing = await this.productCategoryRepo.findOne({
      where: { tenantId, name: dto.name },
    });
    if (existing) throw new ConflictException('Ya existe una categoría con ese nombre');
    const category = this.productCategoryRepo.create({ ...dto, tenantId });
    return this.productCategoryRepo.save(category);
  }

  findAllCategories(tenantId: string) {
    return this.productCategoryRepo.find({ where: { tenantId }, order: { name: 'ASC' } });
  }

  async removeCategory(tenantId: string, id: string) {
    const category = await this.productCategoryRepo.findOne({ where: { id, tenantId } });
    if (!category) throw new NotFoundException('Categoría no encontrada');
    await this.productCategoryRepo.remove(category);
    return { id };
  }
}
