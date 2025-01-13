import { IsNotEmpty, IsOptional } from 'class-validator';
import {
  User,
  Account,
  Flatfrom,
  UserActivityType,
} from '../../database/models/entities';
import { DeleteUserDTO, SearchUserDTO } from './user.dto';

export class UserCommandDTO {
  @IsNotEmpty()
  readonly user: { [k: string]: User };

  @IsOptional()
  readonly cond: { [k: string]: User };

  @IsOptional()
  readonly options: { [k: string]: string };
}

export class UserLoginCommandDTO {
  @IsNotEmpty()
  readonly password: string;

  @IsOptional()
  readonly cond: { [k: string]: User };
}

export class AccountCommandDTO {
  @IsNotEmpty()
  readonly account: { [k: string]: Account };

  @IsOptional()
  readonly cond: { [k: string]: Account };
}
export class VersionCommandDTO {
  @IsNotEmpty()
  readonly flatfrom: Flatfrom;

  @IsNotEmpty()
  readonly version: string;
}

export class UserSearchCommandDTO {
  @IsOptional()
  readonly cond: SearchUserDTO;
}

export class UserDeleteCommandDTO {
  @IsNotEmpty()
  readonly user: { [k: string]: User };

  @IsOptional()
  readonly cond: DeleteUserDTO;
}

export class LogActivityDTO {
  @IsNotEmpty()
  readonly userId: number;

  @IsNotEmpty()
  readonly type: UserActivityType;
}
