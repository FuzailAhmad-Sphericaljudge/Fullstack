

 const promiseOne = new Promise((resolve, reject) => {
     console.log("promise done")
 });
 promiseOne.then((result) => {
    console.log(result);
    }).catch((error) => {
        console.error(error);
    });
