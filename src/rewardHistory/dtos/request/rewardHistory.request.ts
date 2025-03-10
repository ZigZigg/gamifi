import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsNumber, IsOptional, IsString } from "class-validator";
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

    @IsOptional()
    @ApiProperty({
      type: 'string',
      required: false,
      description: 'Reward history from date',
    })
    readonly startDate: string;
    
    @IsOptional()
    @ApiProperty({
      type: 'string',
      required: false,
      description: 'Reward history to date',
    })
    readonly endDate: string;
}