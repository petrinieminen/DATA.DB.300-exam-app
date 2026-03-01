Create a table for products:


CREATE TABLE products (
    id         SERIAL PRIMARY KEY
  , name       TEXT   NOT NULL
  , category   TEXT   NOT NULL
  , details    JSONB  NOT NULL --for dynamic attributes
  , metadata   HSTORE          --key-value flags
  , tags       TEXT[] NOT NULL --search tags
  , CONSTRAINT tags_not_empty 
      CHECK (array_length(tags, 1) BETWEEN 1 AND 10)
);
Insert values:

-- T-shirt
INSERT INTO products (name, category, details, metadata, tags)
VALUES (
    'Blue T-Shirt'
  , 'clothing'
  , '{
       "size": "L"
     , "color": "blue"
     , "material": "cotton"
     , "gender": "unisex"
     }'::jsonb --type cast is not necessary, but improves readability
  , 'warehouse=>"FR-1",priority=>"normal"'::hstore
  ,  ARRAY['clothing', 'tshirt', 'blue', 'summer']
);

-- Laptop
INSERT INTO products (name, category, details, metadata, tags)
VALUES (
    'Gaming Laptop X15'
  , 'electronics'
  , '{
       "type": "laptop"
     , "cpu_model": "Intel i7-12700H"
     , "storage": "1TB SSD"
     , "gpu": "RTX 4060"
     }'::jsonb
  , 'warehouse=>"FR-2",priority=>"high"'::hstore
  , ARRAY['electronics', 'laptop', 'gaming', 'performance']
);

-- Novel
INSERT INTO products (name, category, details, metadata, tags)
VALUES (
    'Treasure Island'
  , 'book'
  , '{
       "format": "paperback"
     , "author": "Jane Doe"
     , "isbn": "111-1-2345"
     , "page_count": 280
     }'::jsonb
  , 'warehouse=>"DE-1",priority=>"low"'::hstore
  , ARRAY['book', 'novel', 'fiction', 'bestseller']
);
Queries:

Add or modify the laptop's RAM. The merge operator || adds the field if it does not exist, and modifies the value if the field already exists.

UPDATE products
   SET details = details || '{"ram_gb": 16}'::jsonb
 WHERE name = 'Gaming Laptop X15'; --normally updated with PK
Find all at least 16 GB laptops:

SELECT *
  FROM products
 WHERE category = 'electronics'
   AND details->>'type' = 'laptop'
   AND (details->>'ram_gb')::int >= 16;
Find all "high" priority products:

SELECT *
  FROM products
 WHERE metadata -> 'priority' = 'high';
Find all gaming laptops. I will use the containment operator @>:

SELECT *
  FROM products
 WHERE tags @> ARRAY['gaming', 'laptop'];
Change the laptop's RAM and add information on the battery:

UPDATE products
   SET details = details || '{"ram_gb": 32, "battery": "surprisingly good"}'::jsonb
 WHERE name = 'Gaming Laptop X15'; --normally updated with PK
Add a CHECK constraint. One CHECK was implemented already in the CREATE TABLE statement, so I will add another for making sure that all electronics have power usage. Before adding the constraint, I'll make sure that all electronics have power usage:

UPDATE products
   SET details = details || '{"power_usage_W": 80}'::jsonb
 WHERE category = 'electronics'; --for all electronics, as we only have the laptop

ALTER TABLE products
ADD CONSTRAINT electronics_must_have_power_usage
CHECK (
    category <> 'electronics'
    OR (
      details ? 'power_usage_W' 
      AND (details->>'power_usage_W')::int BETWEEN 1 AND 1000 
      AND details->>'power_usage_W' IS NOT NULL
    )
);
Finally, I will create two indices to speed up queries.

-- GIN index on JSONB details (for general key/value queries)
CREATE INDEX idx_products_details_gin
ON products
USING GIN (details);

-- GIN index on tags array (for @> / && queries)
CREATE INDEX idx_products_tags_gin
ON products
USING GIN (tags);
I you're unsure if PostgreSQL utilizes the index (it will not with small datasets), add EXPLAIN ANALYZE in front of your query, e.g., EXPLAIN ANALYZE SELECT * FROM products;

If you don't know how to read the query execution plan, simply search for the name of your index in the plan. If the index name is mentioned (e.g., idx_products_tags_gin), then the index is used.

Note that the query is executed regardless (inserts inserted, deletes deleted...). 