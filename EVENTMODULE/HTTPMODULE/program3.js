import http from 'http';
import fs from 'fs';

const PORT = 3000;
const STUDENTS_FILE = `${import.meta.dirname}/students.json`;
const MAX_BODY_SIZE = 10 * 1024;

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function sendHtml(response, statusCode, content) {
  response.writeHead(statusCode, { 'Content-Type': 'text/html; charset=utf-8' });
  response.end(content);
}

function page(title, content) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title}</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 680px; margin: 40px auto; padding: 0 16px; }
    label { display: block; margin-top: 14px; font-weight: bold; }
    input { box-sizing: border-box; display: block; margin-top: 5px; padding: 8px; width: 100%; }
    button { background: #1769aa; border: 0; border-radius: 4px; color: white; cursor: pointer; margin-top: 20px; padding: 10px 16px; }
    table { border-collapse: collapse; margin-top: 18px; width: 100%; }
    th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
    .message { color: #147a3d; }
  </style>
</head>
<body>${content}</body>
</html>`;
}

function getStudents(callback) {
  fs.readFile(STUDENTS_FILE, 'utf8', (error, data) => {
    if (error && error.code === 'ENOENT') return callback(null, []);
    if (error) return callback(error);

    try {
      const students = JSON.parse(data || '[]');
      callback(null, Array.isArray(students) ? students : []);
    } catch (parseError) {
      callback(new Error('The students data file contains invalid JSON.'));
    }
  });
}

function showHome(response, message = '') {
  sendHtml(response, 200, page('Student Records', `
    <h1>Welcome to Student Records</h1>
    ${message ? `<p class="message">${escapeHtml(message)}</p>` : ''}
    <form action="/students" method="POST">
      <label for="name">Student Name</label>
      <input id="name" name="name" required>
      <label for="rollNumber">Roll Number</label>
      <input id="rollNumber" name="rollNumber" required>
      <label for="course">Course</label>
      <input id="course" name="course" required>
      <label for="email">Email</label>
      <input id="email" type="email" name="email" required>
      <button type="submit">Add Student</button>
    </form>
    <p><a href="/students">View student records</a></p>`));
}

const server = http.createServer((request, response) => {
  const url = new URL(request.url, `http://${request.headers.host || 'localhost'}`);

  if (request.method === 'GET' && url.pathname === '/') {
    return showHome(response, url.searchParams.get('message') || '');
  }

  if (request.method === 'GET' && url.pathname === '/students') {
    return getStudents((error, students) => {
      if (error) return sendHtml(response, 500, page('Error', `<h1>Error</h1><p>${escapeHtml(error.message)}</p>`));

      const rows = students.length
        ? students.map((student) => `<tr><td>${escapeHtml(student.name)}</td><td>${escapeHtml(student.rollNumber)}</td><td>${escapeHtml(student.course)}</td><td>${escapeHtml(student.email)}</td></tr>`).join('')
        : '<tr><td colspan="4">No student records have been added yet.</td></tr>';
      return sendHtml(response, 200, page('Student Records', `
        <h1>Student Records</h1>
        <table><thead><tr><th>Name</th><th>Roll Number</th><th>Course</th><th>Email</th></tr></thead><tbody>${rows}</tbody></table>
        <p><a href="/">Add another student</a></p>`));
    });
  }

  if (request.method === 'POST' && url.pathname === '/students') {
    let body = '';
    let tooLarge = false;

    request.on('data', (chunk) => {
      body += chunk;
      if (body.length > MAX_BODY_SIZE) {
        tooLarge = true;
        request.destroy();
      }
    });

    request.on('end', () => {
      if (tooLarge) return sendHtml(response, 413, page('Request too large', '<h1>Request too large</h1>'));

      const form = new URLSearchParams(body);
      const student = {
        name: (form.get('name') || '').trim(),
        rollNumber: (form.get('rollNumber') || '').trim(),
        course: (form.get('course') || '').trim(),
        email: (form.get('email') || '').trim()
      };

      if (!student.name || !student.rollNumber || !student.course || !student.email) {
        return sendHtml(response, 400, page('Missing fields', '<h1>All fields are required.</h1><p><a href="/">Return to the form</a></p>'));
      }

      getStudents((readError, students) => {
        if (readError) return sendHtml(response, 500, page('Error', `<h1>Error</h1><p>${escapeHtml(readError.message)}</p>`));

        students.push(student);
        fs.writeFile(STUDENTS_FILE, JSON.stringify(students, null, 2), 'utf8', (writeError) => {
          if (writeError) return sendHtml(response, 500, page('Error', '<h1>Could not save the student record.</h1>'));
          response.writeHead(303, { Location: '/?message=Student%20record%20saved%20successfully.' });
          response.end();
        });
      });
    });
    return;
  }

  sendHtml(response, 404, page('Not Found', '<h1>404 - Page not found</h1><p><a href="/">Go home</a></p>'));
});

server.listen(PORT, () => {
  console.log(`Student Records server is running at http://localhost:${PORT}`);
});
