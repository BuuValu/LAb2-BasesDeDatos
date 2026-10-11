USE strem;

SELECT
    s.name,
    l.languague_name AS idioma,
    s.total_followers
FROM STREAMER AS s
INNER JOIN LANGUAGUE AS l
    ON s.language_id = l.languague_id
WHERE l.languague_name = 'Spanish'
ORDER BY s.total_followers DESC
LIMIT 10;
