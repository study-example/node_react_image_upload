const mongoose = require("mongoose");
const User = require("../models/User");

const authenticate = async (req, res, next) => {
  const { sessionid } = req.headers;
  if (!sessionid || !mongoose.isValidObjectId(sessionid)) return next(); // mongoose에서 데이터 생성시 자체적으로 생성하는 _id의 벨리데이션 체크
  const user = await User.findOne({ "sessions._id": sessionid });
  if (!user) return next();
  req.user = user; // 로그인 성공시 req.user에 user 정보 저장
  console.log("로그인된 계정");
  return next();
};

module.exports = { authenticate };
