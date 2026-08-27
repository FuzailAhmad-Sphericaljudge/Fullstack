//Event Module
//Event class uses -on as listener and -emit to trigger the event
const EventEmitter= required('events');
const event=new EventEmitter();
event.on("greet",()=>{
    console.log("Hello World");
})
event.emit("greet");
event.emit("greet");
event.emit("greet");