I chose the words "cat" and "metal".

I did some preliminary searches and settled for Cosine similarity (<=>). N = 20 was too large for a coherent set of words, probably due to the dataset size (10,000 words), so I chose N = 5. I considered downloading a larger set of words, but did not. The results included pets, but also other animals. I chose a label of "animals" for the first group.

The second word returned metals, but also other materials such as plastic. I chose a label of "materials" for the second group.

I collected all neighbors for both groups into a single temporary table:

CREATE TEMP TABLE semantic_groups AS
SELECT 'animals' AS group_label
      , word
      , embedding
FROM (
    SELECT g1.word                       AS word
         , g1.embedding                  AS embedding
         , g1.embedding <-> g2.embedding AS distance
      FROM glove_small g1
         , glove_small g2
     WHERE g1.word <> 'cat'
       AND g2.word = 'cat'
  ORDER BY distance
  LIMIT 5
) t

UNION ALL
SELECT 'materials' AS group_label
      , word
      , embedding
FROM (
    SELECT g1.word                       AS word
         , g1.embedding                  AS embedding
         , g1.embedding <-> g2.embedding AS distance
      FROM glove_small g1
         , glove_small g2
     WHERE g1.word <> 'metal'
       AND g2.word = 'metal'
  ORDER BY distance
  LIMIT 5
) t;
I then computed centroids for both groups using AVG:

WITH centroids AS ( --using a CTE for clarity
      SELECT group_label    AS group
           , AVG(embedding) AS centroid
        FROM semantic_groups
    GROUP BY group_label
),
coherence AS (
      SELECT g.group_label                   AS group
           , AVG(g.embedding <=> c.centroid) AS mean_distance
        FROM semantic_groups g
        JOIN centroids c 
       USING (group_label)
    GROUP BY g.group_label
)
  SELECT *
    FROM coherence
ORDER BY mean_distance;
By examining the result table, it seems that the "animals" group of vectors is slightly less coherent than the "materials" group. This means that the vectors in the animals group are on average less similar (e.g., further apart from each other). This is in line with my earlier observations, and if I increased the N, this difference in group averages will likely increase as well.

I could use such groups for hybrid queries for increased performance, but decreased precision.