// 1. The Observer Interface
interface Subscriber {
    update(data: any): void;
}

class YoutubeChannel {
    private subscribers:Subscriber[]=[];
    addSubscribers(subscriber:Subscriber){
        this.subscribers.push(subscriber);
    }
    removeSubscribers(subscriber:Subscriber){
        this.subscribers = this.subscribers.filter(sub => sub !== subscriber);
    }
    notifySuubscribers(data:any){
        this.subscribers.forEach(subscriber => subscriber.update(data));
    }
}

class User implements Subscriber {
    private name:string;
    constructor(name:string){
        this.name = name;
    }
    update(data:any){
        console.log(`Hello ${this.name}, new video uploaded: ${data.title}`);
    }
}


// 2. Usage
const channel = new YoutubeChannel();
const user1 = new User("Alice");
const user2 = new User("Bob");
channel.addSubscribers(user1);
channel.addSubscribers(user2);
channel.notifySuubscribers({title: "Design Patterns in TypeScript"});