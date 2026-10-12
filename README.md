# Instrucciones de ejecución — Laboratorio 2

Este documento explica cómo crear la base de datos, cargar el archivo `Streamers.csv`, verificar los registros y comprobar el manejo de errores.

## 1. Archivos del proyecto

El código se encuentra en la carpeta `Lab2Datoss` del repositorio.

Los archivos principales son:

- `ddl.sql`: creación del esquema y sus tablas.
- `Streamers.csv`: conjunto de datos original.
- `Streamers.mwb`: modelo entidad-relación de MySQL Workbench.
- `csv_reader.js`: lectura del archivo CSV.
- `transform.js`: validación y transformación de datos.
- `load.js`: carga de los datos en MySQL.
- `verify.js`: comprobación de los registros y su integridad.
- `package.json` y `package-lock.json`: dependencias del proyecto.
- `env/mysqlConfig.example.js`: ejemplo de configuración de la conexión.

Las ocho consultas del laboratorio están disponibles por separado en la carpeta `Lab2Consultas` del repositorio.

## 2. Requisitos

Para ejecutar el proyecto se necesita:

- MySQL Server 8.0.
- MySQL Workbench.
- Node.js y npm.
- Visual Studio Code u otro editor de código.

## 3. Configurar la conexión a MySQL

Dentro de la carpeta `env`, utilizar `mysqlConfig.example.js` como referencia para crear el archivo local `mysqlConfig.js`.

Configurar el usuario, la contraseña y la base de datos `strem` según la instalación de MySQL.

El archivo `mysqlConfig.js` contiene credenciales locales y no debe publicarse en GitHub.

## 4. Instalar las dependencias

Abrir una terminal dentro de la carpeta `Lab2Datoss` y ejecutar:

`npm install`

## 5. Crear la base de datos

Abrir `ddl.sql` en MySQL Workbench y ejecutar el script completo.

Se debe crear el esquema `strem` con cuatro tablas:

- `LANGUAGUE`
- `GAME`
- `STREAMER`
- `STREAMER_GAME`

## 6. Cargar los datos

Con la base de datos recién creada y vacía, ejecutar:

`node load.js`

En la carga inicial realizada para el laboratorio se obtuvieron:

| Concepto | Resultado |
|---|---:|
| Streamers | 999 |
| Idiomas | 19 |
| Juegos | 211 |
| Relaciones entre streamers y juegos | 1921 |
| Streamers sin juego secundario | 77 |
| Errores | 0 |

El programa genera `load_summary_Streamers.json`.

Durante la carga se identificaron dos diferencias de escritura por mayúsculas y minúsculas: `Valorant`/`VALORANT` y `TrackMania`/`Trackmania`. Debido a la configuración de comparación de texto de MySQL, estos nombres se reconocieron como equivalentes y se reutilizaron sus identificadores.

## 7. Verificar los registros

Después de una carga inicial exitosa, ejecutar:

`node verify.js`

El programa debe comprobar que:

- Las cuatro tablas contienen las cantidades esperadas de registros.
- Todos los streamers tienen un idioma asociado.
- Todos los streamers tienen un juego principal.
- No existen videojuegos sin asociaciones.
- Los días activos se encuentran dentro del rango permitido.

En la verificación realizada, todos los chequeos de integridad devolvieron cero incidencias y el programa finalizó con el mensaje:

`VERIFICATION SUCCESSFUL`

## 8. Prueba de manejo de errores

Para comprobar el manejo de registros duplicados, se realizó una segunda ejecución:

`node load.js`

Esta prueba se llevó a cabo sobre la base de datos que ya contenía los 999 streamers.

El programa rechazó las 999 filas debido a la restricción `UNIQUE` del nombre de cada streamer, sin duplicar los registros existentes.

Los errores se registraron en `load_errors_Streamers.json`, incluyendo el código `ER_DUP_ENTRY` de MySQL.

Es importante señalar que esta versión del programa sobrescribe el archivo de resumen durante una ejecución repetida. Por esa razón, `verify.js` puede mostrar diferencias entre el resumen y la base de datos después de dicha prueba, aunque los registros y las relaciones permanezcan íntegros.

Esta limitación está documentada en el informe del laboratorio.

## 9. Ejecutar nuevamente desde cero

Para repetir la carga inicial es necesario comenzar con una base de datos vacía.

En un entorno de pruebas, puede eliminarse el esquema `strem`, ejecutarse nuevamente `ddl.sql` y después realizar la carga con:

`node load.js`

Posteriormente, ejecutar:

`node verify.js`

**Advertencia:** eliminar el esquema borra todos los datos almacenados en él. Este procedimiento solo debe realizarse cuando se tenga la seguridad de que la base puede reconstruirse.

## 10. Consultas SQL

Las ocho consultas se encuentran en la carpeta `Lab2Consultas` del repositorio.

Se incluyen cuatro consultas básicas:

1. Filtrado mediante `WHERE` con dos condiciones.
2. Relación entre dos tablas con `JOIN`.
3. Relación entre tres tablas con `JOIN`.
4. Agrupación mediante `GROUP BY`.

También se incluyen cuatro consultas analíticas:

1. Juegos más frecuentes como opción principal y secundaria.
2. Idiomas con mayor promedio de seguidores y cantidad de streamers.
3. Coincidencias entre juegos principales y secundarios de distintos streamers.
4. Relación entre los días activos por semana y la audiencia promedio.

Las consultas pueden abrirse y ejecutarse desde MySQL Workbench utilizando la base de datos `strem`.

## 11. Evidencias y resultados

Las capturas de la carga, los errores controlados, la verificación y las consultas se encuentran incluidas en el informe IEEE.

Adicionalmente, el proyecto conserva los archivos JSON generados por el programa de carga y la prueba de duplicados.

El informe presenta las sentencias SQL, sus resultados y las interpretaciones correspondientes.
