import { Injectable } from "@nestjs/common";
import { MmbfInformationDto } from "../dtos/mmbf.dto";
import * as Axios from 'axios';
import { ApiError } from "src/common/classes/api-error";
import { AuthError } from "../constants/errors";
import { ConfigService } from "src/common/services/config.service";
import * as crypt from 'crypto';
const axios = Axios.default;

@Injectable()
export class MmbfService {
  constructor(
    private readonly configService: ConfigService,
  ) {}

  createChecksumDataMmbf(tokenSso: string, time: string) {
    const user = this.configService.thirdPartyApi.mmbfUser;
    const password = this.configService.thirdPartyApi.mmmbfPass;
    const dataToHash = `${user}${password}${tokenSso}${time}`;
    const checksum = crypt.createHash('sha256').update(dataToHash).digest('hex');
    return checksum;
  }

  async getMmbfAccountInformation(body: MmbfInformationDto){
    const {tokenSso} = body
    try {
        const options = {
            headers: {
                mode: `clientsso`,
                client: this.configService.thirdPartyApi.mmbfClientId
            },
        }
        const time = Date.now().toString();
        const checksum = this.createChecksumDataMmbf(tokenSso, time);
        const payload = {
            token: tokenSso,
            time,
            checksum
        }
        const response = await axios.post(`${this.configService.thirdPartyApi.mmbfUrl}/api/sso/get-data`, payload, options);
        const {data} = response.data;
        return  data
    } catch (error) {
        throw new ApiError(AuthError.INVALID_MYMOBIFONE_ACCOUNT)
    }
  }

  async getMmbfTotalTurn(tokenSso: string){
    try {
        const options = {
            headers: {
                mode: `clientsso`,
                client: this.configService.thirdPartyApi.mmbfClientId
            },
        }
        const time = Date.now().toString();
        const checksum = this.createChecksumDataMmbf(tokenSso, time);
        const payload = {
            token: tokenSso,
            time,
            checksum,
            ctkm_id: this.configService.thirdPartyApi.mmmbfCtkmId
        }
        const response = await axios.post(`${this.configService.thirdPartyApi.mmbfUrl}/api/sso/get-total-turn`, payload, options);
        const {data} = response.data;
        if(!data){
          const error = response.data?.errors[0]
          if(error){
            throw new ApiError(error.message || 'Get total turn failed')
          }
        }
        return  data
    } catch (error) {
        throw new ApiError(error || AuthError.GET_MMBF_TOTAL_TURN_FAILED)
    }
  }

}