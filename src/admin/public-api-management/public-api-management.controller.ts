import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';

import { PublicApiManagementService } from './public-api-management.service';
import { ApiResult } from '../../common/classes/api-result';
import {
  CreateDto,
  DeletePublicApiDto,
  UpdateDto,
  ValidateDuplicatePublicApiDTO,
} from './dtos/requests';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Roles, RolesGuard } from '../../auth/guards/roles.guard';
import { UserRole } from '../../database/models/user.entity';
import { BasePageDTO } from '../../common/classes/pagination.dto';
import { GetPublicApisResDTO, PublicApiResDTO } from './dtos/responses';

@Controller('admin/public-api-management')
@ApiTags('Public API Management')
@UseGuards(RolesGuard)
@UseGuards(JwtAuthGuard)
@Roles([UserRole.ADMIN, UserRole.SUPER_ADMIN])
@ApiBearerAuth()
export class PublicApiManagementController {
  constructor(private readonly publicApiService: PublicApiManagementService) {}


  @Post('/validate-duplicate')
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiResponse({
    description: 'Validate duplicate public api',
    status: 200,
  })
  async validateDuplicate(@Body() payload: ValidateDuplicatePublicApiDTO) {
    const response = await this.publicApiService.validateDuplicate(payload);
    return new ApiResult().success(response);
  }


  @Put('/:id')
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiResponse({
    description: 'Update public api by id',
    status: 200,
  })
  async update(@Param('id') id: number, @Body() payload: UpdateDto) {
    const result = await this.publicApiService.update(id, payload);
    return new ApiResult().success(result);
  }

  @Delete('/:id')
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiResponse({
    description: 'Delete public api by id',
    status: 200,
  })
  async delete(@Param('id') id: number, @Body() body: DeletePublicApiDto) {
    const dataResponse = await this.publicApiService.delete(id, body.type);
    return new ApiResult().success(dataResponse);
  }
}
