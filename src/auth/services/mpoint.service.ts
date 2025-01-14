import { Injectable } from "@nestjs/common";
import { MmbfInformationDto } from "../dtos/mmbf.dto";
import * as Axios from 'axios';
import { ApiError } from "src/common/classes/api-error";
import { AuthError } from "../constants/errors";
import { ConfigService } from "src/common/services/config.service";
import * as crypt from 'crypto';
const axios = Axios.default;

@Injectable()
export class MpointService {
  constructor(
    private readonly configService: ConfigService,
  ) {}

  async getMypointAccount(phone:string){
    try {
      const options = {
          headers: {
              'X-Api-Key': this.configService.thirdPartyApi.mpointApiKey
          },
      }
      const response = await axios.get(`${this.configService.thirdPartyApi.mpointUrl}/8854/gup2start/partner/rest/user/api/v2.0/verifyAccountGame?phone=${phone}`, options);
      const {data} = response.data;
      if(data.is_existing){
        return true
      }

      // Create new account
        const responseCreate = await axios.post(`${this.configService.thirdPartyApi.mpointUrl}/8854/gup2start/partner/rest/user/api/v2.0/signUpAccountGame`, {phone}, options);
        if(responseCreate.data.code !== 200){
          throw new ApiError('Create account failed');
        }
      return  true
  } catch (error) {
      throw new ApiError(AuthError.INVALID_MYPOINT_ACCOUNT)
  }
  }


}