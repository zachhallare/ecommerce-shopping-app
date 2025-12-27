const express = require("express");
const app = express();
const mongoose = require("mongoose");

mongoose
    .connect(MONGO_URI)
    .then(() => console.log("DB Connected Successful"))
    .catch((err) => {
        console.log(err);
    });

app.listen(5000, () => {
    console.log("Server is running");
});

