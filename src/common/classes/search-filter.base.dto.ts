import { IsOptional } from 'class-validator';
import { BasePageDTO } from './pagination.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { CommonService } from '../services/common.service';

export class SearchObjectDTO extends BasePageDTO {
  @IsOptional()
  @ApiProperty({ type: 'string', required: false })
  @Transform(({ value }) => CommonService.escapeString(value))
  readonly keyword: string;

  @IsOptional()
  @ApiProperty({
    type: 'string',
    isArray: true,
    required: false,
    description: 'ex: FIELD_NAME',
  })
  @Transform(({ value }) => CommonService.convertArray(value))
  readonly searchBy: string[];

  @IsOptional()
  @ApiProperty({
    type: 'array',
    isArray: true,
    required: false,
    description: `ex: FIELD_NAME,VALUE,FROM,TO.
      FIELD_NAME: Name of field in database.
      VALUE: Value of filter, value is string|number|string array, number array.
      FROM/TO: Get record between from-to by FIELD_NAME.`,
  })
  @Transform(({ value }) => CommonService.convertArray(value))
  readonly filter: string[];
}
