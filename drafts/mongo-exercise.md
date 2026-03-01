Setup
We use MongoDB 8.0 in the course. 

Start your container if it's not running already:

$ docker container start mongo_lab

Connect to your mongosh shell:

$ docker exec -it mongo_lab mongosh

Create a new database by simply switching to it:

mongosh> use movie-db;

Use the insertMany() function to create a new collection and insert new documents. The first insert statement creates the collection:

mongosh> db.people.insertMany([
  { _id: 1, name: "Christopher Nolan", born: 1970, country: "UK" },
  { _id: 2, name: "Greta Gerwig", born: 1983, country: "US" },
  { _id: 3, name: "Leonardo DiCaprio", born: 1974, country: "US" },
  { _id: 4, name: "Margot Robbie", born: 1990, country: "AU" },
  { _id: 5, name: "Ryan Gosling", born: 1980, country: "CA" },
  { _id: 6, name: "Cillian Murphy", born: 1976, country: "IE" },
  { _id: 7, name: "Robert Downey Jr.", born: 1965, country: "US" }
]);

See how insertMany() takes a list of JSON documents as its parameter. We could use MongoDB's ObjectId() function for the _id field, but we will keep it simple for now. ObjectId() is MongoDB's rough equivalent to Cassandra's uuid().

Insert movies:

mongosh> db.movies.insertMany([
  {
    _id: 101,
    title: "Inception",
    year: 2010,
    runtimeMins: 148,
    genres: ["Sci-Fi", "Thriller"],
    directorId: 1,
    castIds: [3],
    languages: ["en", "ja", "fr"],
    rating: { imdb: 8.8, metascore: 74 },
    boxOfficeM: 836.8,
    isReleased: true,
    tags: ["dream", "heist"]
  },
  {
    _id: 102,
    title: "Oppenheimer",
    year: 2023,
    runtimeMins: 180,
    genres: ["Drama", "History"],
    directorId: 1,
    castIds: [6, 7],
    languages: ["en", "de"],
    rating: { imdb: 8.4, metascore: 90 },
    boxOfficeM: 950.0,
    isReleased: true,
    tags: ["biopic", "physics"]
  },
  {
    _id: 103,
    title: "Barbie",
    year: 2023,
    runtimeMins: 114,
    genres: ["Comedy", "Fantasy"],
    directorId: 2,
    castIds: [4, 5],
    languages: ["en"],
    rating: { imdb: 6.9, metascore: 80 },
    boxOfficeM: 1440.0,
    isReleased: true,
    tags: ["satire", "toy"]
  },
  {
    _id: 104,
    title: "Tenet",
    year: 2020,
    runtimeMins: 150,
    genres: ["Action", "Sci-Fi"],
    directorId: 1,
    castIds: [],
    languages: ["en", "ru"],
    rating: { imdb: 7.3, metascore: 69 },
    boxOfficeM: 365.0,
    isReleased: true,
    tags: ["time", "spy"]
  },
  {
    _id: 105,
    title: "Little Women",
    year: 2019,
    runtimeMins: 135,
    genres: ["Drama", "Romance"],
    directorId: 2,
    castIds: [],
    languages: ["en"],
    rating: { imdb: 7.8, metascore: 91 },
    boxOfficeM: 218.0,
    isReleased: true,
    tags: ["classic", "family"]
  },
  {
    _id: 106,
    title: "Dune: Part Two",
    year: 2024,
    runtimeMins: 166,
    genres: ["Sci-Fi", "Adventure"],
    directorId: 999,
    castIds: [],
    languages: ["en"],
    rating: { imdb: 8.6, metascore: 79 },
    boxOfficeM: 700.0,
    isReleased: true,
    tags: ["epic", "desert"]
  }
]);

And reviews:

mongosh> db.reviews.insertMany([
  { _id: "r1", movieId: 101, user: "alice", score: 9,  createdAt: ISODate("2024-01-05"), text: "Mind-bending." },
  { _id: "r2", movieId: 101, user: "bob",   score: 8,  createdAt: ISODate("2024-02-10"), text: "Great but complex." },
  { _id: "r3", movieId: 102, user: "alice", score: 10, createdAt: ISODate("2024-03-01"), text: "Masterpiece." },
  { _id: "r4", movieId: 102, user: "cara",  score: 9,  createdAt: ISODate("2024-03-15"), text: "Incredible performances." },
  { _id: "r5", movieId: 103, user: "bob",   score: 7,  createdAt: ISODate("2024-04-02"), text: "Surprisingly thoughtful." }
]);

Notice where the name of the collection is specified.

Exercises
We will look at some functions, parameters and operators with examples. The exercises are about modifying the examples and understanding the query logic through guided experimentation.

You can find documentation for CRUD operations at

https://www.mongodb.com/docs/v8.0/crud/

Basic find() queries
The most basic query function is find(). The first parameter is a document/documents we are trying to find. In this document, we specify what fields and values we want the result documents to have. The second parameter (optional) is projection (like SQL's SELECT clause).

Find all documents by providing an empty document as the first parameter. This means that we do not have any criteria for the documents we want to retrieve:

db.people.find( { }, { _id: 0, name: 1, born: 1 });

Note that the function returns a list of JSON documents that satisfy the filter document { }. This is equivalent to a SELECT statement without a WHERE clause.

E1: Modify the query so that it retrieves movies released in 2023 (simply define a JSON document as the first parameter with the asked field and value). Also modify the second parameter so that the returned documents contain the movie's title and release year. You can take a look at a JSON document in a collection with a simple query such as

db.people.find().limit(1);

You can use operators such as $lt (less than), $gt, $lte, $gte, $eq and $ne (not equals) for classic comparisons:

db.movies.find({ "rating.imdb": { $gte: 8.5 } }, { title: 1, "rating.imdb": 1 });

Notice how to reference fields in nested documents (rating.imdb).

E2: Modify the query so that it returns movies that are "Scif-Fi" movies and have a runtime shorter than 160 minutes. Return movie titles, runtime, and genres to be sure.

The $in operator works similarly to exercise E2's genre expression, yet when you need to check whether any of the values matches a document's list:

db.movies.find({ genres: { $in: ["Sci-Fi", "Thriller"] } }, { title: 1, genres: 1 });

The $all operator works with lists when you need to ensure that all the parameters are stored in a list.

E3: Modify the query to retrieve movies with all these tags: "time", "spy". Return the tags field instead of genres.

You can also do regex search with $regex, but it can be slow.

You can create more complex expressions with the operators $and and $or (similar to SQL/CQL). Both operators require a list of documents:

db.movies.find( {
  $and: [
    { isReleased: true },
    { boxOfficeM: { $gt : 1000 } }
  ]
});

Notice how the syntax is different to the example with $gte and $in operators above: field: { operator: value } vs { operator: [ {}, {} ] }.

The query above can be reformatted so that $and is not required.

E4: Modify the query above so that it retrieves people born in the US in the 1960s AND people born in the UK in the 1970s.

Sorting and counting
You can use method chaining (like we did before with limit()) for additional tasks on the retrieved documents. For example, sort the results first by rating (descending order) and then by year (descending order):

db.movies
  .find({}, { title: 1, year: 1, "rating.imdb": 1 })
  .sort({ "rating.imdb": -1, year: -1 })
  .limit(3);

Use countDocuments() function to count the number of documents. The first parameter is a JSON document, just like with find().

E5: Count the number of movies with a runtime greater than minutes.

Updates and deletes
You can update documents with updateOne() and updateMany() functions. updateOne() guarantees that at most one document is updated. The first parameter is the filter document (like with find()) determining which document/documents are updated. The second parameter is a document defining how those documents are updated. deleteOne() and deleteMany() work in a similar way with deletions.

You can use $addToSet operator for adding items in sets (lists), unless they are already present. Other useful operators include $set, $pop, $pull, $push and $pushAll.

db.movies.updateOne(
  { title: "Inception" },
  { $addToSet: { tags: "time" } }
);

Note how the operators require a document ({ tags: "time" }).

$set operator adds a new field.

$inc operator increases the value of a field (or decreases when the given value is negative).

E6: Modify the query so that it increases Barbie's box office by 10 (meaning 10 million, as the field's values are stored in millions).

E7: Use one of the operators mentioned above, and use updateOne() function to add a new field to "Oppenheimer". The field's value and key should be awards.oscars: 7

E8: Use the deleteOne() function to delete one movie based on its _id field. The function works similarly to find().

E9: Use the deleteMany() function to delete all reviews with score <= 7. The function works similarly to find().

Positional operators

Positional operators are used for array modifications.

$ modifies the first matching element
$[] modifies every element
$[x] modifies every matching element
Observe how these operators function:

db.positionalA.insertOne({ name: "first",  languages: ["en","ja","en","fr"] });

db.positionalA.updateOne(
  { languages: "en" },
  { $set: { "languages.$": "jp" } }
);

db.positionalB.insertOne({ name: "first",  languages: ["en","ja","en","fr"] });

db.positionalB.updateOne(
  { languages: "en" },
  { $set: { "languages.$[]": "jp" } }
);

db.positionalC.insertOne({ name: "first",  languages: ["en","ja","en","fr"] });

db.positionalC.updateOne(
  { languages: "en" },
  { $set: { "languages.$[lang]": "jp" } },
  { arrayFilters: { lang: "en" } }
);

"Joins"
We can use the aggregate() function to "join" tables by some fields. Let's create a query that shows the director's name for each movie. As the two pieces of information are stored to different collection, we will perform a "join" on movies.directorId = people._id. This will be an equivalent of SQL's OUTER JOIN.

db.movies.aggregate([
  {
    // $lookup performs a left outer join with another collection
    $lookup: {
      // The collection to join with
      from: "people",

      // Field in the current (movies) collection
      // whose value will be used for matching
      localField: "directorId",

      // Field in the "people" collection to match against
      foreignField: "_id",

      // Name of the new array field that will contain
      // the matching people documents
      as: "director"
    }
  },
  {
    // $unwind deconstructs the "director" array
    // and outputs one document per array element
    $unwind: {
      // Path to the array field to unwind
      path: "$director",

      // If true, keep movies even when the "director" array
      // is empty or missing (i.e., no matching person found)
      preserveNullAndEmptyArrays: true
    }
  },
  {
    // $project reshapes each document
    // by selecting, renaming, or computing fields
    $project: {
      // Include the movie title as-is
      title: 1,

      // Include the movie release year as-is
      year: 1,

      // Create a new field "directorName"
      // by pulling the "name" field from the joined director document
      directorName: "$director.name"
    }
  },
  {
    // $sort orders the final result set
    $sort: {
      // Sort by year descending (newest movies first)
      year: -1,

      // For movies with the same year,
      // sort alphabetically by title (ascending)
      title: 1
    }
  }
]);


Because this is an outer join, you should see Dune in the set of returned documents (unless you deleted Dune earlier).

E10: Modify the query in a way that you return movies and their review texts. You may either retrieve a flat list* (every review is it's own document, even if one movie has multiple reviews) which is an easier task, or you can take a look a the documentation to find out which additional operator you need to retrieve a set of documents with less redundancy**.

* (easier):
[
  { title: 'Barbie', reviewText: 'Surprisingly thoughtful.' },
  { title: 'Inception', reviewText: 'Mind-bending.' },
  { title: 'Inception', reviewText: 'Great but complex.' },
  { title: 'Oppenheimer', reviewText: 'Masterpiece.' },
  { title: 'Oppenheimer', reviewText: 'Incredible performances.' }
]

** (needs more modifications):
[
  { title: "Inception", reviewTexts: ["Mind-bending.", "Great but complex."] },
  { title: "Barbie", reviewTexts: ["Surprisingly thoughtful."] },
  { title: "Tenet", reviewTexts: [] }
]

Aggregation pipeline
https://www.mongodb.com/docs/v8.0/core/aggregation-pipeline/

The aggregate() function can also be used for GROUP BY -like queries. For example, a PostgreSQL query like

SELECT user, COUNT(*), SUM(score), ROUND(AVG(score),2)
FROM reviews
GROUP BY 1
ORDER BY 2 DESC, 4 DESC;

Can be written like this:

db.reviews.aggregate([
  {
    // Group reviews by user name
    $group: {
      _id: "$user",

      // Total number of reviews written by the user
      reviewCount: { $sum: 1 },

      // Sum of all review scores by the user
      totalScore: { $sum: "$score" },

      // Average review score by the user
      avgScore: { $avg: "$score" }
    }
  },
  {
    // Shape the output document
    $project: {
      _id: 0,
      user: "$_id",
      reviewCount: 1,
      totalScore: 1,

      // Round the average to 2 decimal places for readability
      avgScore: { $round: ["$avgScore", 2] }
    }
  },
  {
    // Optional: sort users by number of reviews (desc),
    // then by average score (desc)
    $sort: { reviewCount: -1, avgScore: -1 }
  }
]);

Notice the new operators $group (GROUP BY clause), $sum (aggregate functions SUM and COUNT), $avg (aggregate function AVG), $project (SELECT clause), and $round (scalar function ROUND).

E11: Modify the query so that it calculates the average birth year of people by country, and also the number of people born in that country.

We can combine this kind of query logic with "joins". For example, we can count the average review scores for movies using the reviews collection:

db.reviews.aggregate([
  {
    $group: {
      _id: "$movieId",
      reviewCount: { $sum: 1 },
      avgScore: { $avg: "$score" }
    }
  },
  {
    $lookup: {
      from: "movies",
      localField: "_id",
      foreignField: "_id",
      as: "movie"
    }
  },
  { $unwind: "$movie" },
  {
    $project: {
      _id: 0,
      movieTitle: "$movie.title",
      reviewCount: 1,
      avgScore: { $round: ["$avgScore", 2] }
    }
  },
  { $sort: { avgScore: -1 } }
]);

Arbitrary JavaScript
Sometimes it's quick and easy to test application-side logic with the DBMS shell, without needing to create a test application. The mongosh shell allows the execution of arbitrary JavaScript. This can be disabled for production for obvious security reasons.

let docs = [];

for (let i = 1; i <= 100; i++) {
  docs.push({
    index: i,
    name: `Record ${i}`,
    createdAt: new Date()
  });
};

db.testCollection.insertMany(docs);

db.testCollection.find().limit(1);