import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { CustomsService } from './customs.service';
import { CustomsDocumentStatus } from './customs-document.entity';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('customs-documents')
export class CustomsController {
  constructor(private readonly customsService: CustomsService) {}

  @Post()
  create(
    @CurrentUser() user: { tenantId: string },
    @Body() dto: { documentType: string; referenceType?: string; referenceId?: string },
  ) {
    return this.customsService.create(user.tenantId, dto);
  }

  @Get()
  findAll(@CurrentUser() user: { tenantId: string }) {
    return this.customsService.findAll(user.tenantId);
  }

  @Patch(':id/status')
  updateStatus(
    @CurrentUser() user: { tenantId: string },
    @Param('id') id: string,
    @Body('status') status: CustomsDocumentStatus,
  ) {
    return this.customsService.updateStatus(user.tenantId, id, status);
  }
}
