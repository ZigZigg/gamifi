import { Injectable, Logger } from "@nestjs/common";
import { MmbfInformationDto } from "../dtos/mmbf.dto";
import * as Axios from 'axios';
import { ApiError } from "src/common/classes/api-error";
import { AuthError } from "../constants/errors";
import { ConfigService } from "src/common/services/config.service";
import * as crypt from 'crypto';
import { Rewards } from "src/database/models/rewards.entity";
const axios = Axios.default;

@Injectable()
export class MpointService {
    private readonly logger = new Logger(this.constructor.name);
  
  constructor(
    private readonly configService: ConfigService,
  ) {}

  async getMypointAccount(phone:string){
    // If phone does not have enough 10 length and missing 0 at the beginning, add 0
    if(phone.length < 10){
      phone = '0' + phone;
    }
    try {
      const options = {
          headers: {
              'X-Api-Key': this.configService.thirdPartyApi.mpointApiKey
          },
      }
      const response = await axios.get(`${this.configService.thirdPartyApi.mpointUrl}/8854/gup2start/partner/rest/user/api/v2.0/verifyAccountGame?phone=${phone}`, options);
      const {data, error_code: errorCodeVerify} = response.data;
      if(errorCodeVerify){
        throw new ApiError('Verify account failed - error code: ' + errorCodeVerify);
      }
      if(data.is_active){
        return true
      }

      // Create new account
      const responseCreate = await axios.post(`${this.configService.thirdPartyApi.mpointUrl}/8854/gup2start/partner/rest/user/api/v2.0/signUpAccountGame`, {phone}, options);
      const {code, error_code} = responseCreate.data;
      if(code !== 200 && error_code){
        throw new ApiError('Create account failed - error code: ' + error_code);
      }
      return  true
    } catch (error) {
        const {error_message} = error.response?.data || {}
        throw new ApiError( error_message ? `Request failed with ${phone} ` + error_message  : AuthError.INVALID_MYPOINT_ACCOUNT)
    }
  }

  async getMyPointVoucher(voucherId:string){

    try {
      const options = {
          headers: {
              'X-Api-Key': this.configService.thirdPartyApi.mpointApiKey
          },
      }
      const response = await axios.get(`${this.configService.thirdPartyApi.mpointUrl}/8854/gup2start/partner/rest/product/api/v1.0/product/vouchers/${voucherId}`, options);

      const {code, error_code, data} = response.data;
      if(code !== 200 && error_code){
        throw new ApiError('Get voucher detail failed - error code: ' + error_code);
      }
      return  data
    } catch (error) {
        const {error_message} = error.response?.data || {}
        throw new ApiError( error_message ? error_message  : AuthError.INVALID_MYPOINT_ACCOUNT)
    }
  }

  async sendRewardMP(phone: string, reward: Rewards){
    const  {turnType, value} = reward
    if(phone.length < 10){
      phone = '0' + phone;
    }
    try {
      const options = {
          headers: {
              'X-Api-Key': this.configService.thirdPartyApi.mpointApiKey
          },
      }
      const rewardType = turnType.value === 'MP_SCORE' ? 'POINT' : 'VOUCHER'
      let rewardValue: any = value
      // Check if Number(value) is NaN and value include ',' then split by ','
      if(isNaN(Number(value)) && value.includes(',') && rewardType === 'VOUCHER'){
        const valueData = value.split(',').map(v => Number(v))
        // Random value from valueData number array
        rewardValue = valueData[Math.floor(Math.random() * valueData.length)]
      }

      const payload = {
        phone,
        reward:{
          type: rewardType,
          value: Number(rewardValue)
        }
      }
      let voucherData = null
      if(rewardType === 'VOUCHER'){
        const resultVoucher = await this.getMyPointVoucher(rewardValue)
        voucherData=resultVoucher
      }

      const responseCreate = await axios.post(`${this.configService.thirdPartyApi.mpointUrl}/8854/gup2start/partner/rest/product/api/v1.0/rewardGameMBF`, payload, options);
      const {code, error_code} = responseCreate.data;
      if(code !== 200 && error_code){
        throw new ApiError('Send request to Mpoint failed - error code: ' + error_code);
      }
      this.logger.log(`Send reward to MyPoint with phone: ${phone} and reward: ${JSON.stringify(reward)}`)
      return  {
        voucherData
      }
    } catch (error) {
        const {error_message} = error.response?.data || {}
        throw new ApiError( error_message ? `Send reward to MyPoint failed with phone ${phone}: ` + error_message  : AuthError.INVALID_MYPOINT_ACCOUNT)
    }
  }

}