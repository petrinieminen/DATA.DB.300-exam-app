Fuzzy search:

  SELECT title
       , startyear
       , averagerating
       , similarity(title, 'Harry Poter') AS similarity
    FROM title_basics
   WHERE titletype = 'movie'
     AND title % 'Harry Poter'
ORDER BY sim DESC           --best fuzzy match first
       , numvotes DESC      --then more popular titles
   LIMIT 10;
Custom relevance score:

--I'll combine:
--- sim = similarity(title, :q)          (0–1)
--- rating component = averagerating/10  (about 0–1, assuming 0–10 scale)
--- popularity = ln(numvotes + 1)/10     (roughly scaled)
-- Final relevance_score = 0.7*sim + 0.2*rating + 0.1*popularity

WITH candidates AS (
    SELECT id
         , title
         , titletype
         , startyear
         , averagerating
         , numvotes
         , similarity(title, :q) AS sim
      FROM title_basics
     WHERE titletype IN ('movie', 'tvSeries')
       AND title % :q --bind parameter
)
  SELECT title
       , startyear
       , titletype
       , averagerating
       , numvotes
       , (
          0.7 * sim
          + 0.2 * COALESCE(averagerating / 10.0, 0)
          + 0.1 * COALESCE(ln(numvotes + 1) / 10.0, 0)
         ) AS relevance_score
    FROM candidates
   WHERE sim > 0.3
ORDER BY relevance_score DESC
   LIMIT 20;
Find duplicate title candidates:

--near-duplicates: same startyear, different ids, very similar titles
  SELECT t1.id                          AS id_1
       , t1.title                       AS title_1
       , t2.id                          AS id_2
       , t2.title                       AS title_2
       , t1.startyear                   AS startyear
       , similarity(t1.title, t2.title) AS sim
    FROM title_basics t1
    JOIN title_basics t2
      ON t1.startyear = t2.startyear
     AND t1.id < t2.id        --avoid pairs twice and self-joins
     AND t1.title % t2.title
   WHERE t1.startyear IS NOT NULL
     AND similarity(t1.title, t2.title) > 0.7   --arbitrary threshold
ORDER BY sim DESC
   LIMIT 100;