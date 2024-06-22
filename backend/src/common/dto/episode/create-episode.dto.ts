import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateEpisodeDto {
  @IsString()
  @MaxLength(255)
  @MinLength(3)
  readonly title: string;
}
