import React, { useEffect, useState } from "react";

// 이미지를 s3에 업로드 하고 그 이미지를 리사이징한 url을 가져와서 보여주는 컴포넌트
// 이미지가 리사이징 되기전에 해당 이미지를 오청할 경우 이미지를 가져오지 못하는 문제점을 해결하기 위한 컴포넌트이다.
const Image = ({ imageUrl }) => {
  const [isError, setIsError] = useState(false);
  const [hashedUrl, setHashedUrl] = useState(imageUrl);

  useEffect(() => {
    let intervalId;

    if (isError && !intervalId) {
      setInterval(() => {
        intervalId = setHashedUrl(`${imageUrl}#${Date.now()}`);
      }, 1000);
    } else if (!isError && intervalId) {
      clearInterval(intervalId);
    } else {
      setHashedUrl(imageUrl);
    }

    return () => clearInterval(intervalId);
  }, [isError, setHashedUrl, imageUrl]);
  return (
    <img
      alt=""
      onError={() => setIsError(true)}
      onLoad={() => setIsError(false)}
      src={hashedUrl}
      sytle={{ display: isError ? "none" : "block" }}
    ></img>
  );
};

export default Image;
