const postButton = document.getElementById('postBtn');
const getAllButton = document.getElementById('getAllBtn');
const getOneButton = document.getElementById('getOneBtn');
const deleteButton = document.getElementById('deleteBtn');

postButton.addEventListener('click', async () => {
  const data = {
    name: document.getElementById('name').value.trim(),
    avg_viewers_per_stream: Number(document.getElementById('avg_viewers_per_stream').value),
    total_followers: Number(document.getElementById('total_followers').value),
    total_views: Number(document.getElementById('total_views').value),
    total_games_streamed: Number(document.getElementById('total_games_streamed').value),
    active_days_per_week: Number(document.getElementById('active_days_per_week').value),
    language_id: Number(document.getElementById('language_id').value)
  };

  try {
    const response = await fetch('/streamers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await response.json();
    document.getElementById('postSqlResult').textContent =
      response.ok ? `Streamer guardado. ID: ${result.streamer_id}` : `Error: ${result.error}`;
  } catch (error) {
    document.getElementById('postSqlResult').textContent = 'No se pudo conectar con el servidor.';
    console.error(error);
  }
});

getAllButton.addEventListener('click', async () => {
  const list = document.getElementById('getAllResult');
  list.innerHTML = '';
  try {
    const response = await fetch('/streamers');
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Error al consultar');
    if (data.length === 0) {
      list.textContent = 'No hay streamers registrados.';
      return;
    }
    data.forEach(streamer => {
      const li = document.createElement('li');
      li.textContent = JSON.stringify(streamer);
      list.appendChild(li);
    });
  } catch (error) {
    list.textContent = `Error: ${error.message}`;
  }
});

getOneButton.addEventListener('click', async () => {
  const id = document.getElementById('id').value;
  const result = document.getElementById('getOneResult');
  if (!id) { result.textContent = 'Escribe un ID.'; return; }
  try {
    const response = await fetch(`/streamers/${id}`);
    const data = await response.json();
    result.textContent = response.ok ? JSON.stringify(data, null, 2) : `Error: ${data.error}`;
  } catch (error) {
    result.textContent = 'No se pudo conectar con el servidor.';
  }
});

deleteButton.addEventListener('click', async () => {
  const id = document.getElementById('deleteId').value;
  const result = document.getElementById('deleteResult');
  if (!id) { result.textContent = 'Escribe un ID.'; return; }
  try {
    const response = await fetch(`/streamers/${id}`, { method: 'DELETE' });
    const data = await response.json();
    result.textContent = response.ok ? data.message : `Error: ${data.error}`;
  } catch (error) {
    result.textContent = 'No se pudo conectar con el servidor.';
  }
});
