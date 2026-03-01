Setup
Start your psql shell and add the pgvector extension and a table for sample vector data:

=# CREATE EXTENSION IF NOT EXISTS vector;

=# CREATE TABLE glove_small (word TEXT, embedding VECTOR(50));

The embedding column will now accommodate 50-dimensional vectors. Next, insert the sample vector data into the table. The sample vector data is a pre-trained embedding set (based on GloVe 6B) of 50-dimensional vectors for 10,000 most common English words.

Insert the data (make sure you are in the nosql-lab folder):

$ docker exec -i postgres_lab psql -U student -d labdb < glove_top10k_50d.sql

Or, if on Powershell:

Get-Content glove_top10k_50d.sql -Raw | docker exec -i postgres_lab psql -U student -d labdb

Note that in this way you can execute .sql files. This is similar to the \i command in the psql shell.

Test vector similarity search:

=# SELECT word
FROM glove_small
ORDER BY embedding <=> (SELECT embedding FROM glove_small WHERE word = 'king')
LIMIT 10;

Classic example: king - man + woman = queen

=# SELECT word
FROM glove_small
ORDER BY embedding <=> (
      (SELECT embedding FROM glove_small WHERE word = 'king')
    - (SELECT embedding FROM glove_small WHERE word = 'man')
    + (SELECT embedding FROM glove_small WHERE word = 'woman')
)
LIMIT 10;

Does it work? How about with other similarity operators besides <=>?

Add an HNSW index with Cosine similarity index operator class for the field and analyze the table to speed up queries. However, for this amount of data, the index might not make a difference, as a simple sequential scan can be cheaper. 

#> CREATE INDEX glove_small_embedding_hnsw_idx
ON glove_small
USING HNSW (embedding vector_cosine_ops);

#> ANALYZE glove_small;

Exercise
Goals:

See that vector similarity captures semantic relatedness.
See how you can do non-trivial, "ML-flavored" exploration directly in PostgreSQL with SQL alone.
Mental refresh for SQL concepts.
Your task is to design and implement a small semantic explorer using SQL:

Pick at least 2 seed words that represent different concepts (e.g., an animal, a place).
For each seed word, use vector similarity to find its top N nearest neighbors (e.g., N = 20).
Inspect the neighbors and propose a human-readable label for the group (e.g., "animals", "cities", "sports").
Using only SQL (no external code), design a way to:
Compare how coherent these groups are (e.g. is the "animal" group more semantically tight than the "emotion" group?).
Rank your groups from most coherent to least coherent, and justify your ranking.
Propose one numeric metric you can compute purely in SQL to estimate "coherence" of a group of words and demonstrate it on your 2 groups.
There is no single correct solution.

To get started, you can find the nearest neighbors of your first chosen word:

  SELECT g1.word                       AS word
       , g1.embedding <-> g2.embedding AS distance
    FROM glove_small g1
       , glove_small g2
   WHERE g1.word <> 'cat' --of course
     AND g2.word = 'cat'
ORDER BY distance ASC
LIMIT 10;