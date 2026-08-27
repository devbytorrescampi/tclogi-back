import { IsString } from 'class-validator';

export class CreateDriverLicenseTypeDto {
  @IsString()
  name: string;
}
