import { Controller, Get } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get('me')
  findMine(@CurrentUser() user: { tenantId: string }) {
    return this.subscriptionsService.findCurrentByTenant(user.tenantId);
  }
}
