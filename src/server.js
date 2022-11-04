const express = require("express");
const app = express();
const { MongoClient } = require("mongodb");
const PORT = process.env.PORT || 8000;

app.use(express.json({ extended: false }));

const withDB = async (operations, res) => {
  try {
    const client = await MongoClient.connect("mongodb://localhost:27017");
    const db = client.db("mernblog"); //db name
    await operations(db);
    client.close();
  } catch (error) {
    res.status(500).json({ message: "error connecting to database", error });
  }
};

app.get("/api/articles/:name", async (req, res) => {
  withDB(async (db) => {
    const articleName = req.params.name;

    const articleInfo = await db
      .collection("articles")
      .findOne({ name: articleName });
    res.status(200).json(articleInfo);
  }, res);
});

//initialize middleware
//need to install body parser

// //test route
app.get("/", (request, response) => {
  response.send("hello world");
});

app.post("/api/articles/:name/add-comments", (req, res) => {
  const { username, text } = req.body;
  const articleName = req.params.name;
  withDB(async (db) => {
    const articleInfo = await db
      .collection("articles")
      .findOne({ name: articleName });
    await db.collection("articles").updateOne(
      { name: articleName },
      {
        $set: {
          comments: articleInfo.comments.concat({ username, text }),
        },
      }
    );
    const updateArticleInfo = await db
      .collection("articles")
      .findOne({ name: articleName });
    res.status(200).json(updateArticleInfo);
  }, res);
});

app.listen(8000, () => {
  console.log(`server started at port ${PORT}`);
});
