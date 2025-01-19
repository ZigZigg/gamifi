import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as Joi from '@hapi/joi';

export interface EnvConfig {
  [key: string]: string;
}

export interface DBConfig {
  host: string;
  port: number;
  user: string;
  pass: string;
  name: string;
  maxConnections: number;
}

export interface RmqConfig {
  url: string;
  name: string;
}

export interface RedisConfig {
  host: string;
  port: number;
  url: string;
}

export interface ApiKeyConfig {
  salt: string;
}

export interface AESAlgorithmConfig {
  key: string;
}

export interface FePathConfig {
  web: string;
}

export interface NovuConfig {
  apiKey: string;
}

export class ConfigService {
  private readonly envConfig: EnvConfig;
  private readonly validationScheme = {
    PORT: Joi.number().default(3000),
    BASE_PATH: Joi.string().default('/auth/').empty(''),
    FE_PATH_WEB: Joi.string().default('').empty(''),

    JWT_SECRET: Joi.string().default('s@cret'),

    JWT_SECRET_CORE: Joi.string().default('s@cret'),

    LOG_LEVEL: Joi.string().default('debug'),

    RMQ_HOST: Joi.string().empty(''),
    RMQ_PORT: Joi.number().empty(''),
    RMQ_USER: Joi.string().empty(''),
    RMQ_PASS: Joi.string().empty(''),
    RMQ_PATH: Joi.string().empty(''),
    RMQ_NAME: Joi.string().empty(''),
    RMQ_SSL: Joi.string().empty(''),

    REDIS_HOST: Joi.string().empty(''),
    REDIS_PORT: Joi.number().empty(6379),
    REDIS_PASS: Joi.string().empty(''),

    DB_HOST: Joi.string().required(),
    DB_PORT: Joi.number().required(),
    DB_USER: Joi.string().required(),
    DB_PASS: Joi.string().required(),
    DB_MAX_CONNECTIONS: Joi.number().default(20),

    FB_APP_ID: Joi.string(),
    FB_APP_SECRET: Joi.string(),
    GG_APP_ID_IOS: Joi.string(),
    GG_APP_ID_ANDROID: Joi.string(),
    TW_APP_KEY: Joi.string(),
    TW_APP_SECRET: Joi.string(),
    INS_APP_KEY: Joi.string(),
    INS_APP_SECRET: Joi.string(),
    MS_CLIENT_ID: Joi.string(),
    MS_CLIENT_SECRET: Joi.string(),
    MS_AUTHORITY: Joi.string(),

    MAIL_HOST: Joi.string().required(),
    MAIL_PORT: Joi.number().required(),
    MAIL_USER: Joi.string().required(),
    MAIL_PASS: Joi.string().required(),
    MAIL_FROM_NAME: Joi.string().required(),
    MAIL_FROM_EMAIL: Joi.string().required(),

    APPLE_CLIENT_ID: Joi.string().default(''),

    FIREBASE_CLIENT_EMAIL: Joi.string().default(''),
    FIREBASE_PRIVATE_KEY: Joi.string().default(''),
    FIREBASE_PROJECT_ID: Joi.string().default(''),

    TWILIO_ACCOUNT_SID: Joi.string().default(''),
    TWILIO_AUTH_TOKEN: Joi.string().default(''),
    TWILIO_PHONE_NUMBER: Joi.string().default(''),

    AZURE_BLOB_CONTAINER_NAME: Joi.string().default(''),
    AZURE_BLOB_ACC_NAME: Joi.string().default(''),
    AZURE_BLOB_SAS_TOKEN: Joi.string().default(''),

    TODAY: Joi.string().default(''),

    AES_ALGORITHM_KEY: Joi.string().default(''),

    API_KEY_SALT: Joi.string().default(''),

    RSA_ALGORITHM_PUBLIC_KEY: Joi.string().default(''),
    RSA_ALGORITHM_PRIVATE_KEY: Joi.string().default(''),

    NOVU_API_KEY: Joi.string().default(''),
    API_MMBF_URL: Joi.string().default(''),
    MMBF_CLIENT_ID: Joi.string().default(''),
    MMBF_USER: Joi.string().default(''),
    MMBF_PASS: Joi.string().default(''),
    MMBF_PASS_UPDATE: Joi.string().default(''),
    API_MPOINT_URL: Joi.string().default(''),
    MP_API_KEY: Joi.string().default(''),
    MMBF_CTKM_ID: Joi.string().default(''),
    ENABLE_REGISTER_MMBF: Joi.string().default(''),
  };

  constructor(filePath: string) {
    const config = dotenv.parse(fs.readFileSync(filePath));
    this.envConfig = this.validateInput(config);
  }

  get thirdPartyApi() {
    return {
      mmbfUrl: this.envConfig.API_MMBF_URL,
      mmbfClientId: this.envConfig.MMBF_CLIENT_ID,
      mmbfUser: this.envConfig.MMBF_USER,
      mmmbfPass: this.envConfig.MMBF_PASS,
      mmmbfPassUpdate: this.envConfig.MMBF_PASS_UPDATE,
      mmmbfCtkmId: this.envConfig.MMBF_CTKM_ID,
      mpointUrl: this.envConfig.API_MPOINT_URL,
      mpointApiKey: this.envConfig.MP_API_KEY,
      enableRegisterMmbf: this.envConfig.ENABLE_REGISTER_MMBF,
    }
  }

  get urlImage(): string {
    return String(this.envConfig.URL_IMAGE);
  }

  get port(): number {
    return Number(this.envConfig.PORT);
  }
  get basePath(): string {
    return String(this.envConfig.BASE_PATH);
  }

  get fePath(): FePathConfig {
    return {
      web: String(this.envConfig.FE_PATH_WEB),
    };
  }


  get jwt() {
    return {
      accessTokenSecret: this.envConfig.JWT_SECRET,
      accessTokenExpireTime: this.envConfig.JWT_EXPIRATION_TIME,
    };
  }

  get jwtCore() {
    return {
      accessTokenSecret: this.envConfig.JWT_SECRET_CORE,
    };
  }

  get fbAppId(): string {
    return String(this.envConfig.FB_APP_ID);
  }
  get fbAppSecret(): string {
    return String(this.envConfig.FB_APP_SECRET);
  }
  get ggAppIdIos(): string {
    return String(this.envConfig.GG_APP_ID_IOS);
  }
  get ggAppIdAndroid(): string {
    return String(this.envConfig.GG_APP_ID_ANDROID);
  }

  get twitter() {
    return {
      key: String(this.envConfig.TW_APP_KEY),
      secret: String(this.envConfig.TW_APP_SECRET),
    };
  }

  get instagram() {
    return {
      key: String(this.envConfig.INS_APP_KEY),
      secret: String(this.envConfig.INS_APP_SECRET),
    };
  }

  get microsoft() {
    return {
      clientId: String(this.envConfig.MS_CLIENT_ID),
      clientSecret: String(this.envConfig.MS_CLIENT_SECRET),
      authority: String(this.envConfig.MS_AUTHORITY),
    };
  }

  get mail() {
    return {
      host: String(this.envConfig.MAIL_HOST),
      port: Number(this.envConfig.MAIL_PORT),
      user: String(this.envConfig.MAIL_USER),
      pass: String(this.envConfig.MAIL_PASS),
      fromName: String(this.envConfig.MAIL_FROM_NAME),
      fromEmail: String(this.envConfig.MAIL_FROM_EMAIL),
    };
  }
  get appleClientId(): string {
    return String(this.envConfig.APPLE_CLIENT_ID);
  }
  get veroToken(): string {
    return String(this.envConfig.VERO_TOKEN);
  }
  get veroModeDev(): string {
    return String(this.envConfig.VERO_MODE_DEV);
  }

  get logLevel(): string {
    return String(this.envConfig.LOG_LEVEL);
  }

  get db(): DBConfig {
    return {
      host: String(this.envConfig.DB_HOST),
      port: Number(this.envConfig.DB_PORT),
      user: String(this.envConfig.DB_USER),
      pass: String(this.envConfig.DB_PASS),
      name: String(this.envConfig.DB_NAME),
      maxConnections: Number(this.envConfig.DB_MAX_CONNECTIONS),
    };
  }

  get redis(): RedisConfig {
    const url =
      'redis://' + this.envConfig.REDIS_HOST + ':' + this.envConfig.REDIS_PORT;
    return {
      host: String(this.envConfig.REDIS_HOST),
      port: Number(this.envConfig.REDIS_PORT),
      url,
    };
  }


  get rmq(): RmqConfig {
    if (!this.envConfig.RMQ_HOST) {
      return null;
    }
    const protocol = this.envConfig.RMQ_SSL === 'true' ? 'amqps' : 'amqp';
    let url = `${protocol}://`;
    if (this.envConfig.RMQ_USER) {
      url += this.envConfig.RMQ_USER;
      if (this.envConfig.RMQ_PASS) {
        url += `:${this.envConfig.RMQ_PASS}`;
      }
      url += '@';
    }
    url += `${this.envConfig.RMQ_HOST}`;
    if (this.envConfig.RMQ_PORT) {
      url += `:${this.envConfig.RMQ_PORT}`;
    }
    if (this.envConfig.RMQ_PATH) {
      url += `/${this.envConfig.RMQ_PATH}`;
    }

    return {
      url,
      name: String(this.envConfig.RMQ_NAME),
    };
  }

  get apiKey(): ApiKeyConfig {
    return {
      salt: String(this.envConfig.API_KEY_SALT),
    };
  }

  get aesAlgorithm(): AESAlgorithmConfig {
    return {
      key: String(this.envConfig.AES_ALGORITHM_KEY),
    };
  }

  get rsaAlgorithm() {
    return {
      publicKey: String(this.envConfig.RSA_ALGORITHM_PUBLIC_KEY),
      privateKey: String(this.envConfig.RSA_ALGORITHM_PRIVATE_KEY),
    };
  }

  get novuConfig(): NovuConfig {
    return {
      apiKey: String(this.envConfig.NOVU_API_KEY),
    };
  }

  private validateInput(envConfig: EnvConfig): EnvConfig {
    const envVarsSchema: Joi.ObjectSchema = Joi.object(this.validationScheme);

    const validation = envVarsSchema.validate(envConfig);
    return validation.value;
  }
}
