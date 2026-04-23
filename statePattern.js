var createOrderState = /** @class */ (function () {
    function createOrderState() {
    }
    createOrderState.prototype.pay = function (order) {
        console.log("Order paid");
        order.setState(new PaidState());
    };
    createOrderState.prototype.ship = function () {
        throw new Error("Cannot ship before payment");
    };
    return createOrderState;
}());
var PaidState = /** @class */ (function () {
    function PaidState() {
    }
    PaidState.prototype.pay = function (order) {
        throw new Error("Already paid");
    };
    PaidState.prototype.ship = function (order) {
        console.log("Order shipped");
        order.setState(new ShippedState());
    };
    return PaidState;
}());
var ShippedState = /** @class */ (function () {
    function ShippedState() {
    }
    ShippedState.prototype.pay = function (order) {
        throw new Error("Already paid and shipped");
    };
    ShippedState.prototype.ship = function (order) {
        throw new Error("Already shipped");
    };
    return ShippedState;
}());
var Order = /** @class */ (function () {
    //imitialize with created state
    function Order() {
        this.state = new createOrderState();
    }
    Order.prototype.setState = function (state) {
        this.state = state;
    };
    Order.prototype.pay = function () {
        this.state.pay(this);
    };
    Order.prototype.ship = function () {
        this.state.ship(this);
    };
    return Order;
}());
var order = new Order();
order.pay(); // Created → Paid
order.ship(); // Paid → Shipped
var DraftBooks = /** @class */ (function () {
    function DraftBooks() {
    }
    DraftBooks.prototype.addBooks = function (state) {
        console.log("Books added to draft");
        state.setState(new PublishBooks());
    };
    DraftBooks.prototype.removeBooks = function () {
        throw new Error("Cannot remove books from draft");
    };
    return DraftBooks;
}());
var PublishBooks = /** @class */ (function () {
    function PublishBooks() {
    }
    PublishBooks.prototype.addBooks = function (state) {
        throw new Error("cannot add books when published");
    };
    PublishBooks.prototype.removeBooks = function () {
        console.log("Books removed from published");
    };
    return PublishBooks;
}());
var BooksService = /** @class */ (function () {
    //initial value to draft state
    function BooksService() {
        this.state = new DraftBooks();
    }
    BooksService.prototype.setState = function (newState) {
        this.state = newState;
    };
    BooksService.prototype.getState = function () {
        return this.state;
    };
    // 1. ADD THIS: A wrapper method
    BooksService.prototype.addBooks = function () {
        // The service tells the state: "You handle this"
        this.state.addBooks(this);
    };
    // 2. ADD THIS: A wrapper method
    BooksService.prototype.removeBooks = function () {
        this.state.removeBooks();
    };
    return BooksService;
}());
var b1 = new BooksService();
b1.addBooks();
b1.addBooks();
