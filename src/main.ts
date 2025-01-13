import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';

import { join } from 'path';
import { ConfigService } from './common/services/config.service';
import { DatabaseModule } from './database/database.module';
import { AppModule } from './app.module';
import { RedisIoAdapter } from './adapter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const configService: ConfigService = app.get(ConfigService);

  const options = new DocumentBuilder()
    .setTitle('TWO API Docs')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api', app, document);

  // if (configService.rmq) {
  //   Object.keys(AppConfig.MICROSERVICE).map((key) => {
  //     app.connectMicroservice({
  //       transport: Transport.RMQ,
  //       options: {
  //         urls: [configService.rmq.url],
  //         queue: AppConfig.MICROSERVICE[`${key}`],
  //         queueOptions: { durable: false },
  //       },
  //     });
  //   });

  //   await app.startAllMicroservices();
  // }

  const redisIoAdapter = new RedisIoAdapter(app);
  await redisIoAdapter.connectToRedis(configService.redis);

  app.useWebSocketAdapter(redisIoAdapter);

  const databaseModule: DatabaseModule = new DatabaseModule();
  await databaseModule.runMigrations(configService);

  app.enableCors();
  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('hbs');

  await app.listen(configService.port);
  // server.setTimeout(180000);
}
bootstrap();
