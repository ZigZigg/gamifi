import { Controller, Get } from '@nestjs/common';
import { HealthCheckService } from './app.service';
import { ApiTags } from '@nestjs/swagger';

@Controller('health-check')
@ApiTags('Health Check')
export class HealthCheckController {
  constructor(private readonly healthCheckService: HealthCheckService) {}

  @Get()
  async healthCheck() {
    const postgres = await this.healthCheckService.checkPostgres();
    const redis = await this.healthCheckService.checkRedis();
    const isHealthy = postgres && redis;

    return {
      status: isHealthy ? 'healthy' : 'unhealthy',
      checks: {
        postgres,
        redis,
      },
    };
  }
}
