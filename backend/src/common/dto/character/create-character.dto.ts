import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateCharacterDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  @MinLength(3)
  readonly name: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  readonly description: string;
}
