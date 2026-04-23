var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
// Concrete component
var SimpleCoffee = /** @class */ (function () {
    function SimpleCoffee() {
    }
    SimpleCoffee.prototype.getCost = function () {
        return 1.00;
    };
    SimpleCoffee.prototype.getDescription = function () {
        return "Simple coffee";
    };
    return SimpleCoffee;
}());
// Abstract decorator
var CoffeeDecorator = /** @class */ (function () {
    function CoffeeDecorator(inner) {
        this.inner = inner;
    }
    return CoffeeDecorator;
}());
// Concrete decorators
var MilkDecorator = /** @class */ (function (_super) {
    __extends(MilkDecorator, _super);
    function MilkDecorator() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    MilkDecorator.prototype.getCost = function () {
        return this.inner.getCost() + 0.50;
    };
    MilkDecorator.prototype.getDescription = function () {
        return this.inner.getDescription() + ", milk";
    };
    return MilkDecorator;
}(CoffeeDecorator));
var SugarDecorator = /** @class */ (function (_super) {
    __extends(SugarDecorator, _super);
    function SugarDecorator() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SugarDecorator.prototype.getCost = function () {
        return this.inner.getCost() + 0.20;
    };
    SugarDecorator.prototype.getDescription = function () {
        return this.inner.getDescription() + ", sugar";
    };
    return SugarDecorator;
}(CoffeeDecorator));
var WhippedCreamDecorator = /** @class */ (function (_super) {
    __extends(WhippedCreamDecorator, _super);
    function WhippedCreamDecorator() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    WhippedCreamDecorator.prototype.getCost = function () {
        return this.inner.getCost() + 1.00;
    };
    WhippedCreamDecorator.prototype.getDescription = function () {
        return this.inner.getDescription() + ", whipped cream";
    };
    return WhippedCreamDecorator;
}(CoffeeDecorator));
// Client
var order1 = new SimpleCoffee();
console.log("Order 1: ".concat(order1.getDescription(), " | $").concat(order1.getCost().toFixed(2)));
var order2 = new SugarDecorator(new MilkDecorator(new SimpleCoffee()));
console.log("Order 2: ".concat(order2.getDescription(), " | $").concat(order2.getCost().toFixed(2)));
var order3 = new WhippedCreamDecorator(new SugarDecorator(new MilkDecorator(new MilkDecorator(new SimpleCoffee()))));
console.log("Order 3: ".concat(order3.getDescription(), " | $").concat(order3.getCost().toFixed(2)));
