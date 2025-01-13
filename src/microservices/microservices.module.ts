// import { Module, Global } from '@nestjs/common';
// import { ClientsModule } from '@nestjs/microservices';

// import { CommonModule } from '../common/common.module';
// import { MicroservicesProvider } from './providers/microservices.provider';
// import { UserRepository } from './repositories/user.repository';
// import { EmailRepository } from './repositories/email.repository';
// import { NoticeRepository } from './repositories/notice.repository';
// import { TicketRepository } from './repositories/ticket.repository';
// import { UserAnswerRepository } from './repositories/user-answer.repository';
// import { MilestoneRepository } from './repositories/milestone.repository';
// import { RaffleRepository } from './repositories/raffle.repository';
// import { MerchantRepository } from './repositories/merchant.repository';
// import { MasterConfigRepository } from './repositories/master-config.repository';
// import { WidgetRepository } from './repositories/widget.repository';

// @Global()
// @Module({
//   imports: [CommonModule, ClientsModule],
//   providers: [
//     ...MicroservicesProvider,
//     UserRepository,
//     EmailRepository,
//     NoticeRepository,
//     TicketRepository,
//     UserAnswerRepository,
//     MilestoneRepository,
//     RaffleRepository,
//     MerchantRepository,
//     MasterConfigRepository,
//     WidgetRepository,
//   ],
//   controllers: [],
//   exports: [
//     UserRepository,
//     EmailRepository,
//     NoticeRepository,
//     TicketRepository,
//     UserAnswerRepository,
//     MilestoneRepository,
//     RaffleRepository,
//     MerchantRepository,
//     MasterConfigRepository,
//     WidgetRepository,
//   ],
// })
// export class MicroservicesModule {}
