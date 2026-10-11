USE strem;

SELECT
    l.languague_name AS idioma,
    COUNT(s.streamer_id) AS total_streamers,
    ROUND(AVG(s.total_followers), 2)
        AS promedio_seguidores
FROM STREAMER AS s
INNER JOIN LANGUAGUE AS l
    ON s.language_id = l.languague_id
GROUP BY l.languague_id, l.languague_name
ORDER BY promedio_seguidores DESC;
