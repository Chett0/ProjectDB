from flask import jsonify, request, Blueprint
from app.extensions import db
from models import Ticket, Flight, Passenger
from schema import ticket_schema, tickets_schema
from datetime import datetime
from decimal import Decimal, InvalidOperation


tickets_bp = Blueprint('tickets', __name__)


@tickets_bp.route('/tickets', methods=['POST'])
def create_ticket():
    try:
        data = request.get_json() or {}

        flight_id = data.get('flight_id')
        passenger_id = data.get('passenger_id')
        final_cost = data.get('final_cost')
        extras = data.get('extras')
        purchase_date = data.get('purchase_date')

        if not flight_id or not passenger_id or final_cost is None:
            return jsonify({"message": "flight_id, passenger_id and final_cost are required"}), 400

        flight = db.session.get(Flight, flight_id)
        if not flight:
            return jsonify({"message": "Flight not found"}), 404

        passenger = db.session.get(Passenger, passenger_id)
        if not passenger:
            return jsonify({"message": "Passenger not found"}), 404

        try:
            cost = Decimal(str(final_cost))
            if cost < 0:
                raise InvalidOperation()
        except (InvalidOperation, ValueError):
            return jsonify({"message": "final_cost must be a non-negative number"}), 400

        pd = None
        if purchase_date:
            try:
                pd = datetime.fromisoformat(purchase_date)
            except Exception:
                return jsonify({"message": "purchase_date must be ISO format"}), 400

        new_ticket = Ticket(
            flight_id=flight_id,
            passenger_id=passenger_id,
            final_cost=cost,
            purchase_date=pd if pd is not None else datetime.utcnow(),
            extras=extras
        )

        db.session.add(new_ticket)
        db.session.commit()

        return jsonify({"message": "Ticket created successfully", "ticket": ticket_schema.dump(new_ticket)}), 201

    except Exception as e:
        print(e)
        return jsonify({"message": "Error creating ticket"}), 500


@tickets_bp.route('/tickets', methods=['GET'])
def get_tickets():
    try:
        page_number = request.args.get('page', 1, type=int)
        limit = request.args.get('limit', 10, type=int)
        passenger_id = request.args.get('passenger_id', type=int)
        flight_id = request.args.get('flight_id', type=int)

        query = Ticket.query
        if passenger_id:
            query = query.filter_by(passenger_id=passenger_id)
        if flight_id:
            query = query.filter_by(flight_id=flight_id)

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
def get_ticket_by_id(ticket_id):
    try:
        ticket = db.session.get(Ticket, ticket_id)
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
