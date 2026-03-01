Setup
Let’s start by connecting to Cassandra's cqlsh shell in the container. Start the container first, if it is not running:

$ docker container start cassandra_lab

And connect (Cassandra might take a minute to start):

$ docker exec -it cassandra_lab cqlsh

You can list the existing keyspaces with

cqlsh> DESCRIBE KEYSPACES;

You should see Cassandra's equivalent to PostgreSQL's "information schema", meaning database and DBMS metadata. Do not alter these keyspaces.

Create a new keyspace for our movie database:

cqlsh> CREATE KEYSPACE movies WITH replication = {'class' : 'NetworkTopologyStrategy'};

And connect to your new keypace:

cqlsh> USE movies;

Let’s create a table for our movies, and insert a row:

cqlsh> CREATE TABLE title_basics (
  id             UUID
, titletype      TEXT
, primarytitle   TEXT
, startyear      INT
, runtimeminutes INT
, tags           LIST<TEXT>
, PRIMARY KEY ((titletype, startyear), primarytitle)
);

cqlsh> INSERT INTO title_basics (id, titletype, primarytitle, startyear, runtimeminutes, tags)
VALUES (uuid(), 'movie', 'The Matrix', 1999, 132, ['sci-fi', 'action']);

cqlsh> SELECT * FROM title_basics;

Notice how:

The syntax for defining a list (LIST<TEXT>) and the syntax for inserting tags in a list.
The columns in the result table are ordered and colored according to the primary key. 
uuid() function creates a unique identifier. This is globally unique, 128-bit value that can be generated without node coordination.
Since our partition key is ((titletype, startyear), primarytitle), the combination of these columns guarantees uniqueness. This means that the id column does not mean or do anything: it's redundant. Try this by inserting another row, and see what happens:
cqlsh> INSERT INTO title_basics (id, titletype, primarytitle, startyear, runtimeminutes, tags)
VALUES (uuid(), 'movie', 'The Matrix', 1999, 123, ['sci-fi', 'action', 'dystopian']);

cqlsh> SELECT * FROM title_basics;

Contrary to what you might have expected, this worked like an UPSERT rather than INSERT, because of the chosen primary key.

If you need ad hoc queries without needing to worry about primary keys, you can use ALLOW FILTERING at the end of your query (SELECT ... ALLOW FILTERING;). However, do not use ALLOW FILTERING to justify your design choices, as such solutions fail to scale.

Exercise
Familiarize yourself with the non-atomic data types (LIST, SET, MAP). Use the documentation to find relevant operators

https://cassandra.apache.org/doc/5.0/cassandra/developing/cql/cql_singlefile.html#collections

Using your title_basics table
- append a new tag to an existing movie (e.g., The Matrix)
- remove a tag

Create a new table that stores unique cast members (e.g., Keanu Reeves) per movie using the SET data type.

- Insert a movie with cast members
- Add a duplicate cast member
- Observe the result

Store movie ratings from multiple sources (IMDb, Rotten Tomatoes, Metacritic) using the MAP data type. Create a new table for this. In other words, this new table should contain information on how well a movie was received according to IMDb, and according to Rotten Tomatoes, and according to Metacritic.

Then:

- Insert ratings
- Update a single rating
- Remove one source (e.g., IMDb)

Create a table to store screening events for movies where:

- Screenings are ordered by time. Use the TIMEUUID data type
- You can fetch the latest screenings for a movie

Then:

- Insert multiple screenings. Use the now() function to add TIMEUUID values.
- Query the latest 2 screenings
- Try to query the TIMEUUID column using a custom time, e.g., minTimeuuid('2026-01-22')

Create a final table to study nested non-atomic data types:

cqlsh> CREATE TABLE movie_theaters (movie_id UUID, theater MAP<TEXT, FROZEN<SET<TEXT>>>, PRIMARY KEY ((movie_id)));

And add a row:

cqlsh> INSERT INTO movie_theaters (movie_id, theater)
VALUES (
  uuid(),
  {
    'FI': {'Finnkino', 'Hervannan elokuvateatteri'},
    'SE': {'Filmstaden', 'Rio Bio', 'Rigoletto'}
  }
);

The latter column is a nested collection: a SET nested inside a MAP. The contents look like this:

{
  'FI': {'Finnkino', 'Hervannan elokuvateatteri'},
  'SE': {'Filmstaden', 'Rio Bio', 'Rigoletto'}
}

The FROZEN keyword is required for nested collections. Effectively, FROZEN means that you cannot query or alter the contents of a frozen collection, i.e., the nested SET is an atomic value to Cassandra. If you need to modify the FROZEN SET, you need to replace it with a new one.

Given the considerations above, modify the row so that "Rigoletto" is no longer showing the movie in Sweden (SE).