
export enum UserRole {
    ADMIN = "Admin",
    USER = "User",
    AIRLINE = "Airline"
}

export interface User {
    email : string,
    password : string
}