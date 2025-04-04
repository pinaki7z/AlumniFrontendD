import React, { useState, useEffect } from "react";
import axios from "axios";
import { Modal, Button, Form } from "react-bootstrap";
import { Upload } from "lucide-react";
import { useSelector } from "react-redux";
import baseUrl from "../../config";
import { toast } from "react-toastify";

const PhotoGallery = () => {
  const [departments, setDepartments] = useState([]); // Store departments
  const [imagesByYear, setImagesByYear] = useState({}); // Organize images by year for selected department
  const [displayedImages, setDisplayedImages] = useState([]); // Images to display after department selection
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [googleDriveLink, setGoogleDriveLink] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState(null); // Track the selected department
  const [selectedYear, setSelectedYear] = useState(null); // Track the selected year
  const profile = useSelector((state) => state.profile);

  const openImageModal = (image) => {
    setSelectedImage(image);
    setShowImageModal(true);
  };

  const closeImageModal = () => {
    setShowImageModal(false);
    setSelectedImage(null);
  };

  const openUploadModal = () => setShowUploadModal(true);
  const closeUploadModal = () => setShowUploadModal(false);

  const fetchDepartmentsAndImages = async () => {
    setIsLoading(true);
    try {
      // Fetch Google Drive folder data (this contains the department as well)
      const response = await axios.get(`${baseUrl}/images/getGoogleDriveFolders`);
      const folderData = response.data.folders;

      const departments = [...new Set(folderData.map((folder) => folder.department))]; // Get unique departments
      setDepartments(departments);

      const imagesByYear = {};
      for (const folder of folderData) {
        const { link, date, department } = folder;
        const year = new Date(date).getFullYear();

        if (department === selectedDepartment || !selectedDepartment) { // Filter by department if selected
          const imageResponse = await axios.post(`${baseUrl}/images/getImagesFromFolder`, { folderLink: link });
          const images = imageResponse.data.images;

          if (!imagesByYear[year]) {
            imagesByYear[year] = [];
          }

          imagesByYear[year].push(...images);
        }
      }

      // Sort years in descending order
      const sortedYears = Object.keys(imagesByYear).sort((a, b) => b - a);

      setImagesByYear(imagesByYear);
      setDisplayedImages(sortedYears);
    } catch (err) {
      console.error("Error fetching images from Google Drive folders:", err);
      setError("Failed to load images. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDepartmentClick = (department) => {
    setSelectedDepartment(department); // Set the selected department
    setSelectedYear(null); // Reset the selected year
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${baseUrl}/uploadGoogleDrive`, {
        link: googleDriveLink,
        userId: profile._id,
        department: profile.department,
        requestedUserName: `${profile.firstName} ${profile.lastName}`,
      });
      toast.success("Request has been sent to the admin");
      setGoogleDriveLink("");
      closeUploadModal();
      fetchDepartmentsAndImages(); // Refresh gallery after upload
    } catch (error) {
      console.error("Error uploading link:", error);
    }
  };

  useEffect(() => {
    fetchDepartmentsAndImages(); // Fetch departments and images on component mount
  }, [selectedDepartment]);

  if (isLoading) {
    return <div className="text-center mt-5">Loading...</div>;
  }

  if (error) {
    return <div className="text-center mt-5 text-danger">{error}</div>;
  }

  return (
    <div className="photoGallery" style={{ width: "100%", padding: "2% 5%" }}>
      {/* <div
        style={{
          textAlign: "left",
          padding: "20px",
          borderRadius: "10px",
          marginBottom: "10px",
          backgroundColor: "#71be95",
        }}
      >
        <h2 style={{ margin: "0", color: "white" }}>Photo Gallery</h2>
        <p style={{ marginTop: "10px", fontSize: "15px", color: "black" }}>
          Relive memorable moments and explore highlights through our community’s captured moments.
        </p>
        <Button variant="success" className="mt-3" onClick={openUploadModal}>
          <Upload size={16} className="me-2" />
          Add Google Drive Link
        </Button>
      </div> */}

      <div className='bg-[#cef3df] p-4 rounded-lg mb-3'>
        <h2 className='text-[#136175] mb-2 text-3xl md:text-4xl font-bold'>Photo Gallery</h2>
        <p className='text-base md:text-lg text-[#136175]' >
          Relive memorable moments and explore highlights through our community’s captured moments.
        </p>
        <Button variant="success" className="mt-3" onClick={openUploadModal}>
          <Upload size={16} className="me-2" />
          Add Google Drive Link
        </Button>
      </div>

      {/* Display Departments */}
      {selectedDepartment === null ? (
        <div className="row g-4">
          {departments.map((department) => (
            <div
              key={department}
              className="col-6 col-md-3 text-center"
              style={{ cursor: "pointer" }}
              onClick={() => handleDepartmentClick(department)}
            >
              <div
                className="p-4 bg-primary text-white rounded"
                style={{ fontSize: "1.5rem", fontWeight: "bold" }}
              >
                {department}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          <Button variant="secondary" className="mb-4" onClick={() => setSelectedDepartment(null)}>
            Back to Departments
          </Button>
          {/* Display Years */}
          {selectedYear === null ? (
            <div className="row g-4">
              {Object.keys(imagesByYear).map((year) => (
                <div
                  key={year}
                  className="col-6 col-md-3 text-center"
                  style={{ cursor: "pointer" }}
                  onClick={() => setSelectedYear(year)}
                >
                  <div
                    className="p-4 bg-success text-white rounded"
                    style={{ fontSize: "1.5rem", fontWeight: "bold" }}
                  >
                    {year}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              <Button variant="secondary" className="mb-4" onClick={() => setSelectedYear(null)}>
                Back to Years
              </Button>
              {/* Display Images */}
              <div className="row g-4">
                {imagesByYear[selectedYear].map((image) => {
                  const directImageUrl = image.id
                    ? `https://drive.google.com/thumbnail?id=${image.id}`
                    : null;

                  return (
                    <div
                      key={image.id}
                      className="col-6 col-md-4"
                      onClick={() => openImageModal({ ...image, url: directImageUrl })}
                      style={{ cursor: "pointer" }}
                    >
                      <img
                        src={directImageUrl}
                        alt={image.alt}
                        className="img-fluid rounded w-100 h-100 object-fit-cover"
                        style={{ aspectRatio: "1 / 1" }}
                      />
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </>
      )}

      {/* Image Modal */}
      <Modal show={showImageModal} onHide={closeImageModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>{selectedImage?.alt}</Modal.Title>
        </Modal.Header>
        <Modal.Body
          className="d-flex justify-content-center align-items-center"
          style={{ padding: "20px", maxHeight: "80vh", overflow: "auto" }}
        >
          {selectedImage && (
            <img
              src={selectedImage.url}
              alt={selectedImage.alt}
              className="img-fluid rounded"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                borderRadius: "10px",
              }}
            />
          )}
        </Modal.Body>
      </Modal>

      {/* Upload Modal */}
      <Modal show={showUploadModal} onHide={closeUploadModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Upload Photo</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleUploadSubmit}>
            <Form.Group className="mb-3" controlId="googleDriveLink">
              <Form.Label>Enter Google Drive Link</Form.Label>
              <Form.Control
                type="text"
                placeholder="Google Drive Link"
                value={googleDriveLink}
                onChange={(e) => setGoogleDriveLink(e.target.value)}
                required
              />
            </Form.Group>
            <div className="d-flex justify-content-end">
              <Button variant="secondary" onClick={closeUploadModal} className="me-2">
                Close
              </Button>
              <Button variant="primary" type="submit">
                Submit
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default PhotoGallery;
