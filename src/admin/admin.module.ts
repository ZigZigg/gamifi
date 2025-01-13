import { Global, Module } from '@nestjs/common';
import { AdminAuthModule } from './auth/admin-auth.module';
import { AdministratorModule } from './administrator/administrator.module';
import { AdminUserModule } from './user/admin-user.module';
import { AdminPermissionModule } from './permission/permission.module';
import { PublicApiManagementModule } from './public-api-management/public-api-management.module';

@Global()
@Module({
  imports: [
    AdminAuthModule,
    AdministratorModule,
    AdminUserModule,
    AdminPermissionModule,
    PublicApiManagementModule,
  ],
  providers: [],
  controllers: [],
  exports: [],
})
export class AdminModule {}
