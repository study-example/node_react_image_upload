require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");

const { imageRouter } = require("./routes/imageRouter");
const { userRouter } = require("./routes/userRouter");
const { authenticate } = require("./middleware/authentication");

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

    app.use(express.json()); // request 중 json body가 있으면 req.body에 적재
    app.use(authenticate); // 인증 미들웨어
    app.use("/images", imageRouter);
    app.use("/users", userRouter);

    app.listen(PORT, () => {
      console.log("Express server listening on Port " + PORT);
    });
  })
  .catch((err) => console.log(err));
