// const EventEmitter = require('events');

// class MyEmitter extends EventEmitter {}

// const emitter = new MyEmitter();

// emitter.on('greet', (name) => {
//     console.log(`Hello, ${name}! Welcome.`);
// });

// emitter.on('exit', () => {
//     console.log("Goodbye! Exiting the application.");
// });

// emitter.emit('greet', 'Fuzail');
// emitter.emit('exit'); 
const EventEmitter = require('events');
class Button extends EventEmitter 
{
    click() {
        console.log("/ncall button click event");
        this.emit('click');
    }

mouseover(){
    console.log("/ncall button mouseover event");
    this.emit('mouseover');
}
}
const button = new Button();
button.on('click', () => {
    console.log('Button was clicked!');
});
button.on('mouseover', () => {
    console.log('Button was hovered!');
});
setimmediate(() => {
    button.click();
    button.mouseover();
}
);
process.nextTick(() => {
    button.click();
    button.mouseover();
}
);
