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