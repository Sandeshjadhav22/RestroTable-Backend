import mongoose from "mongoose";


const connectDB = (url)=> {
    if (!url) throw new Error("MONGODB_URL missing");
    mongoose
        .connect(url,{autoIndex:true})
        .then(()=> console.log("MongoDb connected"))
        .catch((err)=>console.log(err))
}

export default connectDB;