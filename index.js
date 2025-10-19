import express from "express"
import * as dotenv from "dotenv"
import connectDB from "./Db/connect.js";
dotenv.config()
const app = express()
const PORT= process.env.PORT ||8000;


app.use(express.json())

app.get("/",(req, res) => {
    res.json({ message: "Hello sandy" });
})


if (process.env.NODE_ENV !== "vercel") {
  connectDB(process.env.MONGODB_URL);
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server started on PORT: ${PORT}`);
  });
}