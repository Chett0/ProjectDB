import traceback
from flask import jsonify, request, Blueprint
from app.extensions import db, cache
from models import Ticket, Flight, Passenger, UserRole, Seat, SeatState, BookingState, TicketExtra, Aircraft
from schema import ticket_schema, tickets_schema
from datetime import datetime
from decimal import Decimal, InvalidOperation
from flask_jwt_extended import get_jwt_identity

from middleware.auth import roles_required


tickets_bp = Blueprint('tickets', __name__)


@tickets_bp.route('/tickets', methods=['POST'])
@roles_required([UserRole.PASSENGER.value])
def create_ticket():
    """
    Creates a new ticket for the authenticated passenger on a specified flight.

    This endpoint is protected and only accessible by users with the PASSENGER role. It validates
    input data, checks seat availability, creates a ticket, and associates any extras with it.

    Request JSON parameters:
        - flight_id (int, required): The ID of the flight to book.
        - final_cost (float or str, required): The total cost of the ticket.
        - seat_number (str, optional): The seat number to book.
        - extras (list of int, optional): List of extra service IDs to include with the ticket.

    Responses:
        - 201 Created: Ticket successfully created.
            {
                "message": "Ticket created successfully",
                "ticket": <serialized_ticket_data>
            }
        - 400 Bad Request: Missing required fields or invalid final_cost.
            {
                "message": "flight_id, passenger_id and final_cost are required" / 
                           "final_cost must be a non-negative number"
            }
        - 404 Not Found: Flight or seat does not exist, or seat is not available.
            {
                "message": "Flight not found" / "Seat not found" / "Seat not available"
            }
        - 500 Internal Server Error: Unexpected error during ticket creation.
            {
                "message": "Error creating ticket"
            }

    Notes:
        - Uses `db.session.begin()` to ensure transactional integrity.
        - Seat state is updated atomically with ticket creation.
        - Related airline cache entries are invalidated after creation.
        - Exceptions are logged and the session is rolled back on error.
    """
    try:
        passenger_id = get_jwt_identity()
        data = request.get_json() or {}

        flight_id = data.get('flight_id')
        final_cost = data.get('final_cost')
        extras = data.get('extras')
        seat_number = data.get('seat_number')

        if not flight_id or not passenger_id or not final_cost:
            return jsonify({"message": "flight_id, passenger_id and final_cost are required"}), 400

        flight = db.session.get(Flight, flight_id)
        if not flight:
            print("Flight not found")
            return jsonify({"message": "Flight not found"}), 404

        try:
            cost = Decimal(str(final_cost))
            if cost < 0:
                raise InvalidOperation()
        except (InvalidOperation, ValueError):
            return jsonify({"message": "final_cost must be a non-negative number"}), 400
            
        with db.session.begin():
        
            seat = Seat.query.filter_by(number=seat_number, flight_id=flight_id).first()
            if not seat:
                print("Seat not found")
                return jsonify({"message": "Seat not found"}), 404
            
            if seat.state != SeatState.AVAILABLE:
                print("Seat not available")
                return jsonify({"message": "Seat not available"}), 404

            new_ticket = Ticket(
                flight_id=flight_id,
                passenger_id=passenger_id,
                final_cost=cost,
                seat_id=seat.id,
                state=BookingState.CONFIRMED,
                purchase_date = datetime.now()
            )

            seat.state = SeatState.BOOKED

            db.session.add(new_ticket)
            db.session.flush()

            for extra_id in extras:
                # assuming we are passing extra id and don't need a check for existence
                extra_ticket = TicketExtra(
                    ticket_id = new_ticket.id,
                    extra_id = extra_id
                )

                db.session.add(extra_ticket)

            airline_id = db.session.query(Aircraft.airline_id).join(Flight, Flight.aircraft_id == Aircraft.id).filter(Flight.id == flight_id).first()

            db.session.commit()
            cache.delete(f'airline_passenger_count_{airline_id}')
            cache.delete(f'airline_monthly_income_{airline_id}')

        return jsonify({"message": "Ticket created successfully", "ticket": ticket_schema.dump(new_ticket)}), 201

    except Exception as e:
        db.session.rollback()
        print(e)
        traceback.print_exc()
        return jsonify({"message": "Error creating ticket"}), 500
    

@tickets_bp.route('/tickets/bulk', methods=['POST'])
@roles_required([UserRole.PASSENGER.value])
def buy_n_ticket():
    """
    Creates multiple tickets for the authenticated passenger in a single request.

    This endpoint is protected and only accessible by users with the PASSENGER role. It validates
    each ticket, checks seat availability, creates tickets, associates extras, and ensures
    transactional integrity.

    Request JSON parameters:
        - tickets (list of dict, required): List of tickets to purchase. Each ticket must include:
            - flight_id (int, required): The ID of the flight.
            - final_cost (float or str, required): The total cost of the ticket.
            - seat_number (str, required): Seat number to book.
            - extras (list of int, optional): List of extra service IDs.

    Responses:
        - 201 Created: Tickets successfully created.
            {
                "message": "tickets created successfully",
                "tickets": [<serialized_ticket_data>, ...]
            }
        - 400 Bad Request: Missing required fields, invalid `final_cost`, or seat/flight not available.
            {
                "message": "<detailed error message>"
            }
        - 500 Internal Server Error: Unexpected error during ticket creation.
            {
                "message": "Error creating tickets"
            }

    Notes:
        - Uses `db.session.begin_nested()` to ensure that all ticket operations are transactional.
        - Seat states are updated atomically with ticket creation.
        - Related airline cache entries are invalidated after ticket creation.
        - Exceptions are logged and the session is rolled back on error.
    """
    try:
        passenger_id = get_jwt_identity()
        data = request.get_json() or {}

        tickets_data = data.get("tickets") 
        if not tickets_data:
            return jsonify({"message": "You must provide at least 1 tickets"}), 400

        created_tickets = []

        
        with db.session.begin_nested():
            for ticket_info in tickets_data:
                flight_id = ticket_info.get("flight_id")
                final_cost = ticket_info.get("final_cost")
                extras = ticket_info.get("extras", [])
                seat_number = ticket_info.get("seat_number")

                if not flight_id or not passenger_id or not final_cost:
                    raise ValueError("flight_id, passenger_id and final_cost are required")

                flight = db.session.get(Flight, flight_id)
                if not flight:
                    raise ValueError(f"Flight {flight_id} not found")

                try:
                    cost = Decimal(str(final_cost))
                    if cost < 0:
                        raise InvalidOperation()
                except (InvalidOperation, ValueError):
                    raise ValueError("final_cost must be a non-negative number")

                seat = Seat.query.filter_by(number=seat_number, flight_id=flight_id).first()
                if not seat:
                    raise ValueError(f"Seat {seat_number} not found for flight {flight_id}")

                if seat.state != SeatState.AVAILABLE:
                    raise ValueError(f"Seat {seat_number} not available")

                new_ticket = Ticket(
                    flight_id=flight_id,
                    passenger_id=passenger_id,
                    final_cost=cost,
                    seat_id=seat.id,
                    state=BookingState.CONFIRMED,
                    purchase_date=datetime.now()
                )

                seat.state = SeatState.BOOKED

                db.session.add(new_ticket)
                db.session.flush()

                for extra_id in extras:
                    extra_ticket = TicketExtra(
                        ticket_id=new_ticket.id,
                        extra_id=extra_id
                    )
                    db.session.add(extra_ticket)

                created_tickets.append(new_ticket)

        airline_id = db.session.query(Aircraft.airline_id).join(Flight, Flight.aircraft_id == Aircraft.id).filter(Flight.id == flight_id).first()

        db.session.commit()
        cache.delete(f'airline_passenger_count_{airline_id}')
        cache.delete(f'airline_monthly_income_{airline_id}')

        return jsonify({
            "message": "tickets created successfully",
            "tickets": [ticket_schema.dump(t) for t in created_tickets]
        }), 201

    except ValueError as ve:
        db.session.rollback()
        return jsonify({"message": str(ve)}), 400
    except Exception as e:
        db.session.rollback()
        print(e)
        traceback.print_exc()
        return jsonify({"message": "Error creating tickets"}), 500


@tickets_bp.route('/tickets', methods=['GET'])
@roles_required([UserRole.PASSENGER.value])
def get_tickets():
    """
    Retrieves a paginated list of tickets for the authenticated passenger.

    This endpoint is protected and only accessible by users with the PASSENGER role. It supports
    pagination via query parameters and returns the passenger's tickets along with total page count.

    Query Parameters:
        - page (int, optional): The page number to retrieve. Defaults to 1.
        - limit (int, optional): Number of tickets per page. Defaults to 10.

    Responses:
        - 200 OK: Tickets successfully retrieved.
            {
                "message": "Tickets retrieved successfully",
                "tickets": [<serialized_ticket_data>, ...],
                "total_pages": <number_of_pages>
            }
        - 404 Not Found: Passenger ID not provided or invalid.
            {
                "message": "Passenger is required"
            }
        - 500 Internal Server Error: Unexpected error while retrieving tickets.
            {
                "message": "Error retrieving tickets"
            }
    """
    try:
        passenger_id = get_jwt_identity()

        page_number = request.args.get('page', 1, type=int)
        limit = request.args.get('limit', 10, type=int)

        if not passenger_id:
            return jsonify({"message": "Passenger is required"}), 404

        query = Ticket.query
        query = query.filter_by(passenger_id=passenger_id)

        total_items = query.count()
        total_pages = (total_items + limit - 1) // limit if total_items > 0 else 0
        offset = (page_number - 1) * limit

        tickets = query.offset(offset).limit(limit).all()

        return jsonify({
            "message": "Tickets retrieved successfully",
            "tickets": tickets_schema.dump(tickets),
            "total_pages": total_pages
        }), 200

    except Exception as e:
        print(e)
        return jsonify({"message": "Error retrieving tickets"}), 500


@tickets_bp.route('/tickets/<int:ticket_id>', methods=['GET'])
@roles_required([UserRole.PASSENGER.value])
def get_ticket_by_id(ticket_id):
    """
    Retrieves a specific ticket for the authenticated passenger by its ID.

    This endpoint is protected and only accessible by users with the PASSENGER role. It ensures
    that the requested ticket belongs to the authenticated passenger before returning it.

    URL Parameters:
        - ticket_id (int): The ID of the ticket to retrieve.

    Responses:
        - 200 OK: Ticket successfully retrieved.
            {
                "message": "Ticket retrieved successfully",
                "ticket": <serialized_ticket_data>
            }
        - 404 Not Found: Ticket does not exist or does not belong to the passenger.
            {
                "message": "Ticket not found"
            }
        - 500 Internal Server Error: Unexpected error while retrieving the ticket.
            {
                "message": "Error retrieving ticket"
            }
    """
    try:
        passenger_id = get_jwt_identity()
        
        ticket = Ticket.query.filter_by(id=ticket_id, passenger=passenger_id)
        if not ticket:
            return jsonify({"message": "Ticket not found"}), 404

        return jsonify({"message": "Ticket retrieved successfully", "ticket": ticket_schema.dump(ticket)}), 200

    except Exception as e:
        print(e)
        return jsonify({"message": "Error retrieving ticket"}), 500







