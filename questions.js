/**
 * DATA.DB.300 – Exam Question Bank
 * ~25% per category: PostgreSQL, Cassandra, MongoDB, Others
 * Based on course lectures, exercises, and example answers.
 */
const QUESTIONS = {

  /* ══════════════════════════════════════════════════════
     POSTGRESQL
     ══════════════════════════════════════════════════════ */
  postgresql: [
    {
      q: "Which PostgreSQL data type is best for storing dynamic, schema-flexible attributes (e.g., product details that vary by category)?",
      options: ["HSTORE", "JSONB", "TEXT[]", "XML"],
      answer: 1,
      explanation: "JSONB supports nested structures, rich querying operators, and GIN indexing. HSTORE only supports flat key-value pairs. ARRAY is for lists of a single type."
    },
    {
      q: "What does the JSONB merge operator || do?",
      options: [
        "Concatenates two JSONB arrays only",
        "Adds the field if it does not exist and modifies the value if it already exists",
        "Performs a deep recursive merge of nested objects",
        "Replaces the entire JSONB column"
      ],
      answer: 1,
      explanation: "The || operator merges top-level keys. It adds new keys and overwrites existing ones. E.g., details || '{\"ram_gb\": 16}'::jsonb adds or updates the ram_gb field."
    },
    {
      q: "Which index type is most appropriate for speeding up JSONB containment queries (@>) and ARRAY overlap queries (&&)?",
      options: ["B-tree", "BRIN", "GIN", "Hash"],
      answer: 2,
      explanation: "GIN (Generalized Inverted Index) is designed for composite values like JSONB, arrays, and full-text search. B-tree works for scalar comparisons but not containment operators."
    },
    {
      q: "What is the correct syntax to check if a JSONB column contains a specific key?",
      options: [
        "details HAS KEY 'ram_gb'",
        "details ? 'ram_gb'",
        "details CONTAINS 'ram_gb'",
        "details->>'ram_gb' EXISTS"
      ],
      answer: 1,
      explanation: "The ? operator checks whether a JSONB value contains a specific top-level key. E.g., details ? 'ram_gb' returns true if the key exists."
    },
    {
      q: "What is the difference between -> and ->> operators in PostgreSQL JSONB?",
      options: [
        "-> returns text, ->> returns JSONB",
        "-> returns JSONB, ->> returns text",
        "They are identical",
        "-> is for arrays, ->> is for objects"
      ],
      answer: 1,
      explanation: "The -> operator returns the value as a JSONB type, while ->> returns it as text. This matters for comparisons — to compare as integer, use (details->>'ram_gb')::int."
    },
    {
      q: "Which PostgreSQL data type stores flat key-value pairs (both keys and values are strings)?",
      options: ["JSONB", "HSTORE", "RECORD", "MAP"],
      answer: 1,
      explanation: "HSTORE stores key-value pairs where both keys and values are strings. It's simpler than JSONB but doesn't support nesting. MAP does not exist in PostgreSQL."
    },
    {
      q: "What does the @> operator do for arrays in PostgreSQL?",
      code: "SELECT * FROM products WHERE tags @> ARRAY['gaming', 'laptop'];",
      options: [
        "Checks if left array has any element in common with right array",
        "Checks if left array contains all elements of the right array",
        "Checks if arrays are exactly equal",
        "Appends the right array to the left array"
      ],
      answer: 1,
      explanation: "The @> (containment) operator checks if the left array contains all elements from the right array. For 'any overlap', you would use the && operator."
    },
    {
      q: "Which extension provides the similarity() function and the % operator for fuzzy text matching?",
      options: ["pg_trgm", "fuzzystrmatch", "pgvector", "hstore"],
      answer: 0,
      explanation: "pg_trgm (trigram) provides similarity() which returns a value 0–1, and the % operator which checks if similarity exceeds a threshold. It's ideal for typo-tolerant search."
    },
    {
      q: "What does EXPLAIN ANALYZE do in PostgreSQL?",
      options: [
        "Shows the query plan without executing the query",
        "Executes the query AND shows the actual execution plan with timing",
        "Analyzes table statistics without running any query",
        "Optimizes the query and rewrites it"
      ],
      answer: 1,
      explanation: "EXPLAIN shows the planned execution. EXPLAIN ANALYZE actually runs the query and reports real timings and row counts. Note: the query IS executed (inserts happen, deletes happen, etc.)."
    },
    {
      q: "Given a products table with a JSONB 'details' column, how do you find laptops with at least 16 GB RAM?",
      options: [
        "WHERE details->>'type' = 'laptop' AND details->>'ram_gb' >= 16",
        "WHERE details->>'type' = 'laptop' AND (details->>'ram_gb')::int >= 16",
        "WHERE details->'type' = 'laptop' AND details->'ram_gb' >= 16",
        "WHERE details @> '{\"type\": \"laptop\", \"ram_gb\": 16}'"
      ],
      answer: 1,
      explanation: "The ->> operator returns text, so you must cast to int for numeric comparison: (details->>'ram_gb')::int >= 16. Option D would match only exactly 16, not 'at least 16'."
    },
    {
      q: "What is the purpose of the CHECK constraint in this statement?",
      code: "ALTER TABLE products ADD CONSTRAINT tags_size CHECK (array_length(tags, 1) BETWEEN 1 AND 10);",
      options: [
        "Ensures the tags array always has between 1 and 10 elements",
        "Creates an index on the tags array",
        "Validates that tag values are unique",
        "Limits the string length of each tag"
      ],
      answer: 0,
      explanation: "CHECK constraints enforce domain rules. Here it ensures every product has 1 to 10 tags. array_length(tags, 1) returns the length of the first dimension of the array."
    },
    {
      q: "In the fuzzy search relevance formula, why combine similarity with numvotes/averagerating?",
      code: "0.7 * sim + 0.2 * COALESCE(averagerating / 10.0, 0) + 0.1 * COALESCE(ln(numvotes + 1) / 10.0, 0) AS relevance_score",
      options: [
        "Because similarity alone would rank obscure exact matches above popular near-matches",
        "Because PostgreSQL requires multiple columns in ORDER BY",
        "Because the % operator doesn't work without additional columns",
        "Because COALESCE is required for all float operations"
      ],
      answer: 0,
      explanation: "A pure string similarity search might rank obscure titles with perfect matches above popular, well-known titles with slight name variations. Combining with popularity creates a more useful search."
    },
    {
      q: "How do you detect near-duplicate titles in a database using pg_trgm?",
      options: [
        "Use DISTINCT ON to remove duplicates",
        "Self-join the table using the % operator with a similarity threshold",
        "Use GROUP BY with HAVING COUNT(*) > 1",
        "Create a UNIQUE index on the title column"
      ],
      answer: 1,
      explanation: "A self-join with t1.title % t2.title and t1.id < t2.id (to avoid self-matches and duplicate pairs) plus a similarity threshold (e.g., > 0.7) finds near-duplicate titles."
    },
    {
      q: "What does this HSTORE query return?",
      code: "SELECT * FROM products WHERE metadata -> 'priority' = 'high';",
      options: [
        "All products that have any metadata",
        "All products where the metadata 'priority' key has the value 'high'",
        "All products sorted by priority",
        "Error — HSTORE doesn't support the -> operator"
      ],
      answer: 1,
      explanation: "HSTORE uses -> to access values by key, similar to JSONB. metadata -> 'priority' returns the string value for that key, which is then compared to 'high'."
    },
    {
      q: "Why might PostgreSQL not use a GIN index on a small table?",
      options: [
        "GIN indexes only work on tables with more than 10,000 rows",
        "The query planner may determine a sequential scan is cheaper for small tables",
        "GIN indexes are disabled by default",
        "You must run REINDEX before GIN indexes activate"
      ],
      answer: 1,
      explanation: "PostgreSQL's query planner is cost-based. For small tables, a sequential scan can be faster than an index lookup because it avoids the overhead of index traversal. Use EXPLAIN ANALYZE to verify."
    },
    {
      q: "What does the similarity() function from pg_trgm return?",
      options: [
        "A boolean — true if strings match",
        "An integer count of matching characters",
        "A float between 0 and 1, where 1 means identical",
        "The Levenshtein edit distance"
      ],
      answer: 2,
      explanation: "similarity() returns a float from 0 (no match) to 1 (identical). It's based on trigram overlap — the proportion of shared 3-character substrings between the two strings."
    },
    {
      q: "In PostgreSQL, what is the difference between TEXT[] and JSONB arrays?",
      options: [
        "TEXT[] is typed and can use GIN indexes with @>; JSONB arrays are schema-flexible and can store mixed types",
        "They are identical in functionality",
        "JSONB arrays are faster for all operations",
        "TEXT[] supports nesting, JSONB arrays don't"
      ],
      answer: 0,
      explanation: "TEXT[] is a native PostgreSQL array of a specific type, efficient for homogeneous lists. JSONB arrays are part of a flexible JSON structure and can contain mixed types and nested objects."
    },
    {
      q: "What does the <=> operator do with pgvector?",
      options: [
        "Euclidean distance",
        "Cosine distance",
        "Inner product distance",
        "Manhattan distance"
      ],
      answer: 1,
      explanation: "In pgvector: <-> is Euclidean (L2) distance, <=> is cosine distance, and <#> is negative inner product. Cosine distance measures the angle between vectors regardless of magnitude."
    },
    {
      q: "What is the purpose of the ANALYZE command after creating an HNSW index?",
      code: "CREATE INDEX idx ON glove_small USING HNSW (embedding vector_cosine_ops);\nANALYZE glove_small;",
      options: [
        "It rebuilds the index from scratch",
        "It collects table statistics so the query planner can make optimal decisions",
        "It validates that the index has no corruption",
        "It compresses the index for faster lookups"
      ],
      answer: 1,
      explanation: "ANALYZE gathers statistics about the distribution of values in the table's columns. This helps the query planner decide whether to use the index or a sequential scan."
    },
    {
      q: "Which vector similarity operation would you use for the classic 'king - man + woman = queen' analogy?",
      options: [
        "Cosine distance only",
        "Vector arithmetic (subtraction + addition) combined with a distance search",
        "Dot product similarity",
        "Euclidean distance without any arithmetic"
      ],
      answer: 1,
      explanation: "The analogy requires vector arithmetic: (king vector) - (man vector) + (woman vector), then finding the nearest neighbor to the result. The ORDER BY embedding <=> (computed_vector) finds the closest match."
    },
  ],

  /* ══════════════════════════════════════════════════════
     CASSANDRA
     ══════════════════════════════════════════════════════ */
  cassandra: [
    {
      q: "In Cassandra, what determines which node stores a particular row?",
      options: [
        "The clustering columns",
        "The partition key",
        "The keyspace replication strategy",
        "The row's insertion timestamp"
      ],
      answer: 1,
      explanation: "The partition key is hashed to determine which node(s) store the data. Rows with the same partition key are stored together on the same node. Clustering columns determine sort order within a partition."
    },
    {
      q: "What happens when you INSERT a row in Cassandra with the same primary key as an existing row?",
      options: [
        "An error is thrown (duplicate key violation)",
        "The old row is kept and the new one is rejected",
        "It performs an UPSERT — the existing row is overwritten",
        "Both rows are stored with different timestamps"
      ],
      answer: 2,
      explanation: "Cassandra's INSERT works as an UPSERT. If a row with the same primary key already exists, the values are overwritten. There is no duplicate key error like in SQL databases."
    },
    {
      q: "What is the purpose of clustering columns in a Cassandra PRIMARY KEY?",
      options: [
        "They determine which node stores the data",
        "They determine the sort order of rows within a partition",
        "They enforce unique constraints",
        "They enable secondary indexing"
      ],
      answer: 1,
      explanation: "Clustering columns define the sort order within a partition. Combined with WITH CLUSTERING ORDER BY, they allow efficient range queries and sorted retrieval within a partition."
    },
    {
      q: "Why should you avoid ALLOW FILTERING in production Cassandra queries?",
      options: [
        "It's a deprecated feature",
        "It requires all nodes to scan their data, failing to scale",
        "It only works with secondary indexes",
        "It prevents data replication"
      ],
      answer: 1,
      explanation: "ALLOW FILTERING forces Cassandra to scan partitions to filter results, which doesn't scale. In a well-designed schema, every query should be efficiently served by the primary key structure."
    },
    {
      q: "Which Cassandra data type ensures no duplicate elements?",
      options: ["LIST<TEXT>", "SET<TEXT>", "MAP<TEXT, TEXT>", "TUPLE<TEXT>"],
      answer: 1,
      explanation: "SET guarantees uniqueness — adding a duplicate element is a no-op. LIST allows duplicates and preserves insertion order. MAP stores key-value pairs."
    },
    {
      q: "How do you add a new element to a LIST column in Cassandra?",
      options: [
        "UPDATE t SET tags = tags + ['new_tag'] WHERE ...;",
        "INSERT INTO t (tags) VALUES (tags + ['new_tag']) WHERE ...;",
        "ALTER t ADD tags 'new_tag' WHERE ...;",
        "UPDATE t SET tags.append('new_tag') WHERE ...;"
      ],
      answer: 0,
      explanation: "Use the + operator with UPDATE to append to a list: SET tags = tags + ['new_tag']. To prepend, reverse the order: SET tags = ['new_tag'] + tags. The - operator removes elements."
    },
    {
      q: "How do you update a single value in a MAP column in Cassandra?",
      code: "-- Given: ratings MAP<TEXT, FLOAT>",
      options: [
        "UPDATE t SET ratings = ratings + {'rt': 73.0} WHERE ...;",
        "UPDATE t SET ratings['rt'] = 73.0 WHERE ...;",
        "ALTER t SET ratings.rt = 73.0 WHERE ...;",
        "UPDATE t SET ratings.put('rt', 73.0) WHERE ...;"
      ],
      answer: 1,
      explanation: "MAP values are updated using bracket notation: SET ratings['rt'] = 73.0. To delete a key: DELETE ratings['imdb'] FROM t WHERE ...;"
    },
    {
      q: "What does the FROZEN keyword mean for nested collections in Cassandra?",
      code: "MAP<TEXT, FROZEN<SET<TEXT>>>",
      options: [
        "The nested collection is compressed for storage",
        "The nested collection is treated as an atomic value — you cannot query or modify individual elements",
        "The nested collection is immutable and cannot be changed at all",
        "The nested collection supports concurrent modifications"
      ],
      answer: 1,
      explanation: "FROZEN means the inner collection (SET in this case) is serialized as a single blob. You can replace the entire frozen set but cannot add/remove individual elements. To modify, replace the whole value."
    },
    {
      q: "What is TIMEUUID and when would you use it?",
      options: [
        "A random UUID — use it as a primary key",
        "A time-based UUID that encodes a timestamp — use it for time-ordered data",
        "A UUID generated from a text hash — use it for deduplication",
        "A counter type — use it for incrementing values"
      ],
      answer: 1,
      explanation: "TIMEUUID (Type 1 UUID) embeds a timestamp, allowing time-based ordering. now() generates the current TIMEUUID. Use it for time-series data like screening events, activity logs, etc."
    },
    {
      q: "In this Cassandra table, what does the PRIMARY KEY structure achieve?",
      code: "PRIMARY KEY ((user_id, activity_kind), event_time)\nWITH CLUSTERING ORDER BY (event_time DESC);",
      options: [
        "Partitions by user_id only, clusters by activity_kind and event_time",
        "Partitions by (user_id, activity_kind), so each user+activity combo is one partition, sorted by event_time DESC",
        "Creates a single global partition with all data sorted by event_time",
        "Partitions by event_time for time-based sharding"
      ],
      answer: 1,
      explanation: "The double parentheses ((user_id, activity_kind)) make both columns the partition key. Within each partition, rows are sorted by event_time DESC, allowing efficient 'latest N' queries."
    },
    {
      q: "What does TTL (Time To Live) do in Cassandra?",
      code: "INSERT INTO trending_titles (...) VALUES (...) USING TTL 604800;",
      options: [
        "Sets a maximum query timeout",
        "Automatically deletes the row after the specified number of seconds",
        "Limits how many times the row can be read",
        "Sets the replication factor for that specific row"
      ],
      answer: 1,
      explanation: "TTL automatically expires (deletes) data after the specified seconds. 604800 seconds = 1 week. This is useful for temporary data like trending lists that need periodic refresh."
    },
    {
      q: "In wide-column database design, what does 'query-driven design' mean?",
      options: [
        "Design tables based on entity relationships like in SQL",
        "Design tables to efficiently serve specific access patterns / queries",
        "Design queries after creating the tables",
        "Use SELECT * for all queries"
      ],
      answer: 1,
      explanation: "In Cassandra, you design tables to serve specific queries. Each table's primary key is crafted so the most important queries can be answered without ALLOW FILTERING. This often means denormalization and data duplication."
    },
    {
      q: "How does this search table handle multiple sort modes?",
      code: "PRIMARY KEY (\n  (title_type, title_prefix3, year_bucket, has_awards, sort_mode),\n  sort_value, title_norm, title_id\n)",
      options: [
        "sort_mode is a clustering column that enables switching between sorts",
        "sort_mode is part of the partition key — each sort mode creates a separate partition with its own sort_value ordering",
        "sort_mode is ignored by the query planner",
        "sort_mode enables ALLOW FILTERING"
      ],
      answer: 1,
      explanation: "By including sort_mode in the partition key, 'NEW' (newest) and 'RAT' (highest rated) data live in separate partitions. The sort_value clustering column then stores year or rating respectively, allowing efficient sorted reads."
    },
    {
      q: "Why does the search table use 'year_bucket' (e.g., 1970, 1980) instead of exact year in the partition key?",
      options: [
        "Cassandra doesn't support integer partition keys",
        "To reduce the number of partitions while still enabling year-range filtering via client-side merging",
        "Year buckets are required by CQL syntax",
        "To enable ALLOW FILTERING on exact years"
      ],
      answer: 1,
      explanation: "Using decade buckets limits the number of partitions while supporting year-range queries. The application queries relevant buckets (e.g., 1970, 1980 for 1977–1985) and merges results client-side."
    },
    {
      q: "What is the recommended approach for handling 'small amount' of client-side processing in Cassandra design?",
      options: [
        "Never do anything client-side",
        "Do all processing client-side",
        "Some operations with small, bounded result sets can be done client-side (e.g., sorting a watchlist of <500 items)",
        "Only use client-side processing with ALLOW FILTERING"
      ],
      answer: 2,
      explanation: "Cassandra design allows limited client-side processing for small, bounded datasets. For example, sorting a user's watchlist (a few hundred items) is acceptable. But scanning potentially large datasets must be done by Cassandra."
    },
    {
      q: "In the credits_by_entity table design, why store both title→person and person→title data in the same table?",
      code: "entity_kind TEXT --'T' (title) or 'P' (person)\nentity_id   TEXT --title_id or person_id",
      options: [
        "To save disk space",
        "To reduce the number of tables while supporting both 'cast of a movie' and 'filmography of a person' queries",
        "Because Cassandra requires all related data in one table",
        "To enable joins between titles and people"
      ],
      answer: 1,
      explanation: "This clever design uses entity_kind to distinguish between two use cases in one table. 'T' partitions serve title→cast queries, 'P' partitions serve person→filmography queries. This reduces table count while avoiding ALLOW FILTERING."
    },
    {
      q: "What is a keyspace in Cassandra?",
      options: [
        "Equivalent to a table in SQL",
        "Equivalent to a database/schema in SQL — contains tables and defines replication",
        "A type of index",
        "A partition grouping mechanism"
      ],
      answer: 1,
      explanation: "A keyspace is the top-level container in Cassandra, similar to a database or schema in SQL. It defines replication strategy and factor, and contains tables."
    },
    {
      q: "Which replication strategy is shown in this keyspace creation?",
      code: "CREATE KEYSPACE movies WITH replication = {'class' : 'NetworkTopologyStrategy'};",
      options: [
        "SimpleStrategy — replicates across all nodes equally",
        "NetworkTopologyStrategy — replicates with awareness of data centers and racks",
        "LocalStrategy — no replication",
        "EverywhereStrategy — full replication to all nodes"
      ],
      answer: 1,
      explanation: "NetworkTopologyStrategy is the recommended production strategy. It places replicas across different racks and data centers for fault tolerance. SimpleStrategy is only for single-datacenter setups."
    },
    {
      q: "How would you query the latest 2 screenings for a movie?",
      options: [
        "SELECT * FROM movie_screenings WHERE primarytitle = 'The Matrix' ORDER BY screening_time DESC LIMIT 2;",
        "SELECT TOP 2 * FROM movie_screenings WHERE primarytitle = 'The Matrix';",
        "SELECT * FROM movie_screenings WHERE primarytitle = 'The Matrix' FETCH FIRST 2;",
        "SELECT * FROM movie_screenings LIMIT 2 WHERE primarytitle = 'The Matrix';"
      ],
      answer: 0,
      explanation: "CQL uses ORDER BY with DESC/ASC and LIMIT, similar to SQL. The ORDER BY must align with the clustering column order defined in the table. TOP and FETCH FIRST are not CQL syntax."
    },
    {
      q: "How do you remove a specific key from a MAP column in Cassandra?",
      options: [
        "UPDATE t SET ratings = ratings - {'imdb'} WHERE ...;",
        "DELETE ratings['imdb'] FROM t WHERE ...;",
        "ALTER t DROP ratings.imdb;",
        "UPDATE t SET ratings['imdb'] = NULL WHERE ...;"
      ],
      answer: 1,
      explanation: "Use the DELETE statement with bracket notation: DELETE ratings['imdb'] FROM table WHERE ...; This removes a specific key from the MAP column."
    },
  ],

  /* ══════════════════════════════════════════════════════
     MONGODB
     ══════════════════════════════════════════════════════ */
  mongodb: [
    {
      q: "What is the difference between find() and findOne() in MongoDB?",
      options: [
        "find() returns a cursor over all matching documents; findOne() returns the first matching document (or null)",
        "find() returns one document; findOne() returns all",
        "They are identical",
        "findOne() is deprecated in MongoDB 8.0"
      ],
      answer: 0,
      explanation: "find() returns a cursor that you can iterate over (use .limit(), .sort(), etc.). findOne() returns a single document directly, or null if no match is found."
    },
    {
      q: "What does the second parameter in find() control?",
      code: "db.people.find({ }, { _id: 0, name: 1, born: 1 });",
      options: [
        "Sort order",
        "Projection — which fields to include (1) or exclude (0) in results",
        "Query limit",
        "Index hints"
      ],
      answer: 1,
      explanation: "The second parameter is the projection document. { _id: 0, name: 1, born: 1 } means: exclude _id, include name and born. It's equivalent to SQL's SELECT clause."
    },
    {
      q: "How do you access a nested field value in a MongoDB query?",
      code: 'db.movies.find({ "rating.imdb": { $gte: 8.5 } });',
      options: [
        "Using dot notation inside quotes: \"rating.imdb\"",
        "Using arrow syntax: rating->imdb",
        "Using bracket notation: rating['imdb']",
        "Using $nested operator"
      ],
      answer: 0,
      explanation: "MongoDB uses dot notation for nested fields: \"rating.imdb\" accesses the imdb field inside the rating embedded document. The field path must be in quotes."
    },
    {
      q: "What is the difference between $in and $all operators for array fields?",
      options: [
        "$in matches if ANY element is in the array; $all matches if ALL elements are in the array",
        "$in is for embedded documents; $all is for arrays",
        "They are identical",
        "$all matches partial strings; $in matches exact values"
      ],
      answer: 0,
      explanation: "$in: 'does the field contain ANY of these values?' — genres: { $in: ['Sci-Fi', 'Thriller'] } matches if either is present. $all: 'does the field contain ALL of these values?' — tags: { $all: ['time', 'spy'] } requires both."
    },
    {
      q: "What does the $addToSet update operator do?",
      options: [
        "Adds an element to an array regardless of duplicates",
        "Adds an element to an array only if it's not already present",
        "Creates a new SET collection",
        "Replaces the array with a single element"
      ],
      answer: 1,
      explanation: "$addToSet adds a value to an array only if it doesn't already exist. To always add (allowing duplicates), use $push instead."
    },
    {
      q: "What does the $inc operator do?",
      code: 'db.movies.updateOne({ title: "Barbie" }, { $inc: { boxOfficeM: 10 } });',
      options: [
        "Sets boxOfficeM to 10",
        "Multiplies boxOfficeM by 10",
        "Increases boxOfficeM by 10 (or decreases if negative)",
        "Checks if boxOfficeM includes 10"
      ],
      answer: 2,
      explanation: "$inc atomically increments a field by the given amount. Use negative values to decrement. If the field doesn't exist, $inc creates it with the specified value."
    },
    {
      q: "What is the purpose of $lookup in MongoDB's aggregation pipeline?",
      options: [
        "To search for documents by text",
        "To perform a left outer join with another collection",
        "To create a new collection",
        "To validate document schemas"
      ],
      answer: 1,
      explanation: "$lookup performs a left outer join between the current collection and another. It matches a local field to a foreign field and adds matching documents as an array field."
    },
    {
      q: "What does $unwind do in an aggregation pipeline?",
      options: [
        "Reverses the sort order",
        "Deconstructs an array field, outputting one document per array element",
        "Removes duplicate documents",
        "Flattens nested objects into top-level fields"
      ],
      answer: 1,
      explanation: "$unwind takes an array field and creates a separate document for each element. With preserveNullAndEmptyArrays: true, documents without the array are preserved (like a LEFT JOIN)."
    },
    {
      q: "What is the role of $group in MongoDB aggregation?",
      code: 'db.reviews.aggregate([\n  { $group: { _id: "$user", reviewCount: { $sum: 1 }, avgScore: { $avg: "$score" } } }\n]);',
      options: [
        "It filters documents before processing",
        "It groups documents by a field and allows aggregate computations (like SQL's GROUP BY)",
        "It sorts documents into categories",
        "It creates sub-collections"
      ],
      answer: 1,
      explanation: "$group is the MongoDB equivalent of SQL's GROUP BY. The _id field specifies the grouping key. $sum: 1 counts documents (like COUNT(*)), $avg computes averages."
    },
    {
      q: "When should you embed vs. reference in MongoDB document design?",
      options: [
        "Always embed — MongoDB doesn't support references",
        "Always reference — embedding causes data inconsistency",
        "Embed for bounded, frequently co-accessed data; reference for unbounded or independently accessed data",
        "Embed only arrays; reference only objects"
      ],
      answer: 2,
      explanation: "Embed when: data is bounded (e.g., max 8 cast members), read together often, and won't grow indefinitely. Reference when: data is unbounded (e.g., reviews), large, or accessed independently."
    },
    {
      q: "Why are reviews typically stored in a separate collection rather than embedded in movies?",
      options: [
        "MongoDB doesn't support arrays of objects",
        "Reviews are unbounded — a movie can have thousands, growing the document beyond the 16MB limit",
        "Reviews need different indexes",
        "Separate collections are always faster"
      ],
      answer: 1,
      explanation: "Reviews are unbounded (potentially thousands per movie) and would grow the movie document indefinitely, eventually hitting MongoDB's 16MB document size limit. Separate collection allows independent scaling."
    },
    {
      q: "What does the $ positional operator do in MongoDB updates?",
      code: 'db.coll.updateOne(\n  { languages: "en" },\n  { $set: { "languages.$": "jp" } }\n);',
      options: [
        "Updates all matching array elements",
        "Updates only the first matching array element",
        "Removes the matching element",
        "Appends a new element after the match"
      ],
      answer: 1,
      explanation: "The $ positional operator updates the FIRST element that matches the query condition. $[] updates ALL elements. $[identifier] with arrayFilters updates all elements matching a filter condition."
    },
    {
      q: "What is the difference between $[] and $[<identifier>] positional operators?",
      options: [
        "$[] updates all elements; $[x] updates elements matching the arrayFilters condition",
        "$[] updates the first element; $[x] updates all elements",
        "They are identical",
        "$[] is for arrays; $[x] is for objects"
      ],
      answer: 0,
      explanation: "$[] modifies EVERY element in the array. $[identifier] (e.g., $[lang]) modifies only elements matching the arrayFilters specification (e.g., { arrayFilters: [{ lang: 'en' }] })."
    },
    {
      q: "What is the purpose of a shard key in MongoDB?",
      code: 'sh.shardCollection("movie-db.viewings", { userId: "hashed" });',
      options: [
        "It encrypts the collection",
        "It determines how data is distributed across shards for horizontal scaling",
        "It creates a backup of the collection",
        "It enables text search"
      ],
      answer: 1,
      explanation: "A shard key determines how MongoDB distributes documents across shards. 'hashed' shard keys provide even distribution. Choose a shard key from a field that has high cardinality and is frequently queried."
    },
    {
      q: "Why is 'hashed' a good shard key strategy for a viewings collection with userId?",
      options: [
        "Because hashing is faster than range-based sharding",
        "Because it distributes writes evenly across shards, preventing hotspots",
        "Because it enables sorted queries on userId",
        "Because MongoDB requires hashed shard keys"
      ],
      answer: 1,
      explanation: "Hashed sharding distributes data evenly by hashing the shard key value. This prevents 'hot shards' where one shard receives disproportionate writes. However, it doesn't support efficient range queries on the shard key."
    },
    {
      q: "What design pattern is used here to handle unbounded comments with pagination?",
      code: '{\n  docType: "commentsBucket",\n  movieId: ObjectId("..."),\n  sceneKey: "00:42:10-00:45:05",\n  bucket: 37,\n  comments: [...]\n}',
      options: [
        "Sharding pattern",
        "Bucket pattern — comments are split into numbered pages/buckets within documents",
        "Outlier pattern",
        "Polymorphic pattern"
      ],
      answer: 1,
      explanation: "The bucket pattern groups unbounded data (comments) into fixed-size 'bucket' documents. Each bucket has a number and contains a batch of comments, enabling pagination without scanning all comments."
    },
    {
      q: "What is a snapshot field in MongoDB design?",
      code: 'movieSnapshot: { title: "Midnight Aurora", year: 2024, posterUrl: "https://..." }',
      options: [
        "A field that triggers automatic backups",
        "A denormalized copy of frequently-read data to avoid joins at read time",
        "A versioned field that tracks all changes",
        "A field that stores the document creation timestamp"
      ],
      answer: 1,
      explanation: "A snapshot is a denormalized copy of data from another collection (e.g., movie title/poster in viewings). It makes reads fast (no join needed) at the cost of potential staleness and update complexity."
    },
    {
      q: "What does countDocuments() do in MongoDB?",
      code: "db.movies.countDocuments({ runtimeMins: { $gt: 150 } });",
      options: [
        "Returns the total number of documents in the collection",
        "Returns the count of documents matching the filter",
        "Returns the document at the specified index",
        "Returns the size in bytes of matching documents"
      ],
      answer: 1,
      explanation: "countDocuments() takes a filter document (same as find()) and returns the number of matching documents. With an empty filter {}, it counts all documents."
    },
    {
      q: "How do you add a nested field to an existing document?",
      code: 'db.movies.updateOne(\n  { title: "Oppenheimer" },\n  { $set: { "awards.oscars": 7 } }\n);',
      options: [
        "This creates a nested object { awards: { oscars: 7 } } inside the document",
        "This fails — you must create the parent object first",
        "This creates a flat field named 'awards.oscars'",
        "This only works if awards already exists"
      ],
      answer: 0,
      explanation: "$set with dot notation creates nested structures automatically. If awards doesn't exist, MongoDB creates it as an object with the oscars field set to 7."
    },
    {
      q: "What index type would you create for fast text search on a person's name in MongoDB?",
      options: [
        "Compound index on name and _id",
        "A text index: db.people.createIndex({ name: 'text' })",
        "A hashed index: db.people.createIndex({ name: 'hashed' })",
        "A 2dsphere index"
      ],
      answer: 1,
      explanation: "MongoDB's text index supports full-text search capabilities including stemming and text score ranking. It's created with { fieldName: 'text' } and queried with $text operator."
    },
  ],

  /* ══════════════════════════════════════════════════════
     OTHERS (Vectors, DB Design, Docker, General NoSQL)
     ══════════════════════════════════════════════════════ */
  others: [
    {
      q: "What does the pgvector extension provide in PostgreSQL?",
      options: [
        "Graph database capabilities",
        "Vector data type and similarity search operators for ML embeddings",
        "Real-time streaming of database changes",
        "Distributed table partitioning"
      ],
      answer: 1,
      explanation: "pgvector adds the VECTOR data type and distance operators (<->, <=>, <#>) to PostgreSQL, enabling storage and similarity search over embedding vectors directly in SQL."
    },
    {
      q: "What is HNSW and when is it used with pgvector?",
      options: [
        "A hash function for unique IDs",
        "An approximate nearest-neighbor index for fast vector similarity search",
        "A data compression algorithm",
        "A replication strategy"
      ],
      answer: 1,
      explanation: "HNSW (Hierarchical Navigable Small World) is an approximate nearest-neighbor (ANN) index. It speeds up vector similarity queries significantly but may return approximate (not exact) results."
    },
    {
      q: "How can you measure the 'coherence' of a group of semantically similar words using SQL?",
      options: [
        "Count the number of words in the group",
        "Compute the average cosine distance from each word's vector to the group's centroid (average vector)",
        "Sort the words alphabetically and check for patterns",
        "Use GROUP BY on the word length"
      ],
      answer: 1,
      explanation: "Coherence can be measured by: 1) Computing the centroid (AVG of all vectors), 2) Measuring average distance from each word to the centroid. Lower average distance = more coherent/tight group."
    },
    {
      q: "What is the key difference between SQL (relational) and NoSQL database design?",
      options: [
        "SQL databases don't support indexes",
        "NoSQL design is typically query-driven (design around access patterns), while SQL design is entity-driven (normalize based on relationships)",
        "NoSQL databases don't support writes",
        "SQL databases can't store JSON"
      ],
      answer: 1,
      explanation: "In relational design, you normalize entities and relationships. In NoSQL (especially Cassandra), you start with the queries/access patterns and design tables to serve them efficiently, even if it means data duplication."
    },
    {
      q: "What is denormalization and why is it common in NoSQL databases?",
      options: [
        "Removing all indexes for faster writes",
        "Storing the same data in multiple places to optimize read performance at the cost of write complexity",
        "Converting all data to strings",
        "Splitting a table into multiple smaller tables"
      ],
      answer: 1,
      explanation: "Denormalization duplicates data across tables/documents to avoid expensive joins or multi-table lookups at read time. It's a core design principle in Cassandra and is called 'controlled duplication' in MongoDB."
    },
    {
      q: "What is the CAP theorem?",
      options: [
        "Every database can guarantee Consistency, Availability, and Partition tolerance simultaneously",
        "A distributed system can provide at most two of three guarantees: Consistency, Availability, and Partition tolerance",
        "A design principle about capping the number of tables",
        "A method for calculating query performance"
      ],
      answer: 1,
      explanation: "The CAP theorem states that during a network partition, a distributed system must choose between consistency (all nodes see the same data) and availability (every request gets a response). You can't have all three."
    },
    {
      q: "Where does Cassandra fall in the CAP theorem?",
      options: [
        "CP — Consistent and Partition-tolerant",
        "AP — Available and Partition-tolerant (eventually consistent)",
        "CA — Consistent and Available",
        "It provides all three (CAP)"
      ],
      answer: 1,
      explanation: "Cassandra prioritizes Availability and Partition tolerance (AP). It uses eventual consistency — after a write, all replicas will eventually converge to the same state, but reads might temporarily see stale data."
    },
    {
      q: "What command starts Docker containers defined in a compose file in the background?",
      options: [
        "docker compose start -d",
        "docker compose up -d",
        "docker run -d compose",
        "docker container create -d"
      ],
      answer: 1,
      explanation: "'docker compose up -d' creates and starts containers defined in docker-compose.yml. The -d flag runs them in detached (background) mode. 'docker compose up' without -d shows logs in the foreground."
    },
    {
      q: "How do you connect to the PostgreSQL shell inside a Docker container?",
      options: [
        "docker run postgres_lab psql",
        "docker exec -it postgres_lab psql -U student -d labdb",
        "docker connect postgres_lab",
        "psql -h docker -U student"
      ],
      answer: 1,
      explanation: "'docker exec -it' runs a command inside a running container interactively (-i) with a terminal (-t). Here it launches psql with the student user connected to the labdb database."
    },
    {
      q: "What happens to database data when you 'docker stop' a container?",
      options: [
        "All data is permanently deleted",
        "Data persists — stopping doesn't remove the container or its volumes",
        "Data is exported to a backup file",
        "Data is moved to the host filesystem"
      ],
      answer: 1,
      explanation: "'docker stop' gracefully stops the container but preserves its filesystem and volumes. Data persists. To remove a container and its data, use 'docker rm' (or 'docker compose down -v' for volumes)."
    },
    {
      q: "In NoSQL database design, what does 'embed for bounded, reference for unbounded' mean?",
      options: [
        "Use embedding only for numbers, references for text",
        "Embed data that has a known maximum size (e.g., max 10 genres); reference data that can grow indefinitely (e.g., reviews)",
        "Embed primary keys, reference foreign keys",
        "This rule only applies to Cassandra"
      ],
      answer: 1,
      explanation: "Bounded data (e.g., top 8 cast members, max 10 genres) is safe to embed because the document won't grow indefinitely. Unbounded data (e.g., user reviews, comments) should be in separate collections/tables."
    },
    {
      q: "What is the 'bucket pattern' in document database design?",
      options: [
        "Storing all documents in a single collection",
        "Grouping related items into numbered batches/pages within documents for efficient pagination",
        "Using bucket sort on query results",
        "Distributing documents across multiple databases"
      ],
      answer: 1,
      explanation: "The bucket pattern groups unbounded data into numbered documents (buckets). Each bucket has a fixed capacity. This enables efficient pagination and prevents any single document from growing too large."
    },
    {
      q: "What is the advantage of 'query-driven design' over 'entity-driven design' for wide-column databases?",
      options: [
        "It produces fewer tables",
        "Each table is optimized for specific access patterns, making queries fast without full table scans",
        "It avoids any data duplication",
        "It's easier to modify the schema later"
      ],
      answer: 1,
      explanation: "Query-driven design ensures every read can be served from a single partition lookup. The trade-off is data duplication across tables and more complex writes, but reads are extremely fast and scalable."
    },
    {
      q: "What is the purpose of a 'proof of concept' (POC) application for a database course?",
      options: [
        "To build a production-ready application",
        "To demonstrate that a software application can communicate with the database (reads and writes)",
        "To test Docker container performance",
        "To design the database schema"
      ],
      answer: 1,
      explanation: "A POC demonstrates basic connectivity: that an application (e.g., Python CLI) can connect to the database, execute reads (e.g., search movies), and perform writes (e.g., add a movie)."
    },
    {
      q: "In the Cassandra design exercise, what's considered an 'excellent' number of tables for the Movie Explorer app?",
      options: [
        "11+ tables",
        "10-8 tables",
        "6-7 tables",
        "5 tables"
      ],
      answer: 3,
      explanation: "5 tables is 'excellent', 6-7 is 'good', 8-10 has room for improvement, 11+ is poorly designed. Fewer tables (with clever partitioning and wide rows) indicate mastery of wide-column design tricks."
    },
    {
      q: "Why might you use uuid() or ObjectId() instead of sequential integer IDs in distributed databases?",
      options: [
        "They are shorter and easier to remember",
        "They can be generated without coordination between nodes, avoiding bottlenecks",
        "They sort better than integers",
        "They are required by all NoSQL databases"
      ],
      answer: 1,
      explanation: "UUIDs/ObjectIds are globally unique 128-bit values that any node can generate independently without checking a central counter. This is crucial in distributed systems where nodes may not be able to communicate."
    },
    {
      q: "What is the difference between <-> and <=> operators in pgvector?",
      options: [
        "<-> is Euclidean distance; <=> is cosine distance",
        "They are the same operator",
        "<-> is for text; <=> is for numbers",
        "<-> is cosine distance; <=> is Euclidean distance"
      ],
      answer: 0,
      explanation: "<-> computes Euclidean (L2) distance — sensitive to vector magnitude. <=> computes cosine distance — measures angle between vectors, ignoring magnitude. Use cosine for semantic similarity where magnitude doesn't matter."
    },
    {
      q: "In MongoDB design, what is 'controlled duplication'?",
      options: [
        "Automatically replicating all collections",
        "Intentionally storing copies of frequently-accessed data in multiple documents to speed up reads",
        "Using multiple MongoDB instances",
        "Duplicating indexes across collections"
      ],
      answer: 1,
      explanation: "Controlled duplication means deliberately denormalizing — e.g., storing a movie's title and poster in both the movies collection and viewings collection. Reads are fast (no join), but updates need to touch multiple places."
    },
    {
      q: "What are the three database systems covered in this course?",
      options: [
        "MySQL, Redis, Neo4j",
        "PostgreSQL (with extensions), Cassandra, MongoDB",
        "Oracle, DynamoDB, Firebase",
        "SQLite, CouchDB, HBase"
      ],
      answer: 1,
      explanation: "The course covers PostgreSQL (relational with NoSQL extensions like JSONB, HSTORE, pgvector), Apache Cassandra (wide-column), and MongoDB (document database)."
    },
    {
      q: "Why is the exam closed-book with multiple-choice questions?",
      options: [
        "Because the answers are easy to look up",
        "To test conceptual understanding and design reasoning that you internalized through exercises",
        "Because the course has no exercises",
        "To test memorization of exact syntax"
      ],
      answer: 1,
      explanation: "A closed-book multiple-choice exam tests whether you understood the concepts (when to embed vs reference, primary key design, query patterns). You need 50% to pass, and it covers all lectures and exercises."
    },
    {
      q: "Is NewSQL a new query standard for NoSQL databases?",
      options: [
        "Yes — NewSQL replaces SQL with a new query language designed for NoSQL",
        "No — NewSQL refers to modern relational databases that aim to provide NoSQL-like scalability while keeping SQL and ACID guarantees",
        "Yes — NewSQL is the official successor to SQL standardized by ISO",
        "No — NewSQL is a JavaScript-based query language for MongoDB"
      ],
      answer: 1,
      explanation: "NewSQL is NOT a new query language. It refers to a category of modern relational databases (e.g., Google Spanner, CockroachDB, VoltDB) that offer horizontal scalability like NoSQL systems while maintaining full SQL support and ACID transactions."
    },
    {
      q: "What is a quorum in the context of distributed databases?",
      options: [
        "A type of database index for fast lookups",
        "The minimum number of nodes that must agree on a read or write operation for it to be considered successful",
        "A query language used by Cassandra",
        "A method of compressing data across nodes"
      ],
      answer: 1,
      explanation: "Quorum (from Latin 'quōrum' — 'of whom') is the minimum number of replica nodes that must respond to a read/write for it to succeed. In Cassandra, QUORUM = (replication_factor / 2) + 1. It balances consistency and availability."
    },
    {
      q: "In Cassandra with a replication factor of 3, what does consistency level QUORUM mean?",
      options: [
        "All 3 replicas must respond",
        "At least 2 out of 3 replicas must acknowledge the operation",
        "Only 1 replica needs to respond",
        "The coordinator node decides without consulting replicas"
      ],
      answer: 1,
      explanation: "QUORUM = floor(RF/2) + 1. With RF=3, that's floor(3/2)+1 = 2. So at least 2 of 3 replicas must acknowledge a write (or respond to a read) for it to succeed. This provides strong consistency with some fault tolerance."
    },
    {
      q: "What consistency guarantee do you get if both reads and writes use QUORUM with RF=3?",
      options: [
        "Eventual consistency only",
        "Strong (linearizable) consistency — reads always see the latest write",
        "No consistency guarantees at all",
        "Consistency only if all nodes are online"
      ],
      answer: 1,
      explanation: "When W + R > RF (where W=write replicas, R=read replicas, RF=replication factor), reads and writes overlap on at least one node, guaranteeing strong consistency. QUORUM(2) + QUORUM(2) = 4 > 3 = RF."
    },
    {
      q: "What is horizontal scaling (scaling out)?",
      options: [
        "Adding more CPU and RAM to a single server",
        "Adding more servers/nodes to distribute the load",
        "Increasing the disk size on the primary server",
        "Upgrading the database software version"
      ],
      answer: 1,
      explanation: "Horizontal scaling (scaling out) means adding more machines to the system. NoSQL databases like Cassandra and MongoDB are designed for this. Vertical scaling (scaling up) means adding more resources to a single machine."
    },
    {
      q: "What is sharding in the context of databases?",
      options: [
        "Creating read replicas for fault tolerance",
        "Splitting and distributing data across multiple servers, each holding a subset of the data",
        "Encrypting data at rest",
        "Creating backup copies of the database"
      ],
      answer: 1,
      explanation: "Sharding partitions data across multiple servers (shards). Each shard holds a portion of the total dataset. This enables horizontal scaling — both storage and throughput grow as you add shards."
    },
    {
      q: "What is the difference between sharding and replication?",
      options: [
        "They are the same thing",
        "Sharding splits data across nodes (each holds different data); replication copies the same data across nodes (each holds the same data)",
        "Sharding is for reads; replication is for writes",
        "Sharding is a MongoDB feature; replication is a Cassandra feature"
      ],
      answer: 1,
      explanation: "Sharding distributes different partitions of data across nodes for scalability. Replication copies the same data to multiple nodes for fault tolerance and read performance. Most production systems use both."
    },
    {
      q: "How does MongoDB determine which shard stores a document?",
      options: [
        "Documents are randomly assigned to shards",
        "Based on the shard key — MongoDB uses it to route documents to the correct shard",
        "The application chooses the shard manually",
        "All documents go to the primary shard first, then are redistributed"
      ],
      answer: 1,
      explanation: "MongoDB uses the shard key to determine document placement. With ranged sharding, ranges of shard key values map to specific shards. With hashed sharding, the key is hashed for even distribution."
    },
    {
      q: "What is the trade-off of using consistency level ONE vs QUORUM in Cassandra?",
      options: [
        "ONE is slower but more consistent",
        "ONE is faster and more available but risks reading stale data; QUORUM is slower but provides stronger consistency",
        "There is no difference in practice",
        "QUORUM is faster because it parallelizes reads"
      ],
      answer: 1,
      explanation: "Consistency level ONE only waits for one replica — fast and available even if other nodes are down, but may return stale data. QUORUM waits for majority agreement — slower and less available during failures, but more consistent."
    },
    {
      q: "What does 'eventual consistency' mean?",
      options: [
        "Data is always consistent across all nodes",
        "If no new updates are made, all replicas will eventually converge to the same value",
        "Consistency is guaranteed only during business hours",
        "Data is never consistent across nodes"
      ],
      answer: 1,
      explanation: "Eventual consistency means that given enough time without new writes, all replicas will converge to the same state. Reads may temporarily return stale data. This is the trade-off Cassandra makes for high availability (AP in CAP)."
    },
    {
      q: "What is the purpose of a consistent hash ring in distributed databases?",
      options: [
        "To encrypt data during transmission",
        "To distribute data evenly across nodes and minimize data movement when nodes join or leave",
        "To sort query results in a consistent order",
        "To ensure all nodes have identical data"
      ],
      answer: 1,
      explanation: "A consistent hash ring maps both data (partition keys) and nodes to positions on a ring. Each node owns a range. When a node joins/leaves, only data in its range needs to move — minimizing disruption."
    },
    {
      q: "Which of the following is NOT a characteristic of NoSQL databases?",
      options: [
        "Horizontal scalability",
        "Schema flexibility",
        "Strong ACID transactions across all operations by default",
        "Designed for specific access patterns"
      ],
      answer: 2,
      explanation: "Most NoSQL databases trade strict ACID transactions for scalability and availability. Some support transactions within limited scopes (e.g., MongoDB's multi-document transactions), but it's not the default design philosophy."
    },
    {
      q: "What are the main categories of NoSQL databases?",
      options: [
        "Relational, object-oriented, flat-file",
        "Key-value, document, wide-column, graph",
        "SQL, NoSQL, NewSQL only",
        "JSON, XML, CSV"
      ],
      answer: 1,
      explanation: "The four main NoSQL categories are: Key-value (Redis, DynamoDB), Document (MongoDB, CouchDB), Wide-column (Cassandra, HBase), and Graph (Neo4j). Each is optimized for different data models and access patterns."
    },
    {
      q: "What does ACID stand for in database transactions?",
      options: [
        "Asynchronous, Concurrent, Isolated, Distributed",
        "Atomicity, Consistency, Isolation, Durability",
        "Availability, Consistency, Integrity, Durability",
        "Atomic, Columnar, Indexed, Distributed"
      ],
      answer: 1,
      explanation: "ACID: Atomicity (all or nothing), Consistency (valid state transitions), Isolation (concurrent transactions don't interfere), Durability (committed data survives crashes). Traditional SQL databases guarantee ACID."
    },
    {
      q: "What does BASE stand for, and how does it relate to NoSQL?",
      options: [
        "Basic Availability, Soft-state, Eventual consistency — the NoSQL alternative to ACID",
        "Binary, Asynchronous, Secure, Encrypted",
        "Backup, Archive, Sync, Export",
        "BASE is not a real database concept"
      ],
      answer: 0,
      explanation: "BASE: Basically Available (system always responds), Soft-state (state may change over time without input due to replication), Eventually consistent. It's the opposite philosophy to ACID, favoring availability over strict consistency."
    },
    {
      q: "What is a range query and why are they important for partition key design?",
      options: [
        "A query that selects rows within a range of values — efficient on clustering columns but not on partition keys in Cassandra",
        "A query that counts the total number of rows",
        "A query that returns random samples",
        "A query that spans multiple keyspaces"
      ],
      answer: 0,
      explanation: "Range queries (e.g., WHERE year >= 2020 AND year <= 2025) are efficient on clustering columns because data is sorted within a partition. On partition keys, they would require scanning all nodes, which is why ALLOW FILTERING exists (but shouldn't be used)."
    },
    {
      q: "What is the key difference between k-Nearest Neighbor (k-NN) and Approximate Nearest Neighbor (ANN)?",
      options: [
        "k-NN returns exact results by scanning all vectors (brute-force), while ANN uses index structures to return approximate results much faster",
        "ANN always returns more accurate results than k-NN",
        "k-NN only works with 2-dimensional data, while ANN works with any dimension",
        "There is no difference — they are the same algorithm"
      ],
      answer: 0,
      explanation: "k-NN (exact) compares the query vector against every vector in the dataset — guaranteed correct but O(n) and slow for large datasets. ANN (approximate) uses index structures like HNSW or IVFFlat to find results much faster, trading a small amount of accuracy for massive speed gains."
    },
    {
      q: "Why might you prefer ANN over exact k-NN for similarity search?",
      options: [
        "ANN always gives perfectly accurate results",
        "ANN is dramatically faster for large datasets because it avoids scanning every vector, at the cost of slightly less accurate results",
        "k-NN cannot handle vector data",
        "ANN uses less storage space than k-NN"
      ],
      answer: 1,
      explanation: "Exact k-NN requires comparing against all N vectors (O(n)). For millions of high-dimensional vectors, this is prohibitively slow. ANN indexes like HNSW reduce search to O(log n) with results that are usually 95-99% as accurate — a very worthwhile trade-off."
    },
    {
      q: "Which pgvector index types provide Approximate Nearest Neighbor (ANN) search?",
      options: [
        "B-tree and GIN",
        "HNSW and IVFFlat",
        "Hash and GiST",
        "BRIN and SP-GiST"
      ],
      answer: 1,
      explanation: "pgvector supports two ANN index types: HNSW (Hierarchical Navigable Small World) — a graph-based index with excellent recall, and IVFFlat (Inverted File with Flat quantization) — a clustering-based index that partitions vectors into lists. Both trade exact accuracy for speed."
    },
    {
      q: "How does HNSW (Hierarchical Navigable Small World) index work conceptually?",
      options: [
        "It hashes all vectors into buckets based on their values",
        "It builds a multi-layer graph where upper layers have long-range connections for fast navigation and lower layers have short-range connections for precision",
        "It sorts vectors alphabetically and uses binary search",
        "It compresses vectors into single scalar values"
      ],
      answer: 1,
      explanation: "HNSW builds a hierarchy of proximity graphs. The top layers contain fewer nodes with long-range connections (for quickly narrowing down the search area), while lower layers have more nodes with short-range connections (for fine-grained, precise nearest-neighbor results)."
    },
    {
      q: "How does IVFFlat index differ from HNSW for vector similarity search?",
      options: [
        "IVFFlat is always faster than HNSW",
        "IVFFlat partitions vectors into clusters (inverted lists) and searches only the nearest clusters, while HNSW uses a navigable graph structure",
        "IVFFlat gives exact results while HNSW gives approximate results",
        "IVFFlat only supports cosine similarity"
      ],
      answer: 1,
      explanation: "IVFFlat clusters vectors into N lists using k-means. At query time, it only searches the closest 'probes' lists instead of all vectors. HNSW navigates a multi-layer graph. IVFFlat is faster to build but typically has lower recall than HNSW. Both are ANN methods."
    },
    {
      q: "In pgvector, what happens if you run a similarity search WITHOUT an ANN index?",
      options: [
        "The query fails with an error",
        "PostgreSQL performs an exact k-NN search using a sequential scan — accurate but slow for large tables",
        "PostgreSQL automatically creates a temporary index",
        "The query returns random results"
      ],
      answer: 1,
      explanation: "Without an ANN index, PostgreSQL falls back to a sequential scan, computing the distance between the query vector and every row in the table. This is exact k-NN — it guarantees correct results but is O(n) and becomes very slow as the table grows."
    },
    {
      q: "What do the pgvector operators <->, <=>, and <#> represent?",
      options: [
        "<-> is L2 (Euclidean) distance, <=> is cosine distance, <#> is inner product distance",
        "They all measure the same distance",
        "<-> is greater than, <=> is equal, <#> is less than",
        "They are comparison operators for strings"
      ],
      answer: 0,
      explanation: "pgvector provides three distance operators: <-> (L2/Euclidean distance), <=> (cosine distance), and <#> (negative inner product). Each has corresponding index operator classes: vector_l2_ops, vector_cosine_ops, vector_ip_ops."
    },
    {
      q: "Why does PostgreSQL sometimes ignore an HNSW index and use a sequential scan instead?",
      options: [
        "HNSW indexes are always ignored",
        "The query planner's cost-based optimizer may determine a sequential scan is cheaper for small tables, since index traversal has overhead",
        "Sequential scans return better results than HNSW",
        "HNSW can only be used with SELECT *"
      ],
      answer: 1,
      explanation: "PostgreSQL's cost-based query planner compares the estimated cost of using the index vs. a sequential scan. For small tables (like the 10,000-word glove_small), a sequential scan can be cheaper because it avoids index lookup overhead. Running ANALYZE helps the planner make better decisions."
    },
  ]
};
