Exercise
Like with Cassandra, this is a single, big exercise on document database design.

Your task is to design and implement a MongoDB database based on the domain description below.

Deliver collections defined by sample JSON inserts.
When you decide between using a reference vs. using embedding, justify the design choice.
Show queries for some of the read and write operations.
Create indices for your key queries.
Select a shard key for the most write-heavy collection.
Domain description

You're designing the database for a movie community app. Users can browse movies, follow lists, log viewings, and discuss scenes. You should choose when to embed and when to reference. Controlled duplication is allowed if it makes key reads fast.

Core entities (conceptual)

Movies
People (cast/crew)
Users
User-created lists
Viewing logs
Scene discussions
You may add helper fields (like denormalized names) to optimize reads.

Planned UI screens & required behaviors
 
Screen A - Home: Trending & New

Shows:

"Trending this week" carousel: poster, title, year, average rating, top 3 genres
"New on streaming" list: title, year, provider badge(s)
Requirements:

One query per widget (no heavy joins)
Fast sort by “trendScoreThisWeek” and filter by availability
Screen B - Movie page

Shows:

Movie header: title, year, poster, runtime, genres
Top-billed cast (first 8): person name + headshot + role
Crew highlights: director(s), writer(s)
"Where to watch" providers
A "More like this" row (10 similar movies)
Requirements:

Movie page should be fetchable with 1–2 queries
Cast for the page is bounded (top-billed only). Full cast is not required.
Screen C - Person page

Shows:

Person header: name, photo, born
"Known for" movies (up to 12): poster + title + year
Requirements:

Person page should be fast without scanning all movies.
Screen D - Lists

Users can create lists like "Best Nordic Noir":

List page: title, description, author, follower count
Movies in the list (up to 200): show poster + title + year, in a custom order
Requirements:

List page should not require looking up 200 movies one-by-one.
Support "follow list" and show follower count.
Screen E - Viewing history

User profile shows:

The last 50 viewings: movie poster + title + date watched + user’s rating + short note
Requirements:

This view should be one query for the last 50 items.
It's okay if movie title/poster are a snapshot. They do not need to be perfectly real-time.
Screen F - Movie-specific scene discussions

Users can discuss scenes for a movie:

Scene list for a movie: scene title + timestamp range + comment count
Scene thread: comments with author name/avatar, nested replies (max depth 2)
Requirements:

Scenes per movie: up to ~60
Comments per scene can be large (thousands over time)
Need pagination for comments
When you are finished with your design, compare it to the example answer. When you see differences in design choices, reflect on which scenarios support your choice, and what scenarios support the choices in the example answer. For example, your solution may presuppose something (higher read/write ratio, more heavily replicated, etc.) the example answer does not.