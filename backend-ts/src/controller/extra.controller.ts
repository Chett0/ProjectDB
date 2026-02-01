import { Response, Request } from "express";
import { AuthenticatedRequest } from "../types/auth.types";
import { BadRequestError, UnauthorizedError } from "../utils/errors";
import { asyncHandler } from "../utils/helpers/asyncHandler.helper";
import * as airlineService from "../services/airline.service";
import { successResponse } from "../utils/helpers/response.helper";
import { ExtraDTO } from "../dtos/airline.dto";


export const getExtraByAirlineId = asyncHandler(
    async(req : AuthenticatedRequest, res : Response): Promise<Response> => {

        const airlineId : number | undefined = Number(req.params.airlineId);
        if(!airlineId)
            throw new BadRequestError("Missing airline ID parameter");

        const extras : ExtraDTO[] = await airlineService.getAirlineExtras(airlineId);

        return successResponse<ExtraDTO[]>(
            res, 
            "Airline extras retrieved successfully", 
            extras
        );
    }
);