-- Update aircrafts if and only if they don't have any flights registered in the future

CREATE OR REPLACE FUNCTION check_aircraft_delete()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.active = FALSE AND OLD.active = TRUE THEN
        IF EXISTS (SELECT 1 FROM flights f WHERE f.aircraft_id = OLD.id AND f.arrival_time >= NOW()) THEN
            RAISE EXCEPTION 'Aircraft cannot be modified';
        END IF;
        NEW.deletion_time := NOW();
    END IF;

    IF NEW.active = TRUE AND OLD.active = FALSE THEN 
        NEW.deletion_time := NULL;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER aircraft_trg
BEFORE UPDATE ON aircrafts
FOR EACH ROW
EXECUTE FUNCTION check_aircraft_delete();





-- Update airline route if and only if they don't have any flights registered in the future

CREATE OR REPLACE FUNCTION check_airline_route_delete()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.active = FALSE AND OLD.active = TRUE THEN
        IF EXISTS (SELECT 1 FROM flights f WHERE f.route = OLD.route_id AND f.arrival_time >= NOW()) THEN
            RAISE EXCEPTION 'Airline route cannot be modified';
        END IF;
        NEW.deletion_time := NOW();
    END IF;

    IF NEW.active = TRUE AND OLD.active = FALSE THEN 
        NEW.deletion_time := NULL;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER airline_route_trg
BEFORE UPDATE ON "airlineRoute"
FOR EACH ROW
EXECUTE FUNCTION check_airline_route_delete();






