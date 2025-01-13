import { Global, Module } from '@nestjs/common';
import { AdminUserService } from './services/admin-user.service';
import { AdminUserController } from './admin-user.controller';

@Global()
@Module({
  providers: [AdminUserService],
  controllers: [AdminUserController],
  exports: [AdminUserService],
})
export class AdminUserModule {}
