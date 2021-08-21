import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

export const ImageContext = createContext();

export const ImageProvider = ({ children }) => {
  const [images, setImages] = useState([]);
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
  return (
    <ImageContext.Provider value={[images, setImages]}>
      {children}
    </ImageContext.Provider>
  );
};
