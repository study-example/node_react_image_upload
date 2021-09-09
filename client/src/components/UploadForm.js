import React, { useState, useContext } from "react";
import axios from "axios";
import "./UploadForm.css";
import { toast } from "react-toastify";
import ProgressBar from "./ProgressBar";
import { ImageContext } from "../context/ImageContext";

const UploadForm = () => {
  const { images, setImages, myImages, setMyimages } = useContext(ImageContext);
  const [files, setFiles] = useState(null);
  const [previews, setPreviews] = useState([]);
  const [percent, setPercent] = useState(0); // 이미지 업로드 진행 퍼센트
  const [isPublic, setIsPublic] = useState(true); // 이미지 공개여부

  //파일 선택시 이벤트 헨들러
  const imageSelectHandler = async (e) => {
    const imageFiles = e.target.files;
    setFiles(imageFiles);

    const imagePreviews = await Promise.all(
      [...imageFiles].map(async (imageFile) => {
        return new Promise((resolve, reject) => {
          try {
            const fileReader = new FileReader();
            fileReader.readAsDataURL(imageFile);
            fileReader.onload = (e) =>
              resolve({ imgSrc: e.target.result, fileName: imageFile.name });
          } catch (err) {
            reject(err);
          }
        });
      })
    );

    setPreviews(imagePreviews);
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
        setPreviews([]);
      }, 3000);
    } catch (err) {
      toast.error(err.response.data.message);
      setPercent(0);
      setPreviews([]);
      console.error(err);
    }
  };

  const previewImages = previews.map((preview, index) => (
    <img
      key={index}
      style={{ width: 200, height: 200, objectFit: "cover" }}
      alt=""
      src={preview.imgSrc}
      className={`image-preview ${preview.imgSrc && "image-preview-show"}`}
    />
  ));

  const fileName =
    previews.length === 0
      ? "이미지 파일을 업로드 해주세요."
      : previews.reduce(
          (previous, current) => previous + `${current.fileName},`,
          ""
        );

  return (
    <form onSubmit={onSubmit}>
      <div style={{ display: "flex", flexWrap: "wrap" }}>{previewImages}</div>
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
