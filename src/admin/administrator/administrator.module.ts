import { Global, Module } from '@nestjs/common';

import { AdministratorService } from './services/administrator.service';
import { AdministratorController } from './administrator.controller';
import { EmailModule } from '../../email/email.module';

@Global()
@Module({
  imports: [
    EmailModule,
  ],
  providers: [AdministratorService],
  controllers: [AdministratorController],
  exports: [AdministratorService],
})
export class AdministratorModule {}
