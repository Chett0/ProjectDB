import { Request, Response } from "express";
import { AuthenticatedRequest } from "../types/auth.types";
import { airlineRoute, airlines, airports, extras, routes } from "../../prisma/generated/prisma";
import * as airlineService from "../services/airline.service";
import * as airportService from "../services/airport.service";
import { AirlineDTO } from "../dtos/user.dto";
import { AirlineRouteDTO, DashBoardDTO, ExtraDTO } from "../dtos/airline.dto";
import { Extra, Route } from "../types/airline.types";
import { toAirportDTO } from "../dtos/airport.dto";

