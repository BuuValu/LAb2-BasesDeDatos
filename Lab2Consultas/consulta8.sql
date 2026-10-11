
USE strem;

WITH actividad AS (
    SELECT
        streamer_id,
        avg_viewers_per_stream,
        CASE
            WHEN active_days_per_week < 2
                THEN '0 a menos de 2 dias'
            WHEN active_days_per_week < 4
                THEN '2 a menos de 4 dias'
            WHEN active_days_per_week < 6
                THEN '4 a menos de 6 dias'
            ELSE '6 a 7 dias'
        END AS rango_actividad,
        CASE
            WHEN active_days_per_week < 2 THEN 1
            WHEN active_days_per_week < 4 THEN 2
            WHEN active_days_per_week < 6 THEN 3
            ELSE 4
        END AS orden_rango
    FROM STREAMER
    WHERE active_days_per_week BETWEEN 0 AND 7
      AND avg_viewers_per_stream IS NOT NULL
)

SELECT
    rango_actividad,
    COUNT(streamer_id) AS total_streamers,
    ROUND(AVG(avg_viewers_per_stream), 2)
        AS promedio_espectadores
FROM actividad
GROUP BY orden_rango, rango_actividad
ORDER BY orden_rango;
