import { Decimal } from "@prisma/client/runtime/library";
import { tickets } from '@prisma/client';

export interface TicketInfoDTO {
    id: number;
    seatNumber: string;
    finalCost: Decimal;
}

export const toTicketInfoDTO = (ticket: tickets, seatNumber: string): TicketInfoDTO => ({
    id: ticket.id,
    seatNumber: seatNumber,
    finalCost: ticket.final_cost,
})

// export interface FullTicketInfoDTO {
//     id: number;

// }