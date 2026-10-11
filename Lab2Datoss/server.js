const express = require('express');
const testRoutes = require('./routes/test.routes');

const PORT = 5000;
const api = express();

api.use(express.json());
api.use(express.static('public'));

api.use('/streamers', testRoutes);

api.listen(PORT, () => {
  console.log(`Servidor activo en http://localhost:${PORT}`);
});
