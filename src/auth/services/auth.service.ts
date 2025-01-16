import { Injectable, Logger } from '@nestjs/common';
import * as _ from 'lodash';


import {
  GetTotalTurnMMBFDto,
  RegisterDTO,
} from '../dtos';


import {
  UserService,
} from '../../user/services';
import { ApiError } from 'src/common/classes/api-error';
import { MmbfService } from './mmbf.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(this.constructor.name);
  constructor(

    private readonly userService: UserService,
    private readonly mmbfService: MmbfService,
    private jwtService: JwtService,
  ) {}

  async register(data: RegisterDTO) {
    // let user = await this.userRep.cmdUser<User>(UserTypeCMD.GET, {
    //   email: data.email,
    // });
    let user = await this.userService.getUserByField({ email: data.email });

    // user = await this.userRep.cmdUser(UserTypeCMD.CREATE, { ...data });
    user = await this.userService.createUser({ ...data });

    return;
  }

  async registerGame(tokenSso: string){
    try {
      const accountMmbf = await this.mmbfService.getMmbfAccountInformation({tokenSso});
      if(!accountMmbf?.phone){
        throw new ApiError('Account not found');
      }
      const {phone, sub_id, fullname} = accountMmbf
      // TODO: Register MP account

      // Start create new account
      const existUser = await this.userService.getUserByField([
        {
          phoneNumber: accountMmbf.phone,
        },
      ]);
      
      let payload: any = {
        phoneNumber: phone,
        sub_id,
        fullname
      }

      if(existUser){
        payload = {
          ...payload,
          id: existUser.id,
        }
        return {
          user: existUser,
          token: this.jwtService.sign(payload),
        }
      }

      // Create new account
      const createdUser = await this.userService.createUser({
        fullName: fullname,
        password: `${phone}_${sub_id}`,
        phoneNumber: phone,
        emailVerified: true,
      })
      payload = {
        ...payload,
        id: createdUser.id,
      }
      return {
        user: createdUser,
        token: this.jwtService.sign(payload),
      }
    } catch (error) {
      throw new ApiError(error.message)
    }
  }

  async getTotalTurn(data: GetTotalTurnMMBFDto){
    try {
      const result = await this.mmbfService.getMmbfTotalTurn(data);
      return result
    } catch (error) {
      throw new ApiError(error.message)
      
    }
  }
}
