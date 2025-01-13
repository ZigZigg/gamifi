import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PublicApiManagementService } from './public-api-management.service';
import { PublicApiManagementController } from './public-api-management.controller';
import { AppConfig } from '../../common/constants/constants';
import { PublicApi } from '../../database/models/entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([PublicApi], AppConfig.DB),
  ],
  providers: [PublicApiManagementService],
  controllers: [PublicApiManagementController],
  exports: [],
})
export class PublicApiManagementModule {}
