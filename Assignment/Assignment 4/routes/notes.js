const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const DATA_DIR = path.join(__dirname, '..', 'data');

// Read every file in /data and turn it into a "note" object.
// Just drop a new file into /data and it shows up automatically.
function getNotes() {
  return fs.readdirSync(DATA_DIR)
    .filter((file) => !file.startsWith('.') && !file.startsWith('~$'))
    .map((file, index) => ({
      id: index + 1,
      title: path.parse(file).name.replace(/[_-]+/g, ' '),
      filename: file,
    }));
}

// GET /api/notes            -> all notes
// GET /api/notes?search=os  -> notes whose title matches "os"
router.get('/', (req, res) => {
  const search = (req.query.search || '').toLowerCase().trim();
  const notes = getNotes().filter((n) => n.title.toLowerCase().includes(search));
  res.json(notes);
});

// GET /api/notes/:id/download -> download the file
router.get('/:id/download', (req, res) => {
  const note = getNotes().find((n) => n.id === Number(req.params.id));
  if (!note) return res.status(404).json({ error: 'Note not found' });
  res.download(path.join(DATA_DIR, note.filename), note.filename);
});

module.exports = router;
