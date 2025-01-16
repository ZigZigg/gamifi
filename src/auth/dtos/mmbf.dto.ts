export interface MmbfInformationDto {
    tokenSso: string;
}

export interface MmfRegisterSession {
    tokenSso: string;
    phone: string;
    ctkmId: string;
}
export interface MmbfUpdateGameResultRequest{
    sessionId: string;
    ctkmId: string;
    point: number;
    totalPoint: number;
}