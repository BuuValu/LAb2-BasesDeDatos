# LAb2-BasesDeDatos
# Laboratorio 2 — Modelado y análisis de datos con SQL

**Asignatura:** Bases de Datos Multimedia  
**Universidad:** Universidad de San Buenaventura, Bogotá  
**Integrantes:** Valentina López, Isabella Montenegro y Lina Guarín

## Descripción

Este proyecto transforma el dataset `Streamers.csv` en una base de datos relacional en MySQL, normalizada hasta tercera forma normal (3FN). Incluye un programa de carga y verificación en Node.js y ocho consultas SQL para explorar relaciones entre streamers, videojuegos, idiomas, seguidores y audiencia.

## Tecnologías

- MySQL 8.0 y MySQL Workbench
- Node.js y npm
- Biblioteca `mysql2`
- LaTeX con plantilla IEEEtran para el informe

## Modelo de datos

El esquema `strem` tiene cuatro tablas:

| Tabla | Función |
| --- | --- |
| `STREAMER` | Información y métricas de cada streamer |
| `LANGUAGUE` | Catálogo de idiomas (nombre conservado tal como está en el DDL) |
| `GAME` | Catálogo de videojuegos o categorías de contenido |
| `STREAMER_GAME` | Asociación entre streamer y contenido, con rol `primary` o `secondary` |

## Instalación y ejecución

1. Instalar MySQL 8.0, Node.js y las dependencias del proyecto:

   ```bash
   npm install
   ```

2. Crear el esquema y las tablas ejecutando `ddl.sql` en MySQL Workbench.
3. Configurar **localmente** `env/mysqlConfig.js` con el usuario, la contraseña y la base `strem`. **No subir contraseñas al repositorio.** Si se incluye `env/mysqlConfig.example.js`, usarlo como referencia.
4. Cargar los datos:

   ```bash
   node load.js
   ```

5. Verificar la carga:

   ```bash
   node verify.js
   ```

**Resultado esperado de una carga limpia:** 999 streamers, 19 idiomas, 211 juegos/categorías y 1.921 relaciones (`999` principales y `922` secundarias). El programa identifica 77 streamers sin juego secundario.

> **Atención:** `node load.js` está pensado para ejecutarse sobre una base vacía. Si se repite sobre una base ya cargada, rechaza registros duplicados y puede sobrescribir el resumen usado por `verify.js`. No ejecutar `DROP DATABASE strem;` salvo que se quiera eliminar expresamente toda esa base y reconstruirla desde cero.

Para el procedimiento completo, incluido el manejo de errores y las pruebas de carga, consultar [INSTRUCCIONES.md](INSTRUCCIONES.md).

## Consultas SQL

Las ocho consultas se guardan en la carpeta `consultas_sql/`:

| Archivo | Propósito |
| --- | --- |
| `01_where.sql` | Filtro mediante dos condiciones (`WHERE` y `AND`) |
| `02_join_dos_tablas.sql` | Relación entre streamers e idiomas |
| `03_join_tres_tablas.sql` | Relación entre streamers, juegos y su prioridad |
| `04_group_by.sql` | Audiencia promedio agrupada por idioma |
| `05_juegos_principales_secundarios.sql` | Juego/categoría más frecuente como principal y secundario |
| `06_idiomas_seguidores.sql` | Promedio de seguidores y cantidad de streamers por idioma |
| `07_relaciones_streamers.sql` | Coincidencias entre juegos principales y secundarios de distintos streamers |
| `08_dias_activos.sql` | Audiencia promedio por rangos de días activos por semana |

Las consultas se pueden abrir y ejecutar en MySQL Workbench sobre el esquema `strem`, una vez cargados los datos.

## Resultados destacados

- **Just Chatting** es el contenido más frecuente tanto como principal (257 streamers) como secundario (155).
- **Español** tiene el mayor promedio de seguidores por streamer (1.776.153,77); **inglés** reúne la mayor cantidad de streamers (401).
- El grupo con **6 a 7 días activos** presenta el mayor promedio de espectadores por transmisión (25.282,68). Esto no demuestra una relación causal entre actividad y audiencia.

## Informe y evidencias

El informe académico se elaboró en LaTeX con formato IEEE e incluye selección de atributos, normalización, modelo entidad-relación, implementación, carga, consultas e interpretación de resultados. Las capturas y documentos de entrega deben incorporarse a las carpetas correspondientes del repositorio.

## Seguridad

Los archivos con contraseñas reales, como `env/mysqlConfig.js`, y la carpeta `node_modules/` deben permanecer excluidos mediante `.gitignore`.
