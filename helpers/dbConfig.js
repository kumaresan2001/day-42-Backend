const mongoose = require("mongoose");

const { DB_URL } = process.env;

const dbConnect = async () => {
  try {
    await mongoose.connect(DB_URL);
    console.log("Mongodb connection established");
  } catch (error) {
    console.log(error, "Mongodb connection error");
  }
};

module.exports = dbConnect;
