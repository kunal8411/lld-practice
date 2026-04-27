type VehicleType = "Car" | "Bike" | "Truck";

class ParkingSpot {
  private occupied: boolean = false;

  constructor(public id: string, public type: VehicleType) {}

  isAvailable(): boolean {
    return !this.occupied;
  }

  park(): void {
    this.occupied = true;
  }

  unpark(): void {
    this.occupied = false;
  }
}

class Floor {
  private spots: ParkingSpot[] = [];

  constructor(config: Record<VehicleType, number>, floorNumber: number) {
    let id = 0;

    for (let type in config) {
      for (let i = 0; i < config[type as VehicleType]; i++) {
        this.spots.push(
          new ParkingSpot(
            `F${floorNumber}-${type}-${id++}`,
            type as VehicleType
          )
        );
      }
    }
  }

  getAllSpots(): ParkingSpot[] {
    return this.spots;
  }
}
class Vehicle {
  constructor(private id: string, private type: VehicleType) {}

  getId() {
    return this.id;
  }

  getType() {
    return this.type;
  }
}
class Ticket {
  private entryTime: Date;

  constructor(
    private id: string,
    private vehicle: Vehicle,
    private spot: ParkingSpot
  ) {
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
interface PricingStrategy {
  calculate(entry: Date, exit: Date): number;
}

class FlatRatePricing implements PricingStrategy {
  calculate(entry: Date, exit: Date): number {
    const hours = Math.ceil(
      (exit.getTime() - entry.getTime()) / (1000 * 60 * 60)
    );
    return hours * 10; // flat ₹10/hour
  }
}

class ParkingLot {
  private floors: Floor[] = [];
  private spotMap: Map<string, ParkingSpot> = new Map();
  private availableSlots: Map<VehicleType, Set<ParkingSpot>> = new Map();
  private ticketMap: Map<string, Ticket> = new Map();
  private vehicleMap: Map<string, string> = new Map(); // vehicleId → ticketId
  private pricingStrategy: PricingStrategy = new FlatRatePricing();

  constructor(floorConfigs: Record<VehicleType, number>[]) {
    this.floors = floorConfigs.map((config, i) => new Floor(config, i + 1));

    for (let floor of this.floors) {
      for (let spot of floor.getAllSpots()) {
        this.spotMap.set(spot.id, spot);

        if (!this.availableSlots.has(spot.type)) {
          this.availableSlots.set(spot.type, new Set());
        }

        this.availableSlots.get(spot.type)!.add(spot);
      }
    }
  }

  park(vehicle: Vehicle): Ticket | string {
    // prevent duplicate parking
    if (this.vehicleMap.has(vehicle.getId())) {
      return "Vehicle already parked";
    }

    const available = this.availableSlots.get(vehicle.getType());

    if (!available || available.size === 0) {
      return "No space available";
    }

    const iterator = available.values().next();

    if (iterator.done) {
      return "No space available"; // safety guard
    }

    const spot = iterator.value;
    available.delete(spot);

    spot.park();

    const ticketId = `T-${Date.now()}-${Math.random()}`;
    const ticket = new Ticket(ticketId, vehicle, spot);

    this.ticketMap.set(ticketId, ticket);
    this.vehicleMap.set(vehicle.getId(), ticketId);

    return ticket;
  }

  unpark(ticketId: string): number {
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
    this.availableSlots.get(spot.type)!.add(spot)!;

    // calculate price
    const exitTime = new Date();
    const price = this.pricingStrategy.calculate(
      ticket.getEntryTime(),
      exitTime
    );

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
