import React, { useContext, useEffect, useState, useRef } from "react";
import { useParams } from "react-router";
import { ImageContext } from "../context/ImageContext";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import { toast } from "react-toastify";
import { useHistory } from "react-router-dom";

const ImagePage = () => {
  const history = useHistory();
  const { imageId } = useParams();
  const { images, setImages, setMyImages } = useContext(ImageContext);
  const [hasLiked, setHasLiked] = useState(false);
  const [me] = useContext(AuthContext);
  const [image, setImage] = useState();
  const [error, setError] = useState(false);
  const imageRef = useRef();

  useEffect(() => {
    imageRef.current = images.find((image) => image._id === imageId);
  }, [images, imageId]);

  useEffect(() => {
    if (imageRef.current) {
      // 배열에 이미지가 존재할때
      setImage(imageRef.current);
    } else {
      //배열에 이미지가 존재하지 않을때
      axios
        .get(`/images/${imageId}`)
        .then((data) => {
          setImage(data);
          setError(false);
        })
        .catch((err) => {
          setError(true);
          toast.error(err.response.data.message);
        });
    }
  }, [imageId, images]);

  useEffect(() => {
    if (me && image && image.likes.includes(me.userId)) {
      setHasLiked(true);
    }
  }, [me, image]);

  const updateImage = (images, image) =>
    [...images.filter((image) => image._id !== imageId), image].sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

  const onSubmit = async () => {
    const result = await axios.patch(
      `/images/${imageId}/${hasLiked ? "unlike" : "like"}`
    );

    if (result.data.public) {
      setImages((prevData) => updateImage(prevData, result.data));
    }
    setMyImages((prevData) => updateImage(prevData, result.data));

    setHasLiked(!hasLiked);
  };

  const deleteHandler = async () => {
    try {
      if (!window.confirm("정말 해당 이미지를 삭제하시겠습니까?")) {
        return;
      }
      const result = await axios.delete(`/images/${imageId}`);
      toast.success(result.data.message);
      setImages((prevData) =>
        prevData.filter((image) => image._id !== imageId)
      );
      setMyImages((prevData) =>
        prevData.filter((image) => image._id !== imageId)
      );
      history.push("/");
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (error) return <h3>Error...</h3>;
  else if (!image) return <h3>Loading...</h3>;

  return (
    <div>
      <h3>Image Page - {imageId}</h3>
      {/* <img
        style={{ width: "100%" }}
        src={`http://localhost:5000/uploads/${image.key}`}
        alt={imageId}
      /> */}
      {/* <img
        style={{ width: "100%" }}
        src={`https://hanumoka-image-upload-tutorial.s3.ap-northeast-2.amazonaws.com/raw/${image.key}`}
        alt={imageId}
      /> */}
      {/* <img
        style={{ width: "100%" }}
        src={`https://hanumoka-image-upload-tutorial.s3.ap-northeast-2.amazonaws.com/w600/${image.key}`}
        alt={imageId}
      /> */}
      <img
        style={{ width: "100%" }}
        src={`https://d3knjrjwpqq8d1.cloudfront.net/w600/${image.key}`}
        alt={imageId}
      />

      <span>좋아요 {image?.likes?.length}</span>
      {me && image.user._id === me.userId && (
        <button
          style={{ float: "right", marginLeft: 10 }}
          onClick={deleteHandler}
        >
          삭제
        </button>
      )}
      <button style={{ float: "right" }} onClick={onSubmit}>
        {hasLiked ? "좋아요 취소" : "좋아요"}
      </button>
    </div>
  );
};

export default ImagePage;
