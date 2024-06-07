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
import ReactModal from "react-modal";
import Pagination from "../components/Pagination";

const FileUpload = () => {
  const [imageList, setImageList] = useState([]);
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState(null);
  const [completedCrop, setCompletedCrop] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const imageRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  // console.log(imageList);
  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const lastIndex = currentPage * itemsPerPage;
  const firstIndex = lastIndex - itemsPerPage;
  // imagelist is total data to map
  const currentPost = imageList.slice(firstIndex, lastIndex);

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
    if (imageRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const image = imageRef.current;

      if (completedCrop) {
        // If there is a completed crop, use the selected crop values
        const crop = completedCrop;
        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;
        canvas.width = crop.width;
        canvas.height = crop.height;

        const ctx = canvas.getContext("2d");
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
      } else {
        // If no crop is selected, use default crop values
        console.log(crop);

        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;
        canvas.width = crop.width;
        canvas.height = crop.height;
        const ctx = canvas.getContext("2d");

        // Convert percentage values to pixels
        const sourceX = (crop.x / 100) * image.width * scaleX;
        const sourceY = (crop.y / 100) * image.height * scaleY;
        const sourceWidth = (crop.width / 100) * image.width * scaleX;
        const sourceHeight = (crop.height / 100) * image.height * scaleY;

        // Draw the cropped image on the canvas
        ctx.drawImage(
          image,
          sourceX,
          sourceY,
          sourceWidth,
          sourceHeight,
          0,
          0,
          crop.width,
          crop.height
        );
      }

      canvas.toBlob((blob) => {
        if (!blob) {
          console.error("Canvas is empty");
          return;
        }
        const imagePath = `images/${v4()}`;
        const imageref = ref(storage, imagePath);
        uploadBytes(imageref, blob).then(() => {
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
      //   console.log(file)
      setImageSrc(URL.createObjectURL(file));
      setIsModalOpen(true);
      // Set initial crop values here
      setCrop({
        aspect: 4 / 3,
        unit: "%",
        width: 50,
        height: 50,
        x: 25,
        y: 25,
      });
      // setCrop(null); // Reset crop
      setCompletedCrop(null); // Reset completed crop
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
    setIsModalOpen(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Clear file input value
    }
  };

  const customStyles = {
    content: {
      top: "50%",
      left: "50%",
      right: "auto",
      bottom: "auto",
      marginRight: "-50%",
      transform: "translate(-50%, -50%)",
    },
  };

  const handleShowModal = (image) => {
    setShowModal(true);
    setSelectedImage(image);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedImage(null);
  };

  const handleDeleteModalImage = () => {
    // console.log(selectedImage)
    const imageRef = ref(storage, selectedImage.path);
    deleteObject(imageRef)
      .then(() => {
        fetchImages();
        setShowModal(false);
        setSelectedImage(null);
        //  alert("Image deleted successfully");
      })
      .catch((error) => {
        console.error("Error deleting image:", error);
      });
  };

  return (
    <div className="file-upload-gallery">
      <header>
        <h2>File Crop Saver</h2>
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
            </div>
          </div>
        </div>

        <div className="gallery-area">
          <div className="files list">
            {imageSrc && (
              <ReactModal
                style={customStyles}
                isOpen={isModalOpen}
                onRequestClose={handleClearFile}
              >
                <div className="d-flex justify-content-center align-items-center">
                  <ReactCrop
                    crop={crop}
                    onChange={(newCrop) => setCrop(newCrop)}
                    onComplete={(c) => setCompletedCrop(c)}
                  >
                    <img
                      ref={imageRef}
                      src={imageSrc}
                      alt=""
                      style={{ maxWidth: "100%", maxHeight: "70vh" }}
                    />
                  </ReactCrop>
                  <canvas ref={canvasRef} style={{ display: "none" }} />
                </div>
                <div className="d-flex justify-content-end mt-3">
                  <button
                    type="button"
                    className="btn btn-primary ms-3 "
                    onClick={handleClearFile}
                  >
                    cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary ms-3 flex-auto"
                    onClick={handleFileUpload}
                  >
                    Upload
                  </button>
                </div>
              </ReactModal>
            )}
          </div>
          <div className="files grid">
            {currentPost?.map((image, i) => (
              <div key={i} className="file-card">
                <img
                  src={image.url}
                  alt=""
                  onClick={() => handleShowModal(image)}
                />
                <button
                  className="delete-button"
                  onClick={() => handleDeleteImage(image)}
                >
                  <img src={deleteIcon} alt="Delete" />
                </button>
              </div>
            ))}
          </div>
          <ReactModal
            isOpen={showModal}
            onRequestClose={handleCloseModal}
            style={customStyles}
          >
            <img
              src={selectedImage?.url}
              alt=""
              // style={{ maxHeight: "70vh" }}
            />
            <div className="d-flex justify-content-end mt-3">
              <button
                className="btn btn-secondary mx-2"
                onClick={handleCloseModal}
              >
                Close
              </button>
              <button
                className="btn btn-secondary "
                onClick={handleDeleteModalImage}
              >
                Delete
              </button>
            </div>
          </ReactModal>
        </div>
      </main>
      <footer>
        <Pagination
          totalpost={imageList.length}
          postPerPage={itemsPerPage}
          setCurrentPage={setCurrentPage}
          currentPage={currentPage}
        />
      </footer>
    </div>
  );
};

export default FileUpload;
