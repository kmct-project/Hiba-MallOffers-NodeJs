const { MongoClient } = require("mongodb");

const state = {
  db: null,
};

module.exports.connect = async function () {
  // const url = "mongodb://localhost:27017";
  // const url = "mongodb://0.0.0.0:27017";
  const url ="mongodb+srv://thevectorcrop:msb.com001@hiba-malloffers-nodejs.h7nzthm.mongodb.net/?retryWrites=true&w=majority";
  const dbname = "Hiba-MallOffers-NodeJs";


  try {
    const client = new MongoClient(url, { useUnifiedTopology: true });
    await client.connect();
    state.db = client.db(dbname);
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
    throw err;
  }
};

module.exports.get = function () {
  if (state.db) {
    return state.db;
  } else {
    throw new Error("Database not connected");
  }
};

