import { Decimal } from "@prisma/client/runtime/library";
import { tickets } from "../../prisma/generated/prisma";

class TicketInfoDTO {
    id: number;
    seatNumber: string;
    final_cost: Decimal;

    constructor(id: number, seatNumber: string, final_cost: Decimal) {
        this.id = id;
        this.seatNumber = seatNumber;
        this.final_cost = final_cost;
    }

    static fromPrisma(ticket: tickets, seatNumber : string): TicketInfoDTO {
        return new TicketInfoDTO(
            ticket.id,
            seatNumber,
            ticket.final_cost
        );
    }
}

export {
    TicketInfoDTO
}