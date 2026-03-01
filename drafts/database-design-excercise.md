Exercise
This is a big, single exercise. Use the design principles and tricks you have learned in the lectures.

Your task is to design and implement a Cassandra database based on the business domain description below. The description contains the access patterns and required columns with some hints about their data types. Provide CREATE TABLE statements (with PRIMARY KEYs) as well as SELECT statements as your answers to demonstrate your solution works. The SELECT statements may not use ALLOW FILTERING. Consider using the visual techniques shown in the lectures for helping you in the design.

You can choose to do some operations in the application (i.e., outside Cassandra), but such operations should be used with restraint, and never with potentially large amounts of data.

Domain description
You’re building the data layer for Movie Explorer, a kiosk-style web app for a streaming service.

Screen A: Home: “Trending now”
A carousel shows:

Title + release year
Poster URL
A short "reason": "Because you watched…" or "Top in Finland today"
A badge: Movie or Series
Users can switch the carousel between: Today, This week, This month

Clicking an item opens its details page.

Screen B - Search
A search box supports:

Free-text search by title (prefix matching is enough: "sta" --> "Star Wars", "Stargate")
Optional filters:
type (movie/series)
release year range
"has won awards" toggle
Search results list (paged) shows:

Title, year, type
2-3 genre tags
Average user rating (rounded to 1 decimal)
Sorting options (all must be provided by the database):
Relevance (default)
Newest first
Highest rated
Clicking a result opens the details page.

Screen C - Title details
The details page shows:

Title, year, type
Runtime (if movie) or seasons count (if series)
Genres (all, assume a maximum of 10 genres per title)
Countries of origin
Studio / distributor name
"Also known as" titles (localized titles)
A "Cast" section: top-billed 10 people with roles (actor/director/writer)
A "Where to watch" section (providers + region availability such as Finland: Netflix, Areena)
A "Similar titles" row (10 items)
There’s also a button: "Add to Watchlist".

Screen D - Person page
Clicking a cast member (e.g., actor) opens a person page:

Name
Primary profession (actor/director/etc.)
"Known for" (top 6 titles)
Filmography list (paged) with:
title + year
role
Sorting can be selected from either newest first or oldest first.

Screen E - Watchlist & activity
Each user has:

A watchlist (shows title + year + poster)
Recently viewed (last 50 items), with timestamps
"Rate this title" action (1-10 stars) which updates the average rating displayed elsewhere
Watchlist can be sorted by:

recently added
title A-Z
"Recently viewed" is sorted always newest first.

Supposing that your solution satisfies all the requirements above, for the sake of exercise, let's say that the level of unnecessary redundancy in your database depends on the number of tables:

11+ tables: poorly designed
10-8 tables: there is room for improvement
6-7 tables: good design
5 tables: excellent design
Note that the guidelines above are a teaching constraint, not an optimization goal! Goal here is to consider different wide-column database design tricks, not merely create 1-to-1 tables for each access pattern. Smaller number of tables does not necessarily mean less redundancy.