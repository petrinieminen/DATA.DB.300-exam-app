his example answer contains six collections.

A collection for movies. Home + Movie page need fast, single document reads. Embed bounded "top-billed cast", crew highlights, providers, and similar movies:

{
  _id: ObjectId("..."),
  title: "Midnight Aurora",
  year: 2024,
  runtimeMin: 118,
  poster: { url: "https://...", palette: ["#111", "#eee"] },
  genres: ["Mystery", "Drama", "Nordic Noir"],

  // For Screen A
  trendScoreThisWeek: 87.3,
  streaming: {
    providers: [
      { providerId: "nfx", name: "Netflix", region: "FI" },
      { providerId: "apv", name: "Prime Video", region: "FI" }
    ],
    updatedAt: ISODate("2026-01-10T10:00:00Z")
  },

  // For Screen B (bounded embed)
  topBilledCast: [
    {
      personId: ObjectId("..."),
      name: "Aino Lahti",          // denormalized for page speed
      headshotUrl: "https://...",
      character: "Detective Sari"
    }
    // up to 8
  ],
  crewHighlights: {
    directors: { personId: ObjectId("..."), name: "J. Korhonen" },
    writers:   { personId: ObjectId("..."), name: "M. Niemi" }
  },

  // For Screen B “More like this” (precomputed)
  similarMovieIds: [
    ObjectId("..."), ObjectId("...") // 10–30 stored, UI shows 10
  ],

  // For sorting/filtering
  avgRating: 8.2,
  ratingCount: 15342,

  createdAt: ISODate("2024-11-01T00:00:00Z"),
  updatedAt: ISODate("2026-01-12T00:00:00Z")
}
Indices to support the common access patterns:

db.movies.createIndex({ trendScoreThisWeek: -1 });

db.movies.createIndex({ "streaming.providers.providerId": 1,
                        "streaming.providers.region": 1 });

db.movies.createIndex({ year: -1 });

The most important queries:

Trending this week:

db.movies.find(
  {},
  { title: 1, year: 1, "poster.url": 1, genres: 1, avgRating: 1, trendScoreThisWeek: 1 }
).sort({ trendScoreThisWeek: -1 }).limit(20)

Update streaming providers:

db.movies.updateOne(
  { _id: ObjectId("...") },
  {
    $set: {
      "streaming.providers": [
        { providerId: "nfx", name: "Netflix", region: "FI" },
        { providerId: "apv", name: "Prime Video", region: "FI" }
      ],
      "streaming.updatedAt": new Date(),
      updatedAt: new Date()
    }
  }
)

A collection for people. This collection provides fast reads without scanning movies. Store "known for" as a bounded embed or an array of IDs (former here).

{
  _id: ObjectId("..."),
  name: "Aino Lahti",
  born: { date: "1986-04-02", country: "FI" },
  photoUrl: "https://...",

  knownFor: [
    { movieId: ObjectId("..."), title: "Midnight Aurora", year: 2024, posterUrl: "https://..." }
    // up to 12–20
  ]
}
One text index for optimized text search:

db.people.createIndex({ name: "text" });

Queries:

When the "known for" is updated, update the whole bounded array:

db.people.updateOne(
  { _id: ObjectId("...") },
  {
    $set: {
      knownFor: [
        { movieId: ObjectId("..."), title: "Midnight Aurora", year: 2024, posterUrl: "https://..." }
        // ...
      ]
    }
  }
)

A very simple collection for users.

{
  _id: ObjectId("..."),
  handle: "nordicNoirFan",
  displayName: "Noir Fan",
  avatarUrl: "https://...",
  createdAt: ISODate("2025-05-01T00:00:00Z"),

  // useful for profile display
  stats: {
    viewingsCount: 432,
    listsCount: 9
  }
}
Index (unique for user handles):

db.people.createIndex({ handle: 1 }, { unique: true });

Queries are very basic.

A collection for the list of movies (lists).

{
  _id: ObjectId("..."),
  ownerUserId: ObjectId("..."),
  title: "Best Nordic Noir",
  description: "Cold cases, colder nights.",
  createdAt: ISODate("2025-12-01T00:00:00Z"),

  // For Screen D
  followerCount: 1840,

  // Up to 200, bounded -> embedding is OK
  items: [
    {
      movieId: ObjectId("..."),
      title: "Midnight Aurora",
      year: 2024,
      posterUrl: "https://...",
      note: "Perfect atmosphere",
      order: 1,
      addedAt: ISODate("2025-12-02T00:00:00Z")
    }
  ]
}
Indices:

db.lists.createIndex({ ownerUserId: 1, createdAt: -1 });

db.lists.createIndex{ followerCount: -1 });

Queries:

Retrieve movie list:

db.lists.findOne(
  { _id: ObjectId("...") },
  { title: 1, description: 1, ownerUserId: 1, followerCount: 1, items: 1, createdAt: 1 }
);

Add a movie to the list:

db.lists.updateOne(
  { _id: ObjectId("...") },
  {
    $push: {
      items: {
        movieId: ObjectId("..."),
        title: "Midnight Aurora",
        year: 2024,
        posterUrl: "https://...",
        note: "Perfect atmosphere",
        order: 37,
        addedAt: new Date()
      }
    }
  }
)

Retrieve "popular" list:

db.lists.find(
  {},
  { title: 1, description: 1, followerCount: 1, ownerUserId: 1 }
).sort({ followerCount: -1 }).limit(20);

For the user's viewing history, a collection called viewings. This is unbounded, as this answer assumes that we want to store all viewing history, and merely show 50 recently watched titles. This is also a heavy-write collection. For these two reasons, a separate collection for viewings. Also, the collection stores snapshots for movie poster/title to avoid joining.

{
  _id: ObjectId("..."),
  userId: ObjectId("..."),
  movieId: ObjectId("..."),

  watchedAt: ISODate("2026-01-14T20:30:00Z"),
  rating: 9,
  note: "Loved the ending twist.",

  // Snapshot for fast profile history
  movieSnapshot: {
    title: "Midnight Aurora",
    year: 2024,
    posterUrl: "https://..."
  }
}
Indices:

For easily retrieving the last 50 watched titles:

db.viewings.createIndex({ userId: 1, watchedAt: -1 });

Shard key:

This might be the most heavy-write collection (even more than the discussion), so let's create a well-distributed shard key:

sh.shardCollection("movie-db.viewings",  { userId: "hashed" });

Queries:

Last 50 viewings:

db.viewings.find(
  { userId: ObjectId("...") },
  { watchedAt: 1, rating: 1, note: 1, movieId: 1, movieSnapshot: 1 }
).sort({ watchedAt: -1 }).limit(50);

Add a viewing:

db.viewings.insertOne({
  userId: ObjectId("..."),
  movieId: ObjectId("..."),
  watchedAt: new Date(),
  rating: 9,
  note: "Loved the ending twist.",
  movieSnapshot: { title: "Midnight Aurora", year: 2024, posterUrl: "https://..." }
});

Finally, a collection for scene_threads. Scenes are bounded (~60/movie) but comments are unbounded. This answer stores comment pages in one collection using a buckets (remember Cassandra tricks?):

{
  _id: ObjectId("..."),
  docType: "commentsBucket",
  movieId: ObjectId("..."),
  sceneKey: "00:42:10-00:45:05",

  // bucket key, e.g. "page number" or time window
  bucket: 37,

  comments: [
    {
      commentId: ObjectId("..."),
      userId: ObjectId("..."),
      authorSnapshot: { handle: "nordicNoirFan", avatarUrl: "https://..." },
      body: "That shot foreshadows the twist.",
      createdAt: ISODate("2026-01-14T10:00:00Z"),

      // Replies embedded (max depth 2)
      replies: [
        {
          replyId: ObjectId("..."),
          userId: ObjectId("..."),
          authorSnapshot: { handle: "cinephile22", avatarUrl: "https://..." },
          body: "Yes! Especially the lighting.",
          createdAt: ISODate("2026-01-14T10:05:00Z")
        }
      ]
    }
  ]
}
Indices:

For retrieving the scene list:

db.scene_threads.createIndex({ movieId: 1, docType: 1, lastActivityAt: -1 };

For retrieving paged comments:

db.scene_threads.createIndex({ movieId: 1, docType: 1, sceneKey: 1, bucket: 1 });

Queries:

Retrieve one comment page:

db.scene_threads.findOne(
  {
    docType: "commentsBucket",
    movieId: ObjectId("..."),
    sceneKey: "00:42:10-00:45:05",
    bucket: 37
  },
  { comments: 1 }
);

Adding a comment to an existing bucket requires magic in the application side:

const movieId = ObjectId("...");
const sceneKey = "00:42:10-00:45:05";
const bucket = 37;

const newComment = {
  commentId: new ObjectId(),
  userId: ObjectId("..."),
  authorSnapshot: { handle: "nordicNoirFan", avatarUrl: "https://..." },
  body: "That shot foreshadows the twist.",
  createdAt: new Date(),
  replies: []
};

// 1) push comment into bucket doc
db.scene_threads.updateOne(
  { docType: "commentsBucket", movieId, sceneKey, bucket },
  { $push: { comments: newComment } },
  { upsert: true }
);

// 2) update thread metadata (count + last activity)
db.scene_threads.updateOne(
  { docType: "thread", movieId, sceneKey },
  { $inc: { commentCount: 1 }, $set: { lastActivityAt: new Date() } },
  { upsert: true }
)