var YoutubeChannel = /** @class */ (function () {
    function YoutubeChannel() {
        this.subscribers = [];
    }
    YoutubeChannel.prototype.addSubscribers = function (subscriber) {
        this.subscribers.push(subscriber);
    };
    YoutubeChannel.prototype.removeSubscribers = function (subscriber) {
        this.subscribers = this.subscribers.filter(function (sub) { return sub !== subscriber; });
    };
    YoutubeChannel.prototype.notifySuubscribers = function (data) {
        this.subscribers.forEach(function (subscriber) { return subscriber.update(data); });
    };
    return YoutubeChannel;
}());
var User = /** @class */ (function () {
    function User(name) {
        this.name = name;
    }
    User.prototype.update = function (data) {
        console.log("Hello ".concat(this.name, ", new video uploaded: ").concat(data.title));
    };
    return User;
}());
// 2. Usage
var channel = new YoutubeChannel();
var user1 = new User("Alice");
var user2 = new User("Bob");
channel.addSubscribers(user1);
channel.addSubscribers(user2);
channel.notifySuubscribers({ title: "Design Patterns in TypeScript" });
