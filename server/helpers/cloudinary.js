const cloudinary = require("cloudinary").v2;

const multer = require("multer");

cloudinary.config({
  cloud_name:'dhnth3m4m',
  api_key: "944414733482528",
  api_secret: "Bect4iYXYL-p5R_uwF5tOOpISh8",
});

const storage = new multer.memoryStorage();

async function imageUploadUtil(file) {
  const result = await cloudinary.uploader.upload(file, {
    resource_type: "auto",
  });

  return result;
}

const upload = multer({ storage });

module.exports = { upload, imageUploadUtil };
