import {
  Controller,
  Body,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

// Other import
import { AuthService } from './services/auth.service';
import {
  RegisterDTO,
} from './dtos';
import { ApiResult } from '../common/classes/api-result';
import { UserService } from '../user/services';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @Post('/register')
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOkResponse({
    description: 'Register by email',
  })
  async registerEmail(@Body() data: RegisterDTO) {
    const dataResponse = await this.authService.register(data);

    return new ApiResult().success(dataResponse);
  }

}
