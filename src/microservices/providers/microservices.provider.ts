// import { AppConfig } from '../../common/constants/constants';
// import { ClientProxyFactory, Transport } from '@nestjs/microservices';

// import { ConfigService } from '../../common/services/config.service';

// const providersFactory = (services) => {
//   return services.map((service) => ({
//     provide: service,
//     useFactory: (configService: ConfigService) => {
//       const rmqConfig = configService.rmq;
//       return ClientProxyFactory.create({
//         transport: Transport.RMQ,
//         options: {
//           urls: [rmqConfig.url],
//           queue: service,
//           queueOptions: { durable: false },
//         },
//       });
//     },
//     inject: [ConfigService],
//   }));
// };

// const services = Object.keys(AppConfig.MICROSERVICE).map(
//   (key) => AppConfig.MICROSERVICE[key],
// );

// export const MicroservicesProvider = providersFactory(services);
