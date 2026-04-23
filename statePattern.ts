interface OrderState {
  pay(amount: Order): void;
  ship(order: Order): void;
}

class createOrderState implements OrderState {
  pay(order: Order): void {
    console.log("Order paid");
    order.setState(new PaidState());
  }
  ship(): void {
    throw new Error("Cannot ship before payment");
  }
}

class PaidState implements OrderState {
  pay(order: Order) {
    throw new Error("Already paid");
  }

  ship(order: Order) {
    console.log("Order shipped");
    order.setState(new ShippedState());
  }
}

class ShippedState implements OrderState {
  pay(order: Order) {
    throw new Error("Already paid and shipped");
  }
  ship(order: Order) {
    throw new Error("Already shipped");
  }
}

class Order {
  private state: OrderState;

  //imitialize with created state
  constructor() {
    this.state = new createOrderState();
  }

  setState(state: OrderState) {
    this.state = state;
  }

  pay() {
    this.state.pay(this);
  }

  ship() {
    this.state.ship(this);
  }
}

const order = new Order();

order.pay(); // Created → Paid
order.ship(); // Paid → Shipped

interface BookState {
  addBooks(state:BooksService): void;
  removeBooks(): void;
}
class DraftBooks implements BookState {
  addBooks(state:BooksService): void {
    console.log("Book added to draft");
    state.setState(new PublishBooks());
  }
  removeBooks(): void {
    throw new Error("Cannot remove books from draft");
  }
}

class PublishBooks implements BookState {
  addBooks(state:BooksService) {
    throw new Error("cannot add books when published");
  }
  removeBooks() {
    console.log("Book removed from published");
  }
}


class BooksService{
    private state: BookState;

    //initial value to draft state
    constructor(){
        this.state = new DraftBooks();
    }

    setState(newState: BookState){
        this.state= newState;
    }
    getState(){
        return this.state;
    }
    // 1. ADD THIS: A wrapper method
    addBooks() {
        // The service tells the state: "You handle this"
        this.state.addBooks(this);
    }

    // 2. ADD THIS: A wrapper method
    removeBooks() {
        this.state.removeBooks();
    }
}


let b1= new BooksService();
b1.addBooks();
b1.addBooks();