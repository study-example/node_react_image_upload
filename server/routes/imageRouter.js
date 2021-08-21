const { Router } = require("express");
const imageRouter = Router();
const Image = require("../models/Image");
const { upload } = require("../middleware/imageUpload");

//라우터에 upload 미들웨어를 추가하면 해당 키값(imageTest)의 파일정보를 위에서 dest로 설정한 폴더 경로에 저장한다. ( 한개 파일 업로드)
//또한 자동으로 req.file에 추출한 이미지 정보를 적재한다.
imageRouter.post("/images", upload.single("image"), async (req, res) => {
  const uploadedImg = await new Image({
    key: req.file.filename,
    originalFileName: req.file.originalname,
  }).save();
  res.json(uploadedImg);
});

imageRouter.get("/images", async (req, res) => {
  const images = await Image.find();
  res.json(images);
});

module.exports = { imageRouter };
