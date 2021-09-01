import React, { useState, useContext } from "react";
import axios from "axios";
import "./UploadForm.css";
import { toast } from "react-toastify";
import ProgressBar from "./ProgressBar";
import { ImageContext } from "../context/ImageContext";

const UploadForm = () => {
  const defaultFileName = "이미지 파일을 업로드 해주세요.";
  const [file, setFile] = useState(null);
  const [imgSrc, setImgSrc] = useState(null); // 업로드 할 이미지 미리보기
  const [fileName, setFileName] = useState(defaultFileName);
  const [percent, setPercent] = useState(0); // 이미지 업로드 진행 퍼센트

  const [images, setImages] = useContext(ImageContext);

  //파일 선택시 이벤트 헨들러
  const imageSelectHandler = (e) => {
    const imageFile = e.target.files[0];
    setFile(imageFile);
    setFileName(imageFile.name); // 업로드할 파일 정보들
    const fileReader = new FileReader(); // 업로드할 이미지 미리보기
    fileReader.readAsDataURL(imageFile);
    fileReader.onload = (e) => setImgSrc(e.target.result);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("image", file);
    try {
      const res = await axios.post("/images", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (e) => {
          // 업로드 진행사항을 표시하게 도와주는 axios 옵셤
          console.log(e);
          setPercent(Math.round((100 * e.loaded) / e.total));
        },
      });
      console.log({ res });
      setImages([...images, res.data]);
      toast.success("이미지 업로드 성공!");
      setTimeout(() => {
        setPercent(0);
        setFileName(defaultFileName);
        setImgSrc(null);
      }, 3000);
    } catch (err) {
      toast.error(err.message);
      setPercent(0);
      setFileName(defaultFileName);
      setImgSrc(null);
      console.error(err);
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <img
        src={imgSrc}
        className={`image-preview ${imgSrc && "image-preview-show"}`}
      />
      <ProgressBar percent={percent} />
      <div className="file-dropper ">
        {fileName}
        <input
          id="image"
          type="file"
          accept="image/*" // 이미지만 업로드 허용
          onChange={imageSelectHandler}
        ></input>
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
