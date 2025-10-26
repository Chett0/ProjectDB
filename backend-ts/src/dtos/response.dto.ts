interface APIResponseDTO<T> {
  success: boolean,
  message: string,
  data?: T
}

export type {
    APIResponseDTO
}

