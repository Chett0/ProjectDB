from flask import jsonify, request, Blueprint
from app.extensions import db
from models import Ticket, Flight, Passenger, UserRole, Seat, SeatState, BookingState, TicketExtra
from schema import ticket_schema, tickets_schema
from datetime import datetime
from decimal import Decimal, InvalidOperation
from flask_jwt_extended import get_jwt_identity

from middleware.auth import roles_required


tickets_bp = Blueprint('tickets', __name__)


@tickets_bp.route('/tickets', methods=['POST'])
@roles_required([UserRole.PASSENGER.value])
def create_ticket():
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
            return jsonify({"message": "Flight not found"}), 404

        try:
            cost = Decimal(str(final_cost))
            if cost < 0:
                raise InvalidOperation()
        except (InvalidOperation, ValueError):
            return jsonify({"message": "final_cost must be a non-negative number"}), 400
            
        seat = Seat.query.filter_by(number=seat_number, flight_id=flight_id).first()
        if not seat:
            return jsonify({"message": "Seat not found"}), 404
        
        if seat.state != SeatState.AVAILABLE:
            return jsonify({"message": "Seat not available"}), 404

        new_ticket = Ticket(
            flight_id=flight_id,
            passenger_id=passenger_id,
            final_cost=cost,
            seat=seat.id,
            state=BookingState.PENDING,
        )

        seat.state = SeatState.RESERVED

        db.session.add(new_ticket)
        db.session.flush()

        for extra_id in extras:
            # assuming we are passing extra id and don't need a check for existence
            extra_ticket = TicketExtra(
                ticket_id = new_ticket.id,
                extra_id = extra_id
            )

            db.add(extra_ticket)


        db.session.commit()

        return jsonify({"message": "Ticket created successfully", "ticket": ticket_schema.dump(new_ticket)}), 201

    except Exception as e:
        print(e)
        return jsonify({"message": "Error creating ticket"}), 500
    

@tickets_bp.route('/tickets/<int:ticket_id>', methods=['POST'])
@roles_required([UserRole.PASSENGER.value])
def confirm_ticket(ticket_id):
    try: 
        passenger_id = get_jwt_identity()
        ticket = Ticket.query.filter_by(id=ticket_id, passenger_id=passenger_id)
        if not ticket:
            return jsonify({"message": "Ticket not found"}), 404
        
        ticket.state = BookingState.CONFIRMED
        ticket.purchase_date = datetime.now()
        return jsonify({"message": "Ticket confirmed successfully"}), 200
    except Exception as e:
        print(e)
        return jsonify({"message": "Internal server error while conferming tickets"}), 500


@tickets_bp.route('/tickets', methods=['GET'])
@roles_required([UserRole.PASSENGER.value])
def get_tickets():
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
    try:
        passenger_id = get_jwt_identity()
        
        ticket = Ticket.query.filter_by(id=ticket_id, passenger=passenger_id)
        if not ticket:
            return jsonify({"message": "Ticket not found"}), 404

        return jsonify({"message": "Ticket retrieved successfully", "ticket": ticket_schema.dump(ticket)}), 200

    except Exception as e:
        print(e)
        return jsonify({"message": "Error retrieving ticket"}), 500






@tickets_bp.route('/tickets/<int:ticket_id>', methods=['PATCH'])
def update_ticket(ticket_id):
    try:
        ticket = db.session.get(Ticket, ticket_id)
        if not ticket:
            return jsonify({"message": "Ticket not found"}), 404

        data = request.get_json() or {}
        extras = data.get('extras')
        final_cost = data.get('final_cost')

        if extras is not None:
            ticket.extras = extras

        if final_cost is not None:
            try:
                cost = Decimal(str(final_cost))
                if cost < 0:
                    raise InvalidOperation()
                ticket.final_cost = cost
            except (InvalidOperation, ValueError):
                return jsonify({"message": "final_cost must be a non-negative number"}), 400

        db.session.commit()

        return jsonify({"message": "Ticket updated successfully", "ticket": ticket_schema.dump(ticket)}), 200

    except Exception as e:
        print(e)
        return jsonify({"message": "Error updating ticket"}), 500


@tickets_bp.route('/tickets/<int:ticket_id>', methods=['DELETE'])
def delete_ticket(ticket_id):
    try:
        ticket = db.session.get(Ticket, ticket_id)
        if not ticket:
            return jsonify({"message": "Ticket not found"}), 404

        db.session.delete(ticket)
        db.session.commit()

        return jsonify({"message": "Ticket deleted successfully"}), 200

    except Exception as e:
        print(e)
        return jsonify({"message": "Error deleting ticket"}), 500    
