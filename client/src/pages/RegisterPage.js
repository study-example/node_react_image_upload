import React, { useState, useContext } from "react";
import CustomInput from "../components/CustomInput";
import { toast } from "react-toastify";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

const RegisterPage = () => {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordCheck, setPasswordCheck] = useState("");
  const [me, setMe] = useContext(AuthContext);

  const submitHandler = async (e) => {
    try {
      e.preventDefault();
      if (username.length < 3)
        throw new Error("회원ID가 너무 짧습니다. 3자 이상 필수");
      if (password.length < 6)
        throw new Error("비밀번호가 너무 짧습니다. 6자 이상 필수");
      if (password !== passwordCheck)
        throw new Error("비밀번호가 다릅니다. 확인해주세요.");

      const result = await axios.post("/users/register", {
        name,
        username,
        password,
      });

      setMe({
        userId: result.data.userId,
        sessionId: result.data.sessionId,
        name: result.data.name,
      });
      toast.success("회권가입 성공!");
    } catch (err) {
      console.error(err);
      toast.error(err.message);
    }
  };

  return (
    <div
      style={{
        marginTop: 100,
        maxWidth: 350,
        marginLeft: "auto",
        marginRight: "auto",
      }}
    >
      <h3>회원가입</h3>
      <form onSubmit={submitHandler}>
        <CustomInput label={"이름"} value={name} setValue={setName} />
        <CustomInput label={"회원ID"} value={username} setValue={setUsername} />
        <CustomInput
          label={"비밀번호"}
          value={password}
          setValue={setPassword}
          type={"password"}
        />
        <CustomInput
          label={"비밀번호 확인"}
          value={passwordCheck}
          setValue={setPasswordCheck}
          type={"password"}
        />
        <button type="submit">회원가입</button>
      </form>
    </div>
  );
};

export default RegisterPage;
