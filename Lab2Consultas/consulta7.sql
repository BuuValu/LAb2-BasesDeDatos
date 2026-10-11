
USE strem;

WITH coincidencias AS (
    SELECT
        g.game_name AS juego,
        s1.name AS streamer_principal,
        s1.total_followers AS seguidores_principal,
        s2.name AS streamer_secundario,
        s2.total_followers AS seguidores_secundario,
        s1.total_views AS vistas_principal,
        s2.total_views AS vistas_secundario,
        ROW_NUMBER() OVER (
            PARTITION BY g.game_id
            ORDER BY
                s1.total_followers DESC,
                s2.total_followers DESC
        ) AS posicion
    FROM STREAMER_GAME AS sg1
    INNER JOIN STREAMER_GAME AS sg2
        ON sg1.game_id = sg2.game_id
        AND sg1.streamer_id <> sg2.streamer_id
    INNER JOIN STREAMER AS s1
        ON sg1.streamer_id = s1.streamer_id
    INNER JOIN STREAMER AS s2
        ON sg2.streamer_id = s2.streamer_id
    INNER JOIN GAME AS g
        ON sg1.game_id = g.game_id
    WHERE sg1.game_role = 'primary'
      AND sg2.game_role = 'secondary'
)

SELECT
    juego,
    streamer_principal,
    seguidores_principal,
    streamer_secundario,
    seguidores_secundario,
    vistas_principal,
    vistas_secundario
FROM coincidencias
WHERE posicion = 1
ORDER BY seguidores_principal DESC
LIMIT 10;
