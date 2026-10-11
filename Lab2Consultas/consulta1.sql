USE strem;

SELECT
    name,
    total_followers,
    active_days_per_week
FROM STREAMER
WHERE total_followers >= 1000000
  AND active_days_per_week >= 4
ORDER BY total_followers DESC
LIMIT 10;

