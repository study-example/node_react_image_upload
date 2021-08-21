const { Router } = require("express");
const userRouter = Router();
const User = require("../models/User");
const { hash } = require("bcryptjs");

userRouter.post("/register", async (req, res) => {
  try {
    if (req.body.password.length < 6) {
      throw new Error("비밀번호를 6자 이상으로 해주세요.");
    }

    if (req.body.username.length < 3) {
      throw new Error("username은 3자 이상으로 해주세요.");
    }

    const hashedPassword = await hash(req.body.password, 10); // 패스워드 암호화
    await new User({
      name: req.body.name,
      username: req.body.username,
      hashedPassword,
    }).save();
    res.json({ message: "user registered" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = { userRouter };
