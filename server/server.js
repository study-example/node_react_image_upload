require("dotenv").config();
const express = require("express");
const multer = require("multer"); // 파일 업로드 모듈
const { v4: uuid } = require("uuid"); // 파일 업로드시 새로운 파일명에 사용될 uuid , 내부에 여러개의 버전이 있다.(uuid 타입인듯하다.)
const mime = require("mime-types"); // 업로드된 파일의 확장자를 추출 -> 실제 업로드시 누락되는 확장자를 추가 목적
const mongoose = require("mongoose");
const Image = require("./models/Image");

// multer 설정 ( 업로드 폴더 경로 필수 설정)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "./uploads"), // 업로드 파일 저장경로
  filename: (req, file, cb) =>
    cb(null, `${uuid()}.${mime.extension(file.mimetype)}`), // 업로드 파일 명 : uuid + 원본 파일 확장자
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    //upload 필터: 첫번째 인자 error, 두번째 인자 업로드 허용여부(true, false)
    if (["image/jpeg", "image/png"].includes(file.mimetype)) {
      // 이미지만 업로드 허용
      cb(null, true); // 두번째 인자가 true 이면 저장
    } else {
      cb(new Error("invalid file type."), false); // 두번째 인자가 false 이면 저장거부
    }
  },
  limits: {
    fileSize: 1024 * 1024 * 5, // 5mb 까지 파일 업로드 허용
  },
});

const app = express();
const PORT = 5000;
//console.log(process.env);

mongoose
  .connect(process.env.MONGO_URI, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true,
  })
  .then(() => {
    console.log("MongoDB Connected.");
    app.use("/uploads", express.static("uploads")); // 정적 리소스 폴더 지정

    //라우터에 upload 미들웨어를 추가하면 해당 키값(imageTest)의 파일정보를 위에서 dest로 설정한 폴더 경로에 저장한다. ( 한개 파일 업로드)
    //또한 자동으로 req.file에 추출한 이미지 정보를 적재한다.
    const image = app.post(
      "/images",
      upload.single("image"),
      async (req, res) => {
        await new Image({
          key: req.file.filename,
          originalFileName: req.file.originalname,
        }).save();
        res.json(image);
      }
    );

    app.get("/images", async (req, res) => {
      const images = await Image.find();
      res.json(images);
    });

    app.listen(PORT, () => {
      console.log("Express server listening on Port " + PORT);
    });
  })
  .catch((err) => console.log(err));
