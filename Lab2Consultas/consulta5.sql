USE strem;

WITH conteos AS (
    SELECT
        g.game_name,
        SUM(CASE
            WHEN sg.game_role = 'primary' THEN 1
            ELSE 0
        END) AS total_principal,
        SUM(CASE
            WHEN sg.game_role = 'secondary' THEN 1
            ELSE 0
        END) AS total_secundario
    FROM GAME AS g
    INNER JOIN STREAMER_GAME AS sg
        ON g.game_id = sg.game_id
    GROUP BY g.game_id, g.game_name
)

SELECT
    'Principal' AS categoria,
    game_name AS videojuego,
    total_principal AS total_streamers
FROM conteos
WHERE total_principal = (
    SELECT MAX(total_principal)
    FROM conteos
)

UNION ALL

SELECT
    'Secundario' AS categoria,
    game_name AS videojuego,
    total_secundario AS total_streamers
FROM conteos
WHERE total_secundario = (
    SELECT MAX(total_secundario)
    FROM conteos
);
