const searchBox = document.getElementById('search');
const results = document.getElementById('results');

async function loadNotes(query = '') {
  const res = await fetch('/api/notes?search=' + encodeURIComponent(query));
  const notes = await res.json();

  results.innerHTML = '';
  if (notes.length === 0) {
    results.innerHTML = '<p class="empty">No notes found</p>';
    return;
  }

  notes.forEach((note) => {
    const div = document.createElement('div');
    div.className = 'note';

    const title = document.createElement('h3');
    title.textContent = note.title;

    const link = document.createElement('a');
    link.href = `/api/notes/${note.id}/download`;
    const btn = document.createElement('button');
    btn.textContent = 'Download';
    link.appendChild(btn);

    div.append(title, link);
    results.appendChild(div);
  });
}

searchBox.addEventListener('input', () => loadNotes(searchBox.value));
loadNotes();
