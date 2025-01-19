import { Injectable, Logger } from "@nestjs/common";
import { MmbfInformationDto, MmbfUpdateGameResultRequest, MmfRegisterSession } from "../dtos/mmbf.dto";
import * as Axios from 'axios';
import { ApiError } from "src/common/classes/api-error";
import { AuthError } from "../constants/errors";
import { ConfigService } from "src/common/services/config.service";
import * as crypt from 'crypto';
import { GetTotalTurnMMBFDto } from "../dtos";
import { start } from "repl";
import { TurnTypeMapping } from "src/common/constants/constants";
const axios = Axios.default;

@Injectable()
export class MmbfService {
  private readonly logger = new Logger(this.constructor.name);
  
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

  createChecksumResultUpdate(payloadRequest: MmbfUpdateGameResultRequest, time: string){
    const {sessionId, totalPoint, point, ctkmId} = payloadRequest
    const password = this.configService.thirdPartyApi.mmmbfPass;

    const dataToHash = `${sessionId}${ctkmId}${time}${time}${point}${totalPoint}${password}`;
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

  async getMmbfTotalTurn(data: GetTotalTurnMMBFDto){
    const {tokenSso, ctkmId} = data
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
            ctkm_id: ctkmId
        }
        const response = await axios.post(`${this.configService.thirdPartyApi.mmbfUrl}/api/sso/get-total-turn`, payload, options);
        const {data} = response.data;
        const {list_turn} = data
        const currentData = {...data}
        if(list_turn?.length){
          const currentListTurn = list_turn.map((item: any) => {
            return {
              ...item,
              type: TurnTypeMapping[item.type]
            }
          })
          currentData.list_turn = currentListTurn
        }

        if(!data){
          const error = response.data?.errors[0]
          if(error){
            throw new ApiError(error.message || 'Get total turn failed')
          }
        }
        return  currentData
    } catch (error) {
        throw new ApiError(error || AuthError.GET_MMBF_TOTAL_TURN_FAILED)
    }
  }

  async registerGameSession(payloadRequest: MmfRegisterSession){
    const {tokenSso, phone, ctkmId, rewardId} = payloadRequest
    this.logger.log(`Register game session with phone: ${phone}, ctkmId: ${ctkmId} and rewardId: ${rewardId}`)

    const authString = `${this.configService.thirdPartyApi.mmbfUser}:${this.configService.thirdPartyApi.mmmbfPassUpdate}`;
    const encodedAuthString = Buffer.from(authString).toString('base64');
    console.log("🚀 ~ MmbfService ~ registerGameSession ~ authString:", authString)
    const options = {
      headers: {
        Authorization: `Bearer ${encodedAuthString}`,
      },
    }
    console.log("🚀 ~ MmbfService ~ registerGameSession ~ options:", options)

    const payload = {
        token: tokenSso,
        phone,
        ctkm_id: ctkmId
    }
    const response = await axios.post(`${this.configService.thirdPartyApi.mmbfUrl}/api/ctkm/register-session`, payload, options);
    const {data} = response.data;
    if(!data){
      const error = response.data?.errors[0]
      if(error){
        throw new ApiError(error.message || 'Start game session failed')
      }
    }
    return  data
  }

  async updateGameResult(payloadRequest: MmbfUpdateGameResultRequest){
    const {sessionId, totalPoint, point, ctkmId, rewardId} = payloadRequest
    this.logger.log(`Update game result with sessionId: ${sessionId}, ctkmId: ${ctkmId}, point: ${point}, totalPoint: ${totalPoint} and rewardId: ${rewardId}`)
    const authString = `${this.configService.thirdPartyApi.mmbfUser}:${this.configService.thirdPartyApi.mmmbfPassUpdate}`;
    const encodedAuthString = Buffer.from(authString).toString('base64');
    const options = {
      headers: {
        Authorization: `Bearer ${encodedAuthString}`,
      },
    }
    const time = Date.now().toString();

    const checksum = this.createChecksumResultUpdate(payloadRequest, time);
    const payload = {
        session_id: sessionId,
        ctkm_id: ctkmId,
        point,
        total_point: totalPoint,
        start_time: time,
        end_time: time,
        checksum
    }
    const response = await axios.post(`${this.configService.thirdPartyApi.mmbfUrl}/api/ctkm/update-sessionid-result`, payload, options);

    const {data} = response.data;
    if(!data){
      const error = response.data?.errors[0]
      if(error){
        throw new ApiError(error.message || 'Start game session failed')
      }
    }
    this.logger.log(`Update game result with sessionId: ${sessionId}  successfully`)
    return  data
  }

}