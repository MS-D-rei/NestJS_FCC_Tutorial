export interface IJwtPayload {
  sub: number;
  email: string;
}

export interface IJwtPayloadWithRefreshToken {
  sub: number;
  email: string;
  refresh_token: string;
}
