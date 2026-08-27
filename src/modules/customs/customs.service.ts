import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomsDocument, CustomsDocumentStatus } from './customs-document.entity';

@Injectable()
export class CustomsService {
  constructor(
    @InjectRepository(CustomsDocument)
    private readonly documentRepo: Repository<CustomsDocument>,
  ) {}

  create(
    tenantId: string,
    dto: { documentType: string; referenceType?: string; referenceId?: string },
  ) {
    const document = this.documentRepo.create({ ...dto, tenantId });
    return this.documentRepo.save(document);
  }

  findAll(tenantId: string) {
    return this.documentRepo.find({ where: { tenantId }, relations: { fees: true } });
  }

  async updateStatus(tenantId: string, id: string, status: CustomsDocumentStatus) {
    const document = await this.documentRepo.findOne({ where: { id, tenantId } });
    if (!document) throw new NotFoundException('Documento no encontrado');
    document.status = status;
    return this.documentRepo.save(document);
  }
}
