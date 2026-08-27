import { IsString } from 'class-validator';

export class CreateTrailerTypeDto {
  @IsString()
  name: string;
}
