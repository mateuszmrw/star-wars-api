import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreatePlanetDto {
  @IsString()
  @MaxLength(255)
  @MinLength(3)
  readonly name: string;
}
