require("dotenv").config();
const express = require("express");

const mongoose = require("mongoose");

const { imageRouter } = require("./routes/imageRouter");

const app = express();

const { MONGO_URI, PORT } = process.env;
//console.log(process.env);

mongoose
  .connect(MONGO_URI, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true,
  })
  .then(() => {
    console.log("MongoDB Connected.");
    app.use("/uploads", express.static("uploads")); // 정적 리소스 폴더 지정

    app.use("/images", imageRouter);

    app.listen(PORT, () => {
      console.log("Express server listening on Port " + PORT);
    });
  })
  .catch((err) => console.log(err));
