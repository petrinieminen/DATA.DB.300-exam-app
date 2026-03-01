Append a new tag to the title_basics table with the + operator:

UPDATE movie_tags
SET tags = tags + ['mind-bending']
WHERE titletype = 'movie'
  AND primarytitle = 'The Matrix';

Remove a tag with the - operator:

UPDATE movie_tags
SET tags = tags - ['dystopian']
WHERE titletype = 'movie'
  AND primarytitle = 'The Matrix';

Create a new table for cast members:

CREATE TABLE movie_cast (
    primarytitle TEXT
,   cast SET<TEXT>
,   PRIMARY KEY (primarytitle)
);

Insert a new movie:

INSERT INTO movie_cast (primarytitle, cast)
VALUES ('The Matrix', {'Keanu Reeves', 'Carrie-Anne Moss'});

Add a duplicate cast member:

UPDATE movie_cast
SET cast = cast + {'Keanu Reeves'}
WHERE primarytitle = 'The Matrix';

And see what the result is:

SELECT * FROM movie_cast;

Looks like there are no duplicates, as SET does not allow duplicates.

Create a new table for movie ratings:

CREATE TABLE movie_ratings (
    primarytitle TEXT
,   ratings MAP<TEXT, FLOAT> --I used TEXT and FLOAT data types
,   PRIMARY KEY (primarytitle)
);

Insert a rating:

INSERT INTO movie_ratings (primarytitle, ratings)
VALUES (
    'The Matrix',
    {'imdb': 8.5, 'rt': 76.0}
);

Update a rating:

UPDATE movie_ratings
SET ratings['rt'] = 73.0
WHERE primarytitle = 'The Matrix';

Remove a rating source:

DELETE ratings['imdb']
FROM movie_ratings
WHERE primarytitle = 'The Matrix';

Create a table for storing movie screening times:

CREATE TABLE movie_screenings (
    primarytitle TEXT
,   screening_time TIMEUUID
,   cinema TEXT -- optional for future data needs
,   city TEXT -- optional for future data needs
,   PRIMARY KEY (primarytitle, screening_time)
);

Insert a couple of screenings:

INSERT INTO movie_screenings (primarytitle, screening_time, cinema, city)
VALUES ('The Matrix', now(), 'IMAX', 'Tampere');

INSERT INTO movie_screenings (primarytitle, screening_time, cinema, city)
VALUES ('The Matrix', now(), 'Cinema City', 'Paris');

Query the two latest screenings:

SELECT *
FROM movie_screenings
WHERE primarytitle = 'The Matrix'
ORDER BY screening_time DESC
LIMIT 2;

Query with a custom time:

SELECT *
FROM movie_screenings
WHERE primarytitle = 'The Matrix'
  AND screening_time >= minTimeuuid('2026-01-20');

Remove "Rigoletto" from the list of theaters in Sweden by replacing the whole set:

UPDATE movie_theaters
SET theater['SE'] = {'Filmstaden', 'Rio Bio'};

The answer above assumes that the table only has the one row. Add a WHERE clause for an expression on movie_id for a real use-case.