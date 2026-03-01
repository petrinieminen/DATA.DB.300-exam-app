E1
db.movies.find({ year: 2023 }, { _id: 0, title: 1, year: 1 });

E2
db.movies.find({ genres: "Sci-Fi", runtimeMins: { $lt: 160 } }, { _id: 0, title: 1, runtimeMins: 1, genres: 1 });

E3
db.movies.find({ tags: { $all: ["time", "spy"] } }, { title: 1, tags: 1 });

E4
db.people.find({</code><br><code>  $or: [</code><br><code>    {</code><br><code>      $and: [</code><br><code>        { country: "US" },
        { born: { $gte: 1960, $lte: 1969 } }
      ]
    },
    {</code><br><code>      $and: [</code><br><code>        { country: "UK" },
        { born: { $gte: 1970, $lte: 1979 } }
      ]
    }
  ]
});

Or simplify:

db.people.find({</code><br><code>  $or: [</code><br><code>    { country: "US", born: { $gte: 1960, $lte: 1969 } },
    { country: "UK", born: { $gte: 1970, $lte: 1979 } }
  ]
});

E5
db.movies.countDocuments( { runtimeMins: { $gt: 150 } } );

E6
db.movies.updateOne(
  { title: "Barbie" },
  { $inc: { boxOfficeM: 10 } }
);

E7
db.movies.updateOne(
  { title: "Oppenheimer" },
  { $set: { "awards.oscars": 7 } }
);

E8
db.movies.deleteOne( { _id: 103 } );

E9
db.reviews.deleteMany({ score: { $lte: 7 } });

E10
One document per review:

db.movies.aggregate([
  {</code><br><code>    $lookup: {</code><br><code>      from: "reviews",</code><br><code>      localField: "_id",</code><br><code>      foreignField: "movieId",</code><br><code>      as: "reviews"</code><br><code>    }
  },
  { $unwind: { path: "$reviews", preserveNullAndEmptyArrays: false } },
  {</code><br><code>    $project: {</code><br><code>      _id: 0,</code><br><code>      title: 1,</code><br><code>      reviewText: "$reviews.text"</code><br><code>    }
  },
  { $sort: { title: 1 } }
]);

One document per movie:

db.movies.aggregate([
  {</code><br><code>    $lookup: {</code><br><code>      from: "reviews",</code><br><code>      localField: "_id",        // movies._id</code><br><code>      foreignField: "movieId",  // reviews.movieId</code><br><code>      as: "reviews"</code><br><code>    }
  },
  {</code><br><code>    $project: {</code><br><code>      _id: 0,</code><br><code>      title: 1,</code><br><code>      reviewTexts: {</code><br><code>        $map: {</code><br><code>          input: "$reviews",</code><br><code>          as: "r",</code><br><code>          in: "$$r.text"</code><br><code>        }
      }
    }
  },
  { $sort: { title: 1 } }
]);

E11
db.people.aggregate([
  {</code><br><code>    // Group people by country</code><br><code>    $group: {</code><br><code>      _id: "$country",</code></p> <p><code>      // Average of the "born" field (birth year)</code><br><code>      avgBirthYear: { $avg: "$born" },
      peopleCount: { $sum: 1 }
    }
  },
  {</code><br><code>    // Shape the output</code><br><code>    $project: {</code><br><code>      _id: 0,</code><br><code>      country: "$_id",</code></p> <p><code>      // Round for readability</code><br><code>      avgBirthYear: { $round: ["$avgBirthYear", 1] },
      peopleCount: 1
    }
  },
  {</code><br><code>    $sort: { country: 1 }
  }
]);

