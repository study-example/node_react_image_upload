import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "./AuthContext";

export const ImageContext = createContext();

export const ImageProvider = ({ children }) => {
  const [images, setImages] = useState([]); // 공개이미지
  const [myImages, setMyImages] = useState([]); // 개인이미지
  const [isPublic, setIsPublic] = useState(true);
  const [me] = useContext(AuthContext);

  useEffect(() => {
    axios
      .get("/images")
      .then((result) => {
        setImages(result.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

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

  return (
    <ImageContext.Provider
      value={{
        images,
        setImages,
        myImages,
        setMyImages,
        isPublic,
        setIsPublic,
      }}
    >
      {children}
    </ImageContext.Provider>
  );
};
