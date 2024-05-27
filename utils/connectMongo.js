const mongoose=require('mongoose')

const mongoAtlasUri="mongodb+srv://sandeep:helloji@cluster0.ufrq1vk.mongodb.net/SSRS?retryWrites=true&w=majority&appName=Cluster0";

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
