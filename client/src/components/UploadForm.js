import React, { useState, useContext, useRef } from "react";
import axios from "axios";
import "./UploadForm.css";
import { toast } from "react-toastify";
import ProgressBar from "./ProgressBar";
import { ImageContext } from "../context/ImageContext";

const UploadForm = () => {
  const { setImages, setMyImages } = useContext(ImageContext);
  const [files, setFiles] = useState(null);
  const [previews, setPreviews] = useState([]);
  const [percent, setPercent] = useState([]); // 이미지 업로드 진행 퍼센트
  const [isPublic, setIsPublic] = useState(true); // 이미지 공개여부
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef();

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

  //s3 presigned 적용
  const onSubmitV2 = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      //1. presigned 데이터를 받아온다.
      const presignedData = await axios.post("/images/presigned", {
        contentTypes: [...files].map((file) => file.type),
      });
      //2 presigned 을 사용해서 s3 에 업로드 한다.
      await Promise.all(
        [...files].map((file, index) => {
          const { presigned } = presignedData.data[index];
          const formData = new FormData();
          //백엔드에서 생성한 s3 prsigned 정보를 form 에 추가한다.
          for (const key in presigned.fields) {
            formData.append(key, presigned.fields[key]);
          }
          formData.append("Content-Type", file.type);
          formData.append("file", file); // 주의: 마지막에 실제 업로드할 파일을 추가 해야 한다.
          return axios.post(presigned.url, formData, {
            onUploadProgress: (e) => {
              // 업로드 진행사항을 표시하게 도와주는 axios 옵셤
              // setPercent(Math.round((100 * e.loaded) / e.total));
              setPercent((prevData) => {
                const newData = [...prevData];
                newData[index] = Math.round((100 * e.loaded) / e.total);
                return newData;
              });
            },
          });
        })
      );

      //3. 백엔드에 s3에 저장된 이미지 정보를 저장(mongodb)
      const res = await axios.post("/images", {
        images: [...files].map((file, index) => ({
          imageKey: presignedData.data[index].imageKey,
          originalname: file.name,
        })),
        public: isPublic,
      });

      if (isPublic) {
        setImages((prevData) => [...res.data, ...prevData]);
      }

      toast.success("이미지 업로드 성공!");
      setTimeout(() => {
        setPercent([]);
        setPreviews([]);
        inputRef.current.value = null;
        setIsLoading(false);
      }, 3000);
    } catch (err) {
      console.error(err);
      toast.error(err.response.data.message);
      setPercent([]);
      setPreviews([]);
      inputRef.current.value = null;
      setIsLoading(false);
    }
  };

  // const onSubmit = async (e) => {
  //   e.preventDefault();
  //   const formData = new FormData();
  //   for (let file of files) {
  //     formData.append("image", file);
  //   }

  //   formData.append("public", isPublic);
  //   try {
  //     const res = await axios.post("/images", formData, {
  //       headers: { "Content-Type": "multipart/form-data" },
  //       onUploadProgress: (e) => {
  //         // 업로드 진행사항을 표시하게 도와주는 axios 옵셤
  //         setPercent(Math.round((100 * e.loaded) / e.total));
  //       },
  //     });

  //     if (isPublic) {
  //       setImages((prevData) => [...res.data, ...prevData]);
  //     }
  //     setMyImages((prevData) => [...res.data, ...prevData]);

  //     toast.success("이미지 업로드 성공!");
  //     setTimeout(() => {
  //       setPercent([]);
  //       setPreviews([]);
  //       inputRef.current.value = null;
  //     }, 3000);
  //   } catch (err) {
  //     console.error(err);
  //     toast.error(err.response.data.message);
  //     setPercent([]);
  //     setPreviews([]);
  //     inputRef.current.value = null;
  //   }
  // };

  const previewImages = previews.map((preview, index) => (
    <div key={index}>
      <img
        style={{ width: 200, height: 200, objectFit: "cover" }}
        alt=""
        src={preview.imgSrc}
        className={`image-preview ${preview.imgSrc && "image-preview-show"}`}
      />
      <ProgressBar percent={percent[index]} />
    </div>
  ));

  const fileName =
    previews.length === 0
      ? "이미지 파일을 업로드 해주세요."
      : previews.reduce(
          (previous, current) => previous + `${current.fileName},`,
          ""
        );

  return (
    // <form onSubmit={onSubmit}>
    <form onSubmit={onSubmitV2}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-around",
          flexWrap: "wrap",
        }}
      >
        {previewImages}
      </div>
      {/* <ProgressBar percent={percent} /> */}
      <div className="file-dropper ">
        {fileName}
        <input
          ref={(ref) => {
            inputRef.current = ref;
          }}
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
        disabled={isLoading}
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
