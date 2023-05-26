const mongoose = require("mongoose");
const colors = require("colors");

const connectDB = async () => {
  try {
    await mongoose.connect('mongodb+srv://roshanxavier24:roshxavier@cluster0.1rjoo.mongodb.net/sample?retryWrites=true&w=majority');
    console.log(`Mongodb connected ${mongoose.connection.host}`.bgGreen.white);
  } catch (error) {
    console.log(`Mongodb Server Issue ${error}`.bgRed.white);
  }
};

module.exports = connectDB;
