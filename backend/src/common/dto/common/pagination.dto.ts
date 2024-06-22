import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsPositive } from 'class-validator';

export class PaginationQueryDto {
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @IsPositive()
  public readonly skip: number;

  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @IsPositive()
  public readonly take: number;
}
