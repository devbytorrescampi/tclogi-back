import { Controller, Get, Patch } from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Get('me')
  findMine(@CurrentUser() user: { tenantId: string }) {
    return this.tenantsService.findOne(user.tenantId);
  }

  @Patch('onboarding')
  completeOnboarding(@CurrentUser() user: { tenantId: string }) {
    return this.tenantsService.completeOnboarding(user.tenantId);
  }
}
