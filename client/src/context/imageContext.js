import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "./AuthContext";

export const ImageContext = createContext();

export const ImageProvider = ({ children }) => {
  const [images, setImages] = useState([]); // 공개이미지
  const [myImages, setMyImages] = useState([]); // 개인이미지
  const [isPublic, setIsPublic] = useState(true);
  const [imageUrl, setimageUrl] = useState("/images");
  const [me] = useContext(AuthContext);

  useEffect(() => {
    axios
      .get(imageUrl)
      .then((result) => {
        setImages((prevData) => [...prevData, ...result.data]);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [imageUrl]);

  useEffect(() => {
    const sessionId = localStorage.getItem("sessionId");
    if (me) {
      setTimeout(() => {
        axios
          .get("/users/me/images")
          .then((result) => {
            setMyImages(result.data);
          })
          .catch((err) => {
            console.error(err);
          });
      }, 0);
    } else {
      setMyImages([]);
      setIsPublic(true);
    }
  }, [me]);

  const loaderMoreImages = () => {
    if (images.length === 0) return;
    const lastImageId = images[images.length - 1]._id;
    setimageUrl(`/images?lastid=${lastImageId}`);
  };

  return (
    <ImageContext.Provider
      value={{
        images,
        setImages,
        myImages,
        setMyImages,
        isPublic,
        setIsPublic,
        loaderMoreImages,
      }}
    >
      {children}
    </ImageContext.Provider>
  );
};
