# Cómo correr la carga (paso a paso)

## 0. Qué debe quedar en tu carpeta `lab2datos`

```
lab2datos/
├── env/mysqlConfig.js      (ya la tienes: usuario, contraseña y base `strem`)
├── services/ routes/ dao/ public/ server.js   (ya los tienes, no se tocan)
├── package.json            <- REEMPLAZAR por el nuevo
├── load.js                 <- nuevo
├── transform.js            <- nuevo
├── csv_reader.js           <- nuevo
├── verify.js               <- nuevo
├── bad_rows.csv            <- nuevo (solo para la prueba de errores)
├── ddl.sql                 <- tu script de las tablas guardado como archivo
└── Streamers.csv           <- tu CSV, con este nombre exacto
```

Si borraste el `.xlsx`, mejor: el programa ya no lo necesita.

## 1. Instalar dependencias (una sola vez)

Abre la terminal de VS Code **dentro de `lab2datos`** y ejecuta:

```
npm install
```

## 2. Crear la base de datos

Ejecuta el contenido de `ddl.sql` en MySQL (con tu conexión de VS Code o Workbench).
Debe quedar el esquema `strem` con 4 tablas: `LANGUAGUE`, `GAME`, `STREAMER`, `STREAMER_GAME`.

Revisa que `env/mysqlConfig.js` tenga tu usuario y contraseña correctos.

## 3. Cargar los datos

```
node load.js
```

Resultado esperado (resumen final):

```
rowsRead: 999, streamers: 999, relations: 1921, withoutSecondaryGame: 77,
languages: 19, games: 211, errors: 0, aborted: false
```

Se genera `load_summary_Streamers.json`. Es normal ver 2 avisos de `GAME` (p. ej. "Valorant" y "VALORANT"):
MySQL los considera el mismo juego por su collation y el programa reutiliza el mismo registro.

## 4. Verificar que funcionó

```
node verify.js
```

Debe terminar con `VERIFICATION SUCCESSFUL`, mostrar el conteo por tabla
(STREAMER 999, LANGUAGUE 19, GAME 211, STREAMER_GAME 1921) y todos los chequeos de integridad en 0.

## 5. Demostrar el manejo de errores (evidencia para la rúbrica)

```
node load.js bad_rows.csv
```

Debe rechazar 4 filas sin insertar nada y sin romper la base:

| Línea | Problema | Tipo de error |
|---|---|---|
| 2 | texto ("many") en TOTAL_FOLLOWERS | INVALID_DATA |
| 3 | días activos = 9.5 (fuera de 0-7) | INVALID_DATA |
| 4 | NAME vacío | INVALID_DATA |
| 5 | nombre `kaicenat` repetido | ER_DUP_ENTRY (lo rechaza MySQL por UNIQUE) |

Genera `load_errors_bad_rows.json`. Después corre `node verify.js` otra vez: los conteos no cambian (999 / 19 / 211 / 1921).

## 6. Evidencia para el informe

- Captura de la salida de `node load.js`, `node verify.js` y `node load.js bad_rows.csv`.
- Los archivos `load_summary_Streamers.json` y `load_errors_bad_rows.json`.

## Si necesitas repetir la carga desde cero

Volver a correr `node load.js` sobre una base ya cargada rechaza las 999 filas por duplicadas (también sirve de prueba).
Para empezar limpio ejecuta `DROP DATABASE strem;` y vuelve a correr `ddl.sql`.

## Valores de `game_role`

El programa guarda `primary` y `secondary`. Úsalos en las consultas del laboratorio
(p. ej. `WHERE game_role = 'primary'`).
