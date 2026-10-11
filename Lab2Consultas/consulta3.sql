USE strem;

SELECT
    s.name AS streamer,
    g.game_name AS juego_principal,
    s.avg_viewers_per_stream AS espectadores_promedio
FROM STREAMER AS s
INNER JOIN STREAMER_GAME AS sg
    ON s.streamer_id = sg.streamer_id
INNER JOIN GAME AS g
    ON sg.game_id = g.game_id
WHERE sg.game_role = 'primary'
ORDER BY s.avg_viewers_per_stream DESC
LIMIT 10;
