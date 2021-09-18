const aws = require("aws-sdk");
const { AWS_SECRET_KEY, AWS_ACCESS_KEY } = process.env;

const s3 = new aws.S3({
  secretAccessKey: AWS_SECRET_KEY,
  accessKeyId: AWS_ACCESS_KEY,
  region: "ap-northeast-2",
});

// s3 의 presigned post 기능을 사용
// const getSignedUrl = ({ key }) => {
//   return new Promise((resolve, reject) => {
//     s3.createPresignedPost(
//       {
//         Bucket: "hanumoka-image-upload-tutorial",
//         Fields: {
//           key,
//         },
//         Expires: 300,
//         Conditions: [
//           ["content-length-range", 0, 50 * 1000 * 1000], // 0 ~ 대략 50 매가 바이트
//           ["starts-with", "$Content-Type", "image/"], // 이미지 파일만
//         ],
//       },
//       (err, data) => {
//         if (err) reject(err);
//         resolve(data);
//       }
//     );
//   });
// };

const getSignedUrl = ({ key }) => {
  return new Promise((resolve, reject) => {
    s3.createPresignedPost(
      {
        Bucket: "hanumoka-image-upload-tutorial",
        Fields: {
          key,
        },
        Expires: 3000,
        Conditions: [
          ["content-length-range", 0, 50 * 1000 * 1000],
          ["starts-with", "$Content-Type", "image/"],
        ],
      },
      (err, data) => {
        if (err) {
          reject(err);
        }
        console.log(data);
        resolve(data);
      }
    );
  });
};

module.exports = { s3, getSignedUrl };
