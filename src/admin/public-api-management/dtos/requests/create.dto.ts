import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
} from 'class-validator';
import { DeleteType } from '../../constants';

export class ValidateDuplicatePublicApiDTO {
  @ApiProperty({ example: 'public api name', type: 'string', required: true })
  @Length(1, 100)
  @IsString()
  @IsNotEmpty()
  name: string;
}

export class CreateDto {
  @ApiProperty({ example: '/v1/gift-link', type: 'string', required: true })
  @IsString()
  @IsNotEmpty()
  url: string;

  @ApiProperty({ example: 'public api name', type: 'string', required: true })
  @Length(1, 100)
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ type: 'number', required: true, example: 1 })
  @Max(7)
  @Min(1)
  @IsNumber()
  @IsNotEmpty()
  ticketId: number;

  @ApiProperty({ type: 'number', required: true, example: 500 })
  @IsNumber()
  @IsNotEmpty()
  limit: number;
}

export class UpdateDto {
  @ApiProperty({ type: 'number', required: false, example: 'public api name' })
  @Length(1, 100)
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name?: string;

  @ApiProperty({ type: 'number', required: false, example: 500 })
  @IsNumber()
  @IsNotEmpty()
  @IsOptional()
  limit?: number;
}

export class DeletePublicApiDto {
  @ApiProperty({
    description: 'Delete type',
    enum: DeleteType,
    required: true,
  })
  @IsEnum(DeleteType)
  @IsNotEmpty()
  type: DeleteType;
}
