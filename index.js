import express from "express"
import * as dotenv from "dotenv"
dotenv.config()
const app = express()
const PORT= process.env.PORT ||8080;


app.use(express.json())

app.get("/",(req, res) => {
    res.json({ message: "Hello sandy" });
})

app.listen(PORT, ()=>{
    console.log(`Server Runnning on port ${PORT}`);
})