import { APIResponseDTO } from "../../dtos/response.dto"
import { Response } from "express";

const successResponse = <T>(
    res: Response,
    message: string,
    data?: T,
    statusCode: number = 200
) : Response => {

    const response : APIResponseDTO<T> = {
        success: true,
        message: message,
    }
    if(data)
        response.data = data;

    return res.status(statusCode).json(response);
}

const errorResponse = <T>(
    res: Response,
    message: string,
    data?: T,
    statusCode: number = 500
) : Response => {

    const response : APIResponseDTO<T> = {
        success: false,
        message: message
    }
    if(data)
        response.data = data;

    return res.status(statusCode).json(response);
}

const missingFieldsResponse = (
    res: Response
) : Response => {
    return errorResponse(
        res, 
        "Missing required fields",
        null,
        400
    );
}


const notFoundResponse = (
    res: Response,
    message: string
) : Response => {
    return errorResponse(
        res, 
        message,
        null,
        404
    );
}


export {
    successResponse,
    errorResponse,
    missingFieldsResponse,
    notFoundResponse
}