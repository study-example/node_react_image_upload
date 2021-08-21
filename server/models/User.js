const mongoose = require("mongoose");

const UserSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, require: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("user", UserSchema);
