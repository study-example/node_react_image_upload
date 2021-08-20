import React, { useState } from "react";
import axios from "axios";
import "./UploadForm.css";
import { toast } from "react-toastify";
import ProgressBar from "./ProgressBar";

const UploadForm = () => {
  const defaultFileName = "이미지 파일을 업로드 해주세요.";
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState(defaultFileName);
  const [percent, setPercent] = useState(0); // 이미지 업로드 진행 퍼센트

  const imageSelectHandler = (e) => {
    const imageFile = e.target.files[0];
    setFile(imageFile);
    setFileName(imageFile.name);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("image", file);
    try {
      const res = await axios.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (e) => {
          // 업로드 진행사항을 표시하게 도와주는 axios 옵셤
          console.log(e);
          setPercent(Math.round((100 * e.loaded) / e.total));
        },
      });
      console.log({ res });
      toast.success("이미지 업로드 성공!");
      setTimeout(() => {
        setPercent(0);
        setFileName(defaultFileName);
      }, 3000);
    } catch (err) {
      toast.error(err.message);
      setPercent(0);
      setFileName(defaultFileName);
      console.error(err);
    }
  };

  return (
    <form onSubmit={onSubmit}>
      {/* <label htmlFor="image">{fileName}</label> */}
      <ProgressBar percent={percent} />
      <div className="file-dropper">
        {fileName}
        <input id="image" type="file" onChange={imageSelectHandler}></input>
      </div>

      <button
        type="submit"
        style={{
          width: "100%",
          height: "40px",
          borderRadius: "3px",
          cursor: "pointer",
        }}
      >
        제출
      </button>
    </form>
  );
};

export default UploadForm;
