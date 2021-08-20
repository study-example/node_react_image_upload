const mongoose = require("mongoose");

// jpa의 엔티티처럼 스키마를 콩구스를 통해서 정의한다.
const ImageSchema = new mongoose.Schema(
  {
    key: { type: String, required: true },
    originalFileName: { type: String, required: true },
  },
  { timestamps: true }
);

// 위에서 선언한 스키마를 기준으로 모델을 선언한다.
module.exports = mongoose.model("image", ImageSchema);