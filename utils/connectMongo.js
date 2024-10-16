const mongoose=require('mongoose')
require("dotenv").config();

const mongoAtlasUri= process.env.CONNECTION_STRING;
console.log(mongoAtlasUri)

const connectDB = async () => {
    try {
      const conn = await mongoose.connect(mongoAtlasUri);
      console.log(`MongoDB Connected`);
    } catch (error) {
      console.error(error.message);
      console.log("error message ends here.")
      process.exit(1);
    }
}

module.exports = connectDB;
