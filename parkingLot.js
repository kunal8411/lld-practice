"use strict";
class ParkingSpot {
    id;
    type;
    occupied = false;
    constructor(id, type) {
        this.id = id;
        this.type = type;
    }
    isAvailable() {
        return !this.occupied;
    }
    park() {
        this.occupied = true;
    }
    unpark() {
        this.occupied = false;
    }
}
class Floor {
    spots = [];
    constructor(config, floorNumber) {
        let id = 0;
        for (let type in config) {
            for (let i = 0; i < config[type]; i++) {
                this.spots.push(new ParkingSpot(`F${floorNumber}-${type}-${id++}`, type));
            }
        }
    }
    getAllSpots() {
        return this.spots;
    }
}
class Vehicle {
    id;
    type;
    constructor(id, type) {
        this.id = id;
        this.type = type;
    }
    getId() {
        return this.id;
    }
    getType() {
        return this.type;
    }
}
class Ticket {
    id;
    vehicle;
    spot;
    entryTime;
    constructor(id, vehicle, spot) {
        this.id = id;
        this.vehicle = vehicle;
        this.spot = spot;
        this.entryTime = new Date();
    }
    getId() {
        return this.id;
    }
    getSpot() {
        return this.spot;
    }
    getEntryTime() {
        return this.entryTime;
    }
    getVehicle() {
        return this.vehicle;
    }
}
class FlatRatePricing {
    calculate(entry, exit) {
        const hours = Math.ceil((exit.getTime() - entry.getTime()) / (1000 * 60 * 60));
        return hours * 10; // flat ₹10/hour
    }
}
class ParkingLot {
    floors = [];
    spotMap = new Map();
    availableSlots = new Map();
    ticketMap = new Map();
    vehicleMap = new Map(); // vehicleId → ticketId
    pricingStrategy = new FlatRatePricing();
    constructor(floorConfigs) {
        this.floors = floorConfigs.map((config, i) => new Floor(config, i + 1));
        for (let floor of this.floors) {
            for (let spot of floor.getAllSpots()) {
                this.spotMap.set(spot.id, spot);
                if (!this.availableSlots.has(spot.type)) {
                    this.availableSlots.set(spot.type, new Set());
                }
                this.availableSlots.get(spot.type).add(spot);
            }
        }
    }
    park(vehicle) {
        // prevent duplicate parking
        if (this.vehicleMap.has(vehicle.getId())) {
            return "Vehicle already parked";
        }
        const available = this.availableSlots.get(vehicle.getType());
        if (!available || available.size === 0) {
            return "No space available";
        }
        const spot = available.values().next().value;
        available.delete(spot);
        spot.park();
        const ticketId = `T-${Date.now()}-${Math.random()}`;
        const ticket = new Ticket(ticketId, vehicle, spot);
        this.ticketMap.set(ticketId, ticket);
        this.vehicleMap.set(vehicle.getId(), ticketId);
        return ticket;
    }
    unpark(ticketId) {
        const ticket = this.ticketMap.get(ticketId);
        if (!ticket) {
            throw new Error("Invalid ticket");
        }
        const spot = ticket.getSpot();
        const vehicle = ticket.getVehicle();
        if (spot.isAvailable()) {
            throw new Error("Already unparked");
        }
        // free spot
        spot.unpark();
        this.availableSlots.get(spot.type).add(spot);
        // calculate price
        const exitTime = new Date();
        const price = this.pricingStrategy.calculate(ticket.getEntryTime(), exitTime);
        // cleanup
        this.ticketMap.delete(ticketId);
        this.vehicleMap.delete(vehicle.getId());
        return price;
    }
}
const parkingLot = new ParkingLot([
    { Car: 5, Bike: 5, Truck: 2 },
    { Car: 3, Bike: 2, Truck: 1 },
]);
const car = new Vehicle("V1", "Car");
const ticket = parkingLot.park(car);
if (typeof ticket !== "string") {
    console.log("Parked:", ticket.getId());
    const price = parkingLot.unpark(ticket.getId());
    console.log("Unparked. Price:", price);
}
