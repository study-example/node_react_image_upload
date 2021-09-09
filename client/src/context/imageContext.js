import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
} from "react";
import axios from "axios";
import { AuthContext } from "./AuthContext";

export const ImageContext = createContext();

export const ImageProvider = ({ children }) => {
  const [images, setImages] = useState([]); // 공개이미지
  const [myImages, setMyImages] = useState([]); // 개인이미지
  const [isPublic, setIsPublic] = useState(true);
  const [imageUrl, setimageUrl] = useState("/images");
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [me] = useContext(AuthContext);

  useEffect(() => {
    setImageLoading(true);
    axios
      .get(imageUrl)
      .then((result) => {
        setImages((prevData) => [...prevData, ...result.data]);
      })
      .catch((err) => {
        console.log(err);
        setImageError(err);
      })
      .finally(() => {
        setImageLoading(false);
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

  const lastImageId = images.length > 0 ? images[images.length - 1]._id : null;

  const loaderMoreImages = useCallback(() => {
    if (imageLoading || !lastImageId) return;

    setimageUrl(`/images?lastid=${lastImageId}`);
  }, [lastImageId, imageLoading]);

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
        imageLoading,
        imageError,
      }}
    >
      {children}
    </ImageContext.Provider>
  );
};
