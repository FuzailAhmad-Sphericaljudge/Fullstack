console.log("=== CALLBACKS ===");

function fetchData(callback) {
    setTimeout(() => {
        const data = { id: 1, name: "John Doe" };
        callback(data);
    }, 1000);
}

fetchData((data) => {
    console.log("Fetched data:", data);
});

const hello = () => {

}
hello();
console.log("This is asynchronus programming");
//callback,promise,async/await
function add(n1, n2){
    console.log(n1+n2); 
}
let a=10;
let b=20;
add(a,b);
function sayHi(){
    console.log("Hi");
}
function hello(){
    console.log("Hello");
}
   