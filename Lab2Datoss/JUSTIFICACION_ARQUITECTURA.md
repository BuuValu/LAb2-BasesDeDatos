# Justificación de la arquitectura del programa de carga

**Decisión:** script independiente (`load.js` + `transform.js` + `csv_reader.js`), sin servidor Express, rutas ni DAO.

```
Streamers.csv -> csv_reader.js -> transform.js (limpieza/validación) -> load.js -> MySQL (esquema strem)
```

## Por qué es apropiado para este laboratorio

1. **Es un proceso batch de una sola ejecución.** La carga se corre una vez sobre una base vacía; no atiende peticiones de usuarios. La arquitectura por capas (rutas, controladores, servicios) sirve para exponer operaciones repetidas vía HTTP; aquí solo añadiría archivos sin aportar nada.
2. **Un flujo secuencial con transacción.** Las claves foráneas obligan un orden (LANGUAGUE y GAME, luego STREAMER, luego STREAMER_GAME) y el manejo de errores fila por fila (SAVEPOINT) se controla mejor en un único flujo que repartido entre endpoints.
3. **Modularidad suficiente.** La limpieza vive aparte (`transform.js`, funciones puras que se prueban sin base de datos), la lectura del CSV en `csv_reader.js`, el acceso a MySQL en `load.js` y la verificación en `verify.js`.
4. **Reproducibilidad.** `node load.js` y `node verify.js` bastan para repetir y demostrar la carga, y dejan `load_summary_*.json` y `load_errors_*.json` como evidencia.

**Qué se reutiliza del proyecto por capas:** `env/mysqlConfig.js`. `load.js` exporta la función `loadStreamers(filePath)`, así que si más adelante se quisiera una interfaz web, una ruta podría llamarla sin reescribir la lógica.

**Cuándo sería mejor por capas:** si la carga tuviera que dispararse desde una interfaz web o repetirse por varios usuarios.

## Selección de columnas

Se cargan 9 de las 17 columnas: NAME, LANGUAGE, MOST_STREAMED_GAME, 2ND_MOST_STREAMED_GAME, AVG_VIEWERS_PER_STREAM, TOTAL_FOLLOWERS, TOTAL_VIEWS, TOTAL_GAMES_STREAMED y ACTIVE_DAYS_PER_WEEK. El resto se descarta según el modelo definido por Persona 1 (la justificación de cada exclusión va en su sección del informe).

## Manejo de errores (la carga no falla en silencio)

| Error previsible | Dónde se detecta | Qué hace el programa |
|---|---|---|
| Tipo incompatible, vacío o fuera de rango (texto en un número, días > 7) | `transform.js` | Omite la fila y la registra (`INVALID_DATA`) |
| Texto más largo que la columna | `transform.js` | Igual que arriba |
| Fila con número de columnas distinto al encabezado | `csv_reader.js` | Igual que arriba |
| Violación de UNIQUE (streamer repetido) | MySQL (`ER_DUP_ENTRY`) | `ROLLBACK TO SAVEPOINT` de esa fila, la registra y continúa |
| Violación de FK u otro error de BD | MySQL | Igual que arriba |
| Juego o idioma que la collation considera igual a otro | MySQL (`ER_DUP_ENTRY`) | Reutiliza el id existente y deja un aviso en el resumen |
| Columna faltante en el archivo | `load.js` | Detiene la carga con un mensaje claro |
| Error inesperado o de conexión | `load.js` | `ROLLBACK`, mensaje en consola y código de salida 1 |

Al terminar siempre se imprime un resumen; si hubo filas rechazadas, el código de salida es 1 y se escribe `load_errors_*.json`.
