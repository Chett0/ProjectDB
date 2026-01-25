import { Decimal } from "@prisma/client/runtime/library";
import { tickets } from '@prisma/client';

export interface TicketInfoDTO {
    id: number;
    seatNumber: string;
    final_cost: Decimal;
}