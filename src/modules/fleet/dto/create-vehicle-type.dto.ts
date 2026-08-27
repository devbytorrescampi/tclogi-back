import { IsString } from 'class-validator';

export class CreateVehicleTypeDto {
  @IsString()
  name: string;
}
