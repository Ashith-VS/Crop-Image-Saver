import {
  getDownloadURL,
  listAll,
  ref,
  uploadBytes,
  deleteObject,
} from "firebase/storage";
import React, { useEffect, useState, useRef } from "react";
import { storage } from "../services/firebase";
import { v4 } from "uuid";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import deleteIcon from "../assets/images/1814090_delete_garbage_trash_icon.png";
import cancelIcon from "../assets/images/430088_circle_close_delete_remove_icon.png";
const FileUpload = () => {
  const [imageList, setImageList] = useState([]);
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState(null);
  const [completedCrop, setCompletedCrop] = useState(null);
  const imageRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const fetchImages = () => {
    const imageListRef = ref(storage, "images");
    listAll(imageListRef).then((response) => {
      const promises = response.items.map(async (item) => {
        const url = await getDownloadURL(item);
        return { url, path: item.fullPath };
      });
      Promise.all(promises).then((urls) => {
        setImageList(urls);
      });
    });
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const handleFileUpload = () => {
    if (completedCrop && imageRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const image = imageRef.current;
      const crop = completedCrop;

      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;
      const ctx = canvas.getContext("2d");
      canvas.width = crop.width;
      canvas.height = crop.height;

      ctx.drawImage(
        image,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0,
        0,
        crop.width,
        crop.height
      );

      canvas.toBlob((blob) => {
        if (!blob) {
          console.error("Canvas is empty");
          return;
        }
        const imagePath = `images/${v4()}`;
        const imageref = ref(storage, imagePath);
        uploadBytes(imageref, blob).then(() => {
          //   alert("Cropped image uploaded successfully");
          setImageSrc(null);
          fetchImages();
          if (fileInputRef.current) {
            fileInputRef.current.value = ""; // Clear file input value
          }
        });
      }, "image/jpeg");
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      //   setImageUpload(file);
      setImageSrc(URL.createObjectURL(file));
    }
  };

  const handleDeleteImage = (image) => {
    const imageRef = ref(storage, image.path);
    deleteObject(imageRef)
      .then(() => {
        fetchImages();
        //  alert("Image deleted successfully");
      })
      .catch((error) => {
        console.error("Error deleting image:", error);
      });
  };

  const handleClearFile = () => {
    setImageSrc(null);
    setCompletedCrop(null);
    setCrop(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Clear file input value
    }
  };

  return (
    <div className="file-upload-gallery">
      <header>
        <h1>File Uploader</h1>
      </header>

      <main>
        <div className="upload-area">
          <div className="container col-6">
            <div className="d-flex mb-3">
              <label htmlFor="formFileSm" className="form-label"></label>
              <input
                ref={fileInputRef} // Add ref to file input
                className="form-control form-control-sm"
                id="formFileSm"
                type="file"
                // multiple
                onChange={handleImageChange}
              />
              {imageSrc && (
                <button className="cancel-button" onClick={handleClearFile}>
                  <img src={cancelIcon} alt="" className="delete-button" />
                </button>
              )}
              <button
                type="button"
                className="btn btn-primary ms-3"
                onClick={handleFileUpload}
              >
                Upload
              </button>
            </div>
          </div>
        </div>

        <div className="gallery-area">
          <div className="files list">
            {imageSrc && (
              <div className="d-flex justify-content-center align-items-center">
                <ReactCrop
                  crop={crop}
                  onChange={(newCrop) => setCrop(newCrop)}
                  onComplete={(c) => setCompletedCrop(c)}
                >
                  <img ref={imageRef} src={imageSrc} alt="" />
                </ReactCrop>
                <canvas ref={canvasRef} style={{ display: "none" }} />
              </div>
            )}
          </div>
          <div className="files grid">
            {imageList?.map((image, i) => (
              <div key={i} className="file-card">
                <img src={image.url} alt="" />
                <button
                  className="delete-button"
                  onClick={() => handleDeleteImage(image)}
                >
                  <img src={deleteIcon} alt="Delete" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default FileUpload;
