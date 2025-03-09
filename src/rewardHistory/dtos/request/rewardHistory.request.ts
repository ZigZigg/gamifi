import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";
import { BasePageDTO } from "src/common/classes/pagination.dto";
import { CommonService } from "src/common/services/common.service";

export class SearchRewardHistoryRequestDto extends BasePageDTO {
    @ApiProperty({
        type: 'string',
        required: false,
      })
    @IsOptional()
    @IsString()
    phoneNumber: string;

    @ApiProperty({
        type: 'string',
        required: false,
    })
    @Transform(({ value }) => CommonService.escapeString(value))
    @IsOptional()
    fullName: string;

    @ApiProperty({
        type: 'number',
        required: false,
      })
    @IsOptional()
    rewardType: number;

    @ApiProperty({
        type: 'boolean',
        required: false,
    })
    isExport: boolean;

    @ApiProperty({
      type: 'string',
      required: false,
      description: 'Reward history from date',
    })
    @IsNotEmpty()
    readonly startDate: string;
    
    @ApiProperty({
      type: 'string',
      required: false,
      description: 'Reward history to date',
    })
    @IsNotEmpty()
    readonly endDate: string;
}