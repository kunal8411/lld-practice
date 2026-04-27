"use strict";
// Concrete component
class SimpleCoffee {
    getCost() {
        return 1.00;
    }
    getDescription() {
        return "Simple coffee";
    }
}
// Abstract decorator
class CoffeeDecorator {
    inner;
    constructor(inner) {
        this.inner = inner;
    }
}
// Concrete decorators
class MilkDecorator extends CoffeeDecorator {
    getCost() {
        return this.inner.getCost() + 0.50;
    }
    getDescription() {
        return this.inner.getDescription() + ", milk";
    }
}
class SugarDecorator extends CoffeeDecorator {
    getCost() {
        return this.inner.getCost() + 0.20;
    }
    getDescription() {
        return this.inner.getDescription() + ", sugar";
    }
}
class WhippedCreamDecorator extends CoffeeDecorator {
    getCost() {
        return this.inner.getCost() + 1.00;
    }
    getDescription() {
        return this.inner.getDescription() + ", whipped cream";
    }
}
// Client
const order1 = new SimpleCoffee();
console.log(`Order 1: ${order1.getDescription()} | $${order1.getCost().toFixed(2)}`);
const order2 = new SugarDecorator(new MilkDecorator(new SimpleCoffee()));
console.log(`Order 2: ${order2.getDescription()} | $${order2.getCost().toFixed(2)}`);
const order3 = new WhippedCreamDecorator(new SugarDecorator(new MilkDecorator(new MilkDecorator(new SimpleCoffee()))));
console.log(`Order 3: ${order3.getDescription()} | $${order3.getCost().toFixed(2)}`);
