import {
  Controller,
  Body,
  Post,
  UsePipes,
  ValidationPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

// Other import
import { AuthService } from './services/auth.service';
import {
  RegisterDTO,
  RegisterGameDTO,
} from './dtos';
import { ApiResult } from '../common/classes/api-result';
import { UserService } from '../user/services';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

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

  @Post('/registerGame')
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOkResponse({
    description: 'Start game and validate account MMBF',
  })
  async registerGame(@Body() data: RegisterGameDTO) {
    const {tokenSso} = data
    const dataResponse = await this.authService.registerGame(tokenSso);

    return new ApiResult().success(dataResponse);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('/getTotalTurnMmbf')
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOkResponse({
    description: 'Register by email',
  })
  async getTotalTurnMmbf(@Body() data: RegisterGameDTO) {
    const {tokenSso} = data
    const dataResponse = await this.authService.getTotalTurn(tokenSso);

    return new ApiResult().success(dataResponse);
  }
}
