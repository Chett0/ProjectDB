import { APIResponseDTO } from "../../dtos/response.dto"
import { Response } from "express";

const setResponse = <T>(
    res: Response,
    success: boolean,
    statusCode: number,
    message: string,
    data?: T 
) : void => {
    const response : APIResponseDTO<T> = {
        success: success,
        message: message
    }

    if(data)
        response.data = data;

    res.status(statusCode).json(response);
}

const setMissingFieldsResponse = (
    res: Response
) : void => {
    setResponse(
        res,
        false, 
        400,
        "Missing required fields"
    )
}


export {
    setResponse,
    setMissingFieldsResponse
}