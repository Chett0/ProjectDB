interface UserDTO {
  email: string;
  password: string;
};


interface PassengerDTO {
    id: number,
    name: string,
    surname: string
}

interface PassengerUserDTO extends PassengerDTO{
    email: string
}

interface AdminDTO {
    email: string
}

interface TokenDTO {
    accessToken: string,
    role: string
}

interface AirlineDTO {
    id: number, 
    name: string,
    code: string,
}


export type {
    UserDTO,
    PassengerDTO,
    AdminDTO,
    TokenDTO,
    AirlineDTO,
    PassengerUserDTO
}