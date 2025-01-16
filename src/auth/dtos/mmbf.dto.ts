export interface MmbfInformationDto {
    tokenSso: string;
}

export interface MmfRegisterSession {
    tokenSso: string;
    phone: string;
    ctkmId: string;
    rewardId: number;
}
export interface MmbfUpdateGameResultRequest{
    sessionId: string;
    ctkmId: string;
    point: number;
    totalPoint: number;
    rewardId: number;
}