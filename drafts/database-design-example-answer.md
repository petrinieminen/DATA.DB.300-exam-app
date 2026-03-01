For showing title details:

CREATE TABLE titles_by_id (
  title_id            TEXT
, title_type          TEXT            --'movie' | 'series'
, title_display       TEXT            --for UI
, title_norm          TEXT            --lowercased for search
, release_year        INT
, runtime_min         INT
, seasons             INT
, poster_url          TEXT
, has_awards          BOOLEAN
, genres              SET<TEXT>       --bounded to max. 10 genres per title
, countries           SET<TEXT>
, aka_titles          MAP<TEXT, TEXT> --locale/region and localized title

  --providers by region (a small bounded map of sets)
, providers_by_region MAP<TEXT, FROZEN<SET<TEXT>>>

  --cached aggregates for lists/search
, avg_rating_x10      INT            --e.g., 83 means 8.3
, PRIMARY KEY ((title_id))
);
Add an example row:

INSERT INTO titles_by_id (
  title_id
, title_type
, title_display
, title_norm
, release_year
, runtime_min
, seasons
, poster_url
, has_awards
, genres
, countries
, aka_titles
, providers_by_region
, avg_rating_x10
)
VALUES (
  'tt10001'
, 'movie'
, 'Star Wars'
, 'star wars'
, 1979
, 122
, NULL
, '/posters/tt10001.png'
, True
, {'sci-fi', 'action'}
, {'US'},
  {'FI': 'Tähtien sota', 'SE': 'Stjärnornas krig'},
  {
    'FI': {'Netflix', 'HBO'},
    'SE': {'Netflix'}
  }
, 87
);
For credits for a person's filmography, and for a title's cast:

CREATE TABLE credits_by_entity (
  entity_kind    TEXT --'T' (title) or 'P' (person)
, entity_id      TEXT --title_id or person_id

, sort_bucket    TEXT --e.g., 'CAST' for title, 'FILMO' for person
, sort1          INT  --for CAST: billing order (1..n)
                      --for FILMO: year (descending query uses DESC)
, sort2          TEXT --tie-breaker (e.g. other_id)

, other_id       TEXT --person_id when kind='T', title_id when kind='P'
, other_display  TEXT --person name or title display
, role           TEXT --actor/director/writer
, character_name TEXT --only for actors
, PRIMARY KEY ((entity_kind, entity_id), sort_bucket, sort1, sort2)
) 
WITH CLUSTERING ORDER BY (sort_bucket ASC, sort1 DESC, sort2 ASC);
An insert to this table requires two INSERTs, because the table stores two kinds of data.

For a title's cast:

INSERT INTO credits_by_entity (
  entity_kind
, entity_id
, sort_bucket
, sort1
, sort2
, other_id
, other_display
, role
, character_name
) 
VALUES (
  'T'
, 't10001'
, 'CAST', 100
, 'nm0000206'
, 'nm0000206'
, 'Mark Hamill'
, 'actor'
, 'Luke Skywalker'
);
And for a person's filmographty:

INSERT INTO credits_by_entity (
  entity_kind
, entity_id
, sort_bucket
, sort1
, sort2
, other_id
, other_display
, role
) VALUES (
  'P'
, 'nm0000206'
, 'FILMO'
, 1979
, 'tt10001'
, 'tt10001'
, 'Star Wars'
, 'actor'
);
For multiple searches and sortings required by the UI:

CREATE TABLE search_titles (
  title_type     TEXT    --movie/series
, title_prefix3  TEXT    --e.g., 'sta'
, year_bucket    INT     --e.g., 1990, 2000, 2010, 2020
, has_awards     BOOLEAN --toggle-friendly
, sort_mode      TEXT    --'NEW' or 'RAT'ing

, sort_value     INT     --if NEW: release_year (or yyyymmdd)
                         --if RAT: avg_rating_x10
, title_norm     TEXT
, title_id       TEXT

, title_display  TEXT
, release_year   INT
, poster_url     TEXT
, genres_preview LIST<TEXT> --store 2–3 genres only for UI
, avg_rating_x10 INT

,  PRIMARY KEY (
    (title_type, title_prefix3, year_bucket, has_awards, sort_mode),
    sort_value, title_norm, title_id
  )
) 
WITH CLUSTERING ORDER BY (sort_value DESC, title_norm ASC, title_id ASC);
This table also requires multiple inserts: one per sort-mode.

For "newest first":

INSERT INTO search_titles (
  title_type
, title_prefix3
, year_bucket
, has_awards
, sort_mode

, sort_value
, title_norm
, title_id

, title_display
, release_year
, poster_url
, genres_preview
, avg_rating_x10
) 
VALUES (
  'movie'
, 'sta'
, 1970
, True
, 'NEW'

, 1979
, 'star wars'
, 'tt10001'

, 'Star Wars'
, 1979
, '/posters/tt10001.png'
, ['sci-fi', 'action']
, 87
);
And for "highest rated":

INSERT INTO search_titles (
  title_type
, title_prefix3
, year_bucket
, has_awards
, sort_mode

, sort_value
, title_norm
, title_id

, title_display
, release_year
, poster_url
, genres_preview
, avg_rating_x10
) VALUES (
  'movie'
, 'sta'
, 1970
,  True
, 'RAT'

, 87
, 'star wars'
, 'tt10001'

, 'Star Wars'
, 1979
, '/posters/tt10001.png'
, ['sci-fi', 'action']
, 87
);
A table for "trending", for which Cassandra stores a precomputed list:

CREATE TABLE trending_titles (
  region        TEXT --'FI', 'SE', 'US'
, period        TEXT --'DAY' | 'WEEK' | 'MONTH'
, period_start  DATE --start date of that day/week/month (bucketing)

, rank          INT  --1..N
, title_id      TEXT

, reason        TEXT
, title_type    TEXT
, title_display TEXT
, release_year  INT
, poster_url    TEXT

, PRIMARY KEY ((region, period, period_start), rank)
) 
WITH CLUSTERING ORDER BY (rank ASC);
And inserts, which can be done with a suitable TTL (or without). 604800 seconds = 1 week. The table needs a new row per rank, per time period, and per region:

INSERT INTO trending_titles (
  region
, period
, period_start
, rank
, title_id
, reason
, title_type
, title_display
, release_year
, poster_url
) 
VALUES (
  'FI'
, 'WEEK'
, '2026-01-26'
, 1
, 'tt10001'
, 'Top in Finland this week'
, 'movie'
, 'The Matrix'
, 1979
, '/posters/tt10001.png'
)
USING TTL 604800;
And a table for user activity (ratings, watchlist, recently viewed):

CREATE TABLE user_activity (
  user_id       TEXT
, activity_kind TEXT     --'WL' watchlist, 'RV' recently viewed, 'RT' rating event
, event_time    TIMEUUID --ordering & “last N” queries
, title_id      TEXT

, title_display TEXT
, release_year  INT
, poster_url    TEXT

, rating INT             --only for RT (1..10)
, PRIMARY KEY ((user_id, activity_kind), event_time)
) 
WITH CLUSTERING ORDER BY (event_time DESC);
And inserts for "add to watchlist":

INSERT INTO user_activity (
  user_id
, activity_kind
, event_time
, title_id
, title_display
, release_year
, poster_url
) VALUES (
 'user123'
, 'WL'
, now()
, 'tt10001'
, 'Star Wars'
, 1999
, '/posters/tt10001.png'
);
Recently viewed:

INSERT INTO user_activity (
  user_id
, activity_kind
, event_time
, title_id
, title_display
, release_year
, poster_url
) VALUES (
  'user123'
, 'RV'
, now()
, 'tt10001'
, 'Star Wars'
, 1979
, '/posters/tt10001.png'
);
Rate a title:

INSERT INTO user_activity (
  user_id
, activity_kind
, event_time
, title_id
, rating
) VALUES (
  'user123'
, 'RT'
, now()
, 'tt10001'
, 9
);
Queries
...to show that the solution works.

Screen A
"This week's trending in Finland". Use "DAY" for a day's trending.

SELECT rank, title_id, title_display, release_year, poster_url, reason, title_type
FROM trending_titles
WHERE region = 'FI'
  AND period = 'WEEK'
  AND period_start = '2026-01-19';
Screen B
User typed prefix “star…”, type=movie, year range 1977–1985, awards toggle OFF, sort by Newest. We generate queries for each year bucket selected:

SELECT title_id, title_display, release_year, poster_url, genres_preview, avg_rating_x10
FROM search_titles
WHERE title_type = 'movie'
  AND title_prefix3 = 'sta'
  AND year_bucket = 1970
  AND has_awards = false
  AND sort_mode = 'NEW'
LIMIT 20;
...and:

SELECT title_id, title_display, release_year, poster_url, genres_preview, avg_rating_x10
FROM search_titles
WHERE title_type = 'movie'
  AND title_prefix3 = 'sta'
  AND year_bucket = 1980
  AND has_awards = false
  AND sort_mode = 'NEW'
LIMIT 20;
As the result sets have a small number of rows, we merge the results client-side.

If the user chooses "highest rated":

SELECT title_id, title_display, release_year, poster_url, genres_preview, avg_rating_x10
FROM search_titles
WHERE title_type = 'movie'
  AND title_prefix3 = 'sta'
  AND year_bucket = 1980
  AND has_awards = false
  AND sort_mode = 'RAT'
LIMIT 20;
Screen C
Get basic details:

SELECT *
FROM titles_by_id
WHERE title_id = 'tt10001';
Get the title's TOP-10 cast:

SELECT other_id, other_display, role, character_name
FROM credits_by_entity
WHERE entity_kind = 'T'
  AND entity_id = 'tt10001'
  AND sort_bucket = 'CAST'
LIMIT 10;
And providers for the user's region can be read from titles_by_id.

Screen D
Which titles a person is known for:

SELECT other_id, other_display, role, sort1
FROM credits_by_entity
WHERE entity_kind = 'P'
  AND entity_id = 'nm0000206'
  AND sort_bucket = 'KNOWN'
LIMIT 6;
A person's filmography (newest first):

SELECT other_id AS title_id, other_display AS title_display, role, sort1 AS year
FROM credits_by_entity
WHERE entity_kind = 'P'
  AND entity_id = 'nm0000206'
  AND sort_bucket = 'FILMO'
LIMIT 50;
A person's filmography (oldest first):

SELECT other_id, other_display, role, sort1
FROM credits_by_entity
WHERE entity_kind = 'P'
  AND entity_id = 'nm0000206'
  AND sort_bucket = 'FILMO_ASC'
LIMIT 50;
Screen E
Get watchlist (and sort it in the application):

SELECT title_id, title_display, release_year, poster_url, event_time
FROM user_activity
WHERE user_id = 'u123'
  AND activity_kind = 'WL'
LIMIT 500;
Get recently viewed:

SELECT title_id, title_display, release_year, poster_url, event_time
FROM user_activity
WHERE user_id = 'u123'
  AND activity_kind = 'RV'
LIMIT 20;
Jump to...