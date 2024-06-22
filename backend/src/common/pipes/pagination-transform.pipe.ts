import { PaginationQueryDto } from '@dto/common/pagination.dto';
import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class PaginationTransformPipe implements PipeTransform {
  async transform(value: PaginationQueryDto, { metatype }: ArgumentMetadata) {
    if (!metatype) {
      return value;
    }

    return plainToInstance(metatype, value);
  }
}
