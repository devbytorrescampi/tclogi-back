import { Controller, Get, Query } from '@nestjs/common';
import { GeocodeService } from './geocode.service';

@Controller('geocode')
export class GeocodeController {
  constructor(private readonly geocodeService: GeocodeService) {}

  @Get('search')
  search(@Query('q') query: string) {
    return this.geocodeService.search(query);
  }

  @Get('reverse')
  reverse(@Query('lat') lat: string, @Query('lon') lon: string) {
    return this.geocodeService.reverse(parseFloat(lat), parseFloat(lon));
  }
}
