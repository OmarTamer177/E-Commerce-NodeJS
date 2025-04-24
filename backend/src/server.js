import express from "express";

const app = express();

const PORT = process.env.PORT;

app.get("/", (req, res) => {
    res.send("<h1>Welcome to our E-Commerce!!</h1>")
})

app.listen(PORT, () => {
    console.log(`Listening to Port ${PORT}...`);
});