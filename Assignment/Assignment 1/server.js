const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 3000;
const FILE = path.join(__dirname, "students.json");


if (!fs.existsSync(FILE)) {
    fs.writeFileSync(FILE, "[]");
}

const server = http.createServer((req, res) => {

    if (req.method === "GET" && req.url === "/") {
        res.writeHead(200, { "Content-Type": "text/html" });

        res.end(`
<!DOCTYPE html>
<html>
<head>
    <title>Student Record Management</title>
</head>
<body>
    <h1>Welcome to Student Record Management System</h1>

    <h2>Student Record Form</h2>

    <form method="POST" action="/add">
        <label>Student Name:</label>
        <input type="text" name="name" required>
        <br><br>

        <label>Roll Number:</label>
        <input type="text" name="roll" required>
        <br><br>

        <label>Course:</label>
        <input type="text" name="course" required>
        <br><br>

        <label>Email:</label>
        <input type="email" name="email" required>
        <br><br>

        <button type="submit">Add Student</button>
    </form>

    <br>
    <a href="/students">View Student Records</a>
</body>
</html>
        `);
    }

    
    else if (req.method === "POST" && req.url === "/add") {
        let body = "";

        req.on("data", (chunk) => {
            body += chunk.toString();
        });

        req.on("end", () => {
            const formData = new URLSearchParams(body);

            const student = {
                name: formData.get("name"),
                roll: formData.get("roll"),
                course: formData.get("course"),
                email: formData.get("email")
            };

            fs.readFile(FILE, "utf8", (readError, data) => {
                if (readError) {
                    res.writeHead(500, { "Content-Type": "text/plain" });
                    res.end("Error reading students.json");
                    return;
                }

                let students;

                try {
                    students = data.trim() ? JSON.parse(data) : [];
                } catch (parseError) {
                    res.writeHead(500, { "Content-Type": "text/plain" });
                    res.end("students.json contains invalid JSON");
                    return;
                }

                students.push(student);

                fs.writeFile(
                    FILE,
                    JSON.stringify(students, null, 2),
                    "utf8",
                    (writeError) => {
                        if (writeError) {
                            res.writeHead(500, { "Content-Type": "text/plain" });
                            res.end("Error saving student record");
                            return;
                        }

                        res.writeHead(302, { Location: "/students" });
                        res.end();
                    }
                );
            });
        });
    }

    
    else if (req.method === "GET" && req.url === "/students") {
        fs.readFile(FILE, "utf8", (error, data) => {
            if (error) {
                res.writeHead(500, { "Content-Type": "text/plain" });
                res.end("Error reading student records");
                return;
            }

            let students;

            try {
                students = data.trim() ? JSON.parse(data) : [];
            } catch (parseError) {
                res.writeHead(500, { "Content-Type": "text/plain" });
                res.end("students.json contains invalid JSON");
                return;
            }

            let rows = "";

            if (students.length === 0) {
                rows = `
                    <tr>
                        <td colspan="4">No student records found.</td>
                    </tr>
                `;
            } else {
                students.forEach((student) => {
                    rows += `
                        <tr>
                            <td>${escapeHtml(student.name)}</td>
                            <td>${escapeHtml(student.roll)}</td>
                            <td>${escapeHtml(student.course)}</td>
                            <td>${escapeHtml(student.email)}</td>
                        </tr>
                    `;
                });
            }

            res.writeHead(200, { "Content-Type": "text/html" });

            res.end(`
<!DOCTYPE html>
<html>
<head>
    <title>Student Records</title>
</head>
<body>
    <h1>Student Records</h1>

    <table border="1" cellpadding="10">
        <tr>
            <th>Student Name</th>
            <th>Roll Number</th>
            <th>Course</th>
            <th>Email</th>
        </tr>
        ${rows}
    </table>

    <br>
    <a href="/">Add Another Student</a>
</body>
</html>
            `);
        });
    }

    // 4. Invalid route
    else {
        res.writeHead(404, { "Content-Type": "text/html" });

        res.end(`
            <h1>404 - Page Not Found</h1>
            <a href="/">Go to Home</a>
        `);
    }
});


function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
