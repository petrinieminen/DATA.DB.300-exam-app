Setup
We use PostgreSQL 16. You can install a GUI for PostgreSQL (e.g., pgAdmin) for a more user-friendly experience. Please note that some PostgreSQL commands (e.g., \d) and some statements (e.g., CREATE EXTENSION) might not work with pgAdmin.

Start your psql shell and add the extensions for HSTORE and fuzzy search:

If your container is not running, start it with

$ docker container start postgres_lab

$ docker exec -it postgres_lab psql -U student -d labdb

=# CREATE EXTENSION IF NOT EXISTS hstore;

=# CREATE EXTENSION IF NOT EXISTS pg_trgm;

Extensions need to be created only once.

Create a new table for movies (for Exercise #2):

=# CREATE TABLE title_basics (
  id              SERIAL PRIMARY KEY
, titletype       VARCHAR
, primarytitle    VARCHAR
, startyear       NUMERIC
, runtimeminutes  VARCHAR
);

Quit the psql shell. Insert the movie dataset into your table, make sure to do this in the nosql-lab folder:

$ docker exec -i postgres_lab psql -U student -d labdb < title_basics_1000.sql

Or, if on Powershell:

Get-Content title_basics_1000.sql -Raw | docker exec -i postgres_lab psql -U student -d labdb

The dataset contains about 1,000 movies extracted from IMDb.com.

Note that in this way you can execute .sql files. This is similar to the \i command in the psql shell.

Exercise #1
Build a product catalog for a marketplace with very different kinds of products (books, clothes, electronics, etc.). Use JSONB, HSTORE, and ARRAY.

Design and implement the following.

Create a products table that includes non-atomic data types. Consider which data type to use.

A details column for dynamic attributes (e.g., size, color, cpu, author)
A metadata column for internal key-value flags (e.g., warehouse, priority)
A tags column for search tags (e.g., 'electronics', 'gaming', 'laptop')
You might be tempted to create another table for tags (that's good normalization), but for the sake of exercise, don't. Insert 3 example products: a t-shirt, a laptop and a novel. For each, show realistic values for details, metadata, and tags.

Write queries for:

Update or add information that shows that the laptop has 16 GB RAM.
Find all laptops with at least 16 GB RAM stored in details
Find all products where metadata has "priority" = 'high'
Find all products that have both 'gaming' and 'laptop' in tags
Update the laptop's attributes: change RAM to 32 GB and add some information about the laptop's battery.
Create at least one CHECK constraint for one of the non-atomic data type columns. For example, ensure that for your tag column, there are one to ten tags.

Add at least one GIN index that speeds up a typical JSONB or ARRAY query you wrote above.

See documentation (opens in a new tab):

JSON/JSONB
ARRAY
HSTORE
Exercise #2
This exercise is related to the title_basics table we created earlier.

A user types "Harry Poter" (typo) into the search box. You want to suggest the most likely intended titles.

Write a query that:

Searches only feature films (titletype = 'movie').
Finds titles that are fuzzy matches to the input "Harry Poter".
Ranks them from best to worst match.
Returns at most 10 suggestions, including each title’s startyear.
Now design a fuzzy search query that takes a parameter :q (e.g., "lord of the rings") and returns up to 20 results with:

Both movies and TV series
A relevance score that combines:
how similar title is to :q, and
how "popular" the title is, based on numvotes and/or averagerating columns
Based on your design, write a single SQL query that:

Computes a numeric relevance score using both fuzzy string similarity and popularity
Returns title, startyear, titletype, averagerating, numvotes, relevance_score
Orders the results by this relevance_score descending
Filters out very weak matches (e.g., similarity too low)
You are free to decide the exact formula for the relevance score
Next, write a query that spots duplicate titles using similarity search as well as other predicates if needed.

See documentation (opens in a new tab):