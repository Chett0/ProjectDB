export interface Response<T> {
  success: boolean,
  message: string,
  data?: T
}

export interface AuthResp {
  accessToken : string,
  refreshToken: string,
  role : string
}

export interface RefreshTokenResponse {
  accessToken: string;
  role: string;
}