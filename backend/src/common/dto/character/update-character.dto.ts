import {
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { CreateCharacterDto } from './create-character.dto';

export class UpdateCharacterDto extends CreateCharacterDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  @MinLength(3)
  readonly name: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  readonly description: string;

  @IsOptional()
  @IsNumber()
  @IsInt()
  @IsPositive()
  readonly planetId?: number;

  @IsOptional()
  @IsInt({ each: true })
  @IsPositive({ each: true })
  readonly episodeIds?: number[];
}
