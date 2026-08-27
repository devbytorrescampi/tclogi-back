import { IsString } from 'class-validator';

export class UpdateWarehouseLocationDto {
  @IsString()
  code: string;
}
