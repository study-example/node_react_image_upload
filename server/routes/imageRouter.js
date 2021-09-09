const { Router } = require("express");
const imageRouter = Router();
const Image = require("../models/Image");
const { upload } = require("../middleware/imageUpload");
const fs = require("fs");
const { promisify } = require("util"); // 비동기함수를 promise 형태의 평션으로 변환을 지원한다.
const mongoose = require("mongoose");

const fileUnlink = promisify(fs.unlink); // 해당 메소드에 콜백을 넘기는 대신에 await를 사용할수 있게 된다?

//라우터에 upload 미들웨어를 추가하면 해당 키값(imageTest)의 파일정보를 위에서 dest로 설정한 폴더 경로에 저장한다. ( 한개 파일 업로드)
//또한 자동으로 req.file에 추출한 이미지 정보를 적재한다.
//upload.array : 다중파일 업로더, 최대 5개
imageRouter.post("/", upload.array("image", 100), async (req, res) => {
  //유저정보, public 유무 확인
  try {
    if (!req.user) throw new Error("권한이 없습니다.");
    const images = await Promise.all(
      req.files.map(async (file) => {
        const image = await new Image({
          //string 형태의 id를 objectId타입의 _id에 할당하지만, 몽구스에서 알아서 타입변환하여 처리해준다.
          user: {
            _id: req.user.id,
            name: req.user.name,
            username: req.user.username,
          },
          public: req.body.public,
          key: file.filename,
          originalFileName: file.originalname,
        }).save();

        return image;
      })
    );
    res.json(images);
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: err.message });
  }
});

imageRouter.get("/", async (req, res) => {
  // plublic 한 이미지만 제공

  try {
    const { lastid } = req.query;
    if (lastid && !mongoose.isValidObjectId(lastid))
      throw new Error("invalid lastid");

    const images = await Image.find(
      lastid ? { public: true, _id: { $lt: lastid } } : { public: true }
    )
      .sort({
        _id: -1,
      })
      .limit(30);
    res.json(images);
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: err.message });
  }
});

imageRouter.get("/:imageId", async (req, res) => {
  try {
    const { imageId } = req.params;
    if (!mongoose.isValidObjectId(imageId))
      throw new Error("올바르지 않은 이미지 id 입니다.");

    const image = await Image.findOne({ _id: imageId });
    if (!image) throw new Error("해당 이미지는 존재하지 않습니다.");

    if (!image.public && (!req.user || req.user.id !== image.user.id))
      throw new Error("권한이 없습니다.");

    res.json(image);
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: err.message });
  }
});

imageRouter.delete("/:imageId", async (req, res) => {
  // 유저 권한 확인
  // 사진 삭제
  // 1. upload 폴더에 있는 사진 데이터를 삭제
  // 2. 데이터베이스에 있는 image 문서를 삭제
  try {
    if (!req.user) throw new Error("권한이 없습니다.");
    if (!mongoose.isValidObjectId(req.params.imageId))
      throw new Error("올바르지 않은 이미지 id입니다.");

    // fs.unlink("./test.jpeg", (err) => {});

    const image = await Image.findOneAndDelete({ _id: req.params.imageId });

    if (!image) {
      return res.json({ message: "요청하신 이미지는 이미 삭제 되었습니다." });
    }

    await fileUnlink(`./uploads/${image.key}`);

    res.json({ message: "요청하신 이미지가 삭제 되었습니다.", image });
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: err.message });
  }
});

imageRouter.patch("/:imageId/like", async (req, res) => {
  //유저권한확인
  //like 중복아노디도록 확인
  try {
    if (!req.user) throw new Error("권한이 없습니다.");
    if (!mongoose.isValidObjectId(req.params.imageId))
      throw new Error("올바르지 않은 이미지 아이디 입니다.");

    const image = await Image.findOneAndUpdate(
      { _id: req.params.imageId },
      { $addToSet: { likes: req.user.id } }, // addToSet: 중복값 입력 불가
      { new: true }
    );
    res.json(image);
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: err.message });
  }
});

imageRouter.patch("/:imageId/unlike", async (req, res) => {
  //유저권한확인
  //like 중복 취소 안되도록 확인
  try {
    if (!req.user) throw new Error("권한이 없습니다.");
    if (!mongoose.isValidObjectId(req.params.imageId))
      throw new Error("올바르지 않은 이미지 아이디 입니다.");

    const image = await Image.findOneAndUpdate(
      { _id: req.params.imageId },
      { $pull: { likes: req.user.id } },
      { new: true }
    );
    res.json(image);
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: err.message });
  }
});

module.exports = { imageRouter };
