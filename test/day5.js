//understand the concept of fetch in console
async function test(){
    console.log("this is asynchronous function and we want use fetch api to get data from server");
    const response =await fetch("./student.json");
    console.log( response.status)
    const std =await response.json();
    return std;
    console.log("finally data fetch");
}
test().then((res)=>{
    console.log(res);

}).catch((err)=>{
    console.error(err);
})