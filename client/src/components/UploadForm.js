import React, { useState, useContext } from "react";
import axios from "axios";
import "./UploadForm.css";
import { toast } from "react-toastify";
import ProgressBar from "./ProgressBar";
import { ImageContext } from "../context/ImageContext";

const UploadForm = () => {
  const { images, setImages, myImages, setMyimages } = useContext(ImageContext);
  const defaultFileName = "이미지 파일을 업로드 해주세요.";
  const [files, setFiles] = useState(null);
  const [imgSrc, setImgSrc] = useState(null); // 업로드 할 이미지 미리보기
  const [fileName, setFileName] = useState(defaultFileName);
  const [percent, setPercent] = useState(0); // 이미지 업로드 진행 퍼센트
  const [isPublic, setIsPublic] = useState(true); // 이미지 공개여부

  //파일 선택시 이벤트 헨들러
  const imageSelectHandler = (e) => {
    const imageFiles = e.target.files;
    setFiles(imageFiles);
    const imageFile = imageFiles[0];
    setFileName(imageFile.name); // 업로드할 파일 정보들
    const fileReader = new FileReader(); // 업로드할 이미지 미리보기
    fileReader.readAsDataURL(imageFile);
    fileReader.onload = (e) => setImgSrc(e.target.result);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    for (let file of files) {
      formData.append("image", file);
    }

    formData.append("public", isPublic);
    try {
      const res = await axios.post("/images", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (e) => {
          // 업로드 진행사항을 표시하게 도와주는 axios 옵셤
          setPercent(Math.round((100 * e.loaded) / e.total));
        },
      });

      if (isPublic) {
        setImages([...images, ...res.data]);
      } else {
        setMyimages([...myImages, ...res.data]);
      }

      toast.success("이미지 업로드 성공!");
      setTimeout(() => {
        setPercent(0);
        setFileName(defaultFileName);
        setImgSrc(null);
      }, 3000);
    } catch (err) {
      toast.error(err.response.data.message);
      setPercent(0);
      setFileName(defaultFileName);
      setImgSrc(null);
      console.error(err);
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <img
        alt=""
        src={imgSrc}
        className={`image-preview ${imgSrc && "image-preview-show"}`}
      />
      <ProgressBar percent={percent} />
      <div className="file-dropper ">
        {fileName}
        <input
          id="image"
          type="file"
          multiple
          accept="image/*" // 이미지만 업로드 허용
          onChange={imageSelectHandler}
        ></input>
      </div>
      <input
        type="checkbox"
        id="public-check"
        value={!isPublic}
        onChange={() => setIsPublic(!isPublic)}
      />
      <label htmlFor="public-check">비공개</label>
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
