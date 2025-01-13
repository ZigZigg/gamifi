import { Global, Module } from '@nestjs/common';
import { PermissionService } from './services/permission.service';
import { PermissionController } from './permission.controller';
import { PermissionRequest } from '../../database/models/permission-request.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppConfig } from '../../common/constants/constants';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([PermissionRequest], AppConfig.DB)],
  providers: [PermissionService],
  controllers: [PermissionController],
  exports: [PermissionService],
})
export class AdminPermissionModule {}
