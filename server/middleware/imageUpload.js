const multer = require("multer"); // 파일 업로드 모듈
const { v4: uuid } = require("uuid"); // 파일 업로드시 새로운 파일명에 사용될 uuid , 내부에 여러개의 버전이 있다.(uuid 타입인듯하다.)
const mime = require("mime-types"); // 업로드된 파일의 확장자를 추출 -> 실제 업로드시 누락되는 확장자를 추가 목적

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

module.exports = { upload };
