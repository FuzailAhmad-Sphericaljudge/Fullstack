const express = require('express');
const path = require('path');
const notesRouter = require('./routes/notes');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve the frontend (public/index.html, style.css, script.js)
app.use(express.static(path.join(__dirname, 'public')));

// REST API
app.use('/api/notes', notesRouter);

app.listen(PORT, () => {
  console.log(`Notes Portal running at http://localhost:${PORT}`);
});
