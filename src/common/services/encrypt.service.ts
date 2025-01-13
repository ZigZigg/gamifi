import { Injectable } from '@nestjs/common';
import { AES, enc, HmacSHA512 } from 'crypto-js';
import { ClassConstructor, plainToInstance } from 'class-transformer';
import * as crypto from 'crypto';

@Injectable()
export class EncryptService {
  constructor() {}

  encryptUseRSA(publicKey: string, data: string): string {
    const encryptedData = crypto.publicEncrypt(
      {
        key: publicKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha256',
      },
      Buffer.from(data),
    );

    return encryptedData.toString('base64');
  }

  decryptUseRSA<T>(
    privateKey: string,
    encryptedDataInBase64: string,
    cls: ClassConstructor<T>,
  ): T {
    const encryptedData = Buffer.from(encryptedDataInBase64, 'base64');
    const decryptedData = crypto.privateDecrypt(
      {
        key: privateKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha256',
      },
      encryptedData,
    );
    return plainToInstance(cls, JSON.parse(decryptedData.toString('utf8')));
  }

  encryptUseAES<T>(data: T, privateKey: string): string {
    return AES.encrypt(JSON.stringify(data), privateKey).toString();
  }

  decryptUseAES<T>(
    encryptedData: string,
    privateKey: string,
    cls: ClassConstructor<T>,
  ): T {
    const bytes = AES.decrypt(encryptedData, privateKey);

    return plainToInstance(cls, JSON.parse(bytes.toString(enc.Utf8)));
  }

  hash(data: string, salt: string): string {
    return HmacSHA512(data, salt).toString();
  }
}
