import { Type } from 'class-transformer';
import { IsInt, IsOptional } from 'class-validator';

export class PaginationQueryDto {
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  public readonly skip: number;

  @Type(() => Number)
  @IsOptional()
  @IsInt()
  public readonly take: number;
}
