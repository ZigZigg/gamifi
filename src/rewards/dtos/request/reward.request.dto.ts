import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsNumber, IsString } from "class-validator";
import { TurnType } from "src/database/models/rewards.entity";

export class RewardRequestDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    turnTypeId: number;

    @ApiProperty({
        type: 'enum',
        required: true,
        enum: TurnType,
        default: TurnType.FREE,
      })
    @IsNotEmpty()
    @IsEnum(TurnType)
    type: TurnType;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    value: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    quantity: number;

    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    holdQuantity: number;

    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    winningRate: number;      

    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    campaignId: number;
}