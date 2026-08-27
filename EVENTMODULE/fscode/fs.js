const fs = require('fs');
fs.wwriteFile("student.txt", "Name: Fuzail\n Roll No: 101");
console.log("File created successfully");

let data = fs.readFile("student.txt", "utf8");

console.log("\nFile content: ");
console.log(data);

fs.appendFile("student.txt", "\nCourse: B.Tech CSE");
console.log("\nData appended successfully");