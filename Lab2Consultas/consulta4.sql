USE strem;

SELECT
    l.languague_name AS idioma,
    COUNT(s.streamer_id) AS total_streamers,
    ROUND(AVG(s.avg_viewers_per_stream), 2)
        AS promedio_espectadores
FROM STREAMER AS s
INNER JOIN LANGUAGUE AS l
    ON s.language_id = l.languague_id
GROUP BY l.languague_id, l.languague_name
HAVING COUNT(s.streamer_id) >= 10
ORDER BY promedio_espectadores DESC;
