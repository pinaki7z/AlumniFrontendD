import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from "react-router-dom";
import { GiMoneyStack } from 'react-icons/gi';
import { AiFillGold } from 'react-icons/ai';
import { toast } from 'react-toastify';
import dummy from "../../images/d-group.jpg";
import { FaBriefcase } from "react-icons/fa";
import { IoIosInformationCircle } from "react-icons/io";
import { CiLocationArrow1 } from "react-icons/ci";
import { RiHomeSmileLine } from "react-icons/ri";
import baseUrl from "../../config";
import { BsPatchCheckFill } from "react-icons/bs";

const JobPost = ({ 
  userId, id, jobTitle, title, titleS, description, salaryMin, 
  createdAt, picture, salaryMax, duration, jobType, questions, 
  category, currency, attachments, appliedCandidates, searchQuery, 
  type, locationType, company, verified, employmentType 
}) => {
  const profile = useSelector((state) => state.profile);
  const navigateTo = useNavigate();
  const [menuVisible, setMenuVisible] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalShow, setModalShow] = useState(false);
  const [deleteModalShow, setDeleteModalShow] = useState(false);

  const handleClick = () => {
    if (type === 'Job') {
      navigateTo(`/home/jobs/${id}/Jobs`);
    }
    if (type === 'Internship') {
      navigateTo(`/home/internships/${id}/Internships`);
    }
  }

  function MyVerticallyCenteredModal(props) {
    const handleArchive = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/${type + 's'}/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        if (response.ok) {
          toast.success('Archived successfully');
          setModalShow(false);
          window.location.reload();
        } else {
          console.error('Failed to archive job');
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };

    return (
      <div className={`${props.show ? 'block' : 'hidden'} fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50`}>
        <div className="bg-white rounded-lg overflow-hidden shadow-xl w-11/12 md:w-1/2">
          <div className="flex justify-between items-center p-4 border-b">
            <h3 className="text-lg font-semibold">Archive {titleS}</h3>
            <button onClick={props.onHide} className="text-gray-500 hover:text-gray-700">&times;</button>
          </div>
          <div className="p-4">
            <p>Are you sure you want to archive this {titleS}?</p>
          </div>
          <div className="flex justify-end p-4 border-t space-x-2">
            <button onClick={handleArchive} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Yes</button>
            <button onClick={props.onHide} className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400">No</button>
          </div>
        </div>
      </div>
    );
  }

  function DeleteModal(props) {
    return (
      <div className={`${props.show ? 'block' : 'hidden'} fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50`}>
        <div className="bg-white rounded-lg overflow-hidden shadow-xl w-11/12 md:w-1/2">
          <div className="flex justify-between items-center p-4 border-b">
            <h3 className="text-lg font-semibold">
              Are you sure you want to delete this job? You will lose access to all data including CVs received under this job. If you want to retain the data, archive instead.
            </h3>
            <button onClick={props.onHide} className="text-gray-500 hover:text-gray-700">&times;</button>
          </div>
          <div className="flex justify-end p-4 border-t space-x-2">
            <button onClick={handleDelete} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">Delete</button>
            <button onClick={props.onHide} className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400">Close</button>
          </div>
        </div>
      </div>
    );
  }

  const handleDelete = async () => {
    setDeleteModalShow(false);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/${type + 's'}/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      if (response.ok) {
        toast.success('Deleted successfully');
        setModalShow(false);
        window.location.reload();
      } else {
        console.error('Failed to delete job');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }

  return (
    <div 
      className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transition duration-300"
      onClick={handleClick}
    >
      <div className="h-48 w-full overflow-hidden">
        <img
          src={dummy}
          alt="Default"
          className="object-cover w-full h-full"
        />
      </div>
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">
            {jobTitle}
            {verified && <BsPatchCheckFill size={20} className="text-green-500 inline-block ml-1" />}
          </h2>
          {((profile.profileLevel === 0 || profile.profileLevel === 1) || userId === profile._id) && (
            <div className="relative">
              <button 
                onClick={(e) => { e.stopPropagation(); setMenuVisible(!menuVisible); }} 
                className="text-gray-600 hover:text-gray-800 focus:outline-none"
              >
                &#8942;
              </button>
              {menuVisible && (
                <ul className="absolute right-0 mt-2 w-40 bg-white border rounded shadow-lg">
                  <li 
                    onClick={(e) => { e.stopPropagation(); setDeleteModalShow(true); }} 
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  >
                    Delete
                  </li>
                </ul>
              )}
            </div>
          )}
        </div>
        <div className="space-y-2">
          <div className="flex items-center text-gray-600">
            <RiHomeSmileLine className="mr-2" />
            <p>{company}</p>
          </div>
          <div className="flex items-center text-gray-600">
            <GiMoneyStack className="mr-2" />
            <p>{salaryMin ? `₹${salaryMin} - ₹${salaryMax}` : 'Unpaid'}</p>
          </div>
          {locationType && (
            <div className="flex items-center text-gray-600">
              <CiLocationArrow1 className="mr-2" />
              <p>{Object.keys(locationType).find(key => locationType[key])}</p>
            </div>
          )}
          <div className="flex items-center text-gray-600">
            <AiFillGold className="mr-2" />
            <p>{category}</p>
          </div>
          <div className="flex items-center text-gray-600">
            <FaBriefcase className="mr-2" />
            <p>{type}</p> <span className="bg-blue-100 ml-3 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">
              {employmentType}
            </span>
          </div>
            
        </div>
        {appliedCandidates && appliedCandidates.map(candidate => {
          if (candidate.userId === profile._id) {
            return (
              <div key={candidate.userId} className="flex items-center gap-2">
                {candidate.comment && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setShowModal(true); }}
                    className="text-blue-600 hover:text-blue-800 text-lg"
                  >
                    <IoIosInformationCircle />
                  </button>
                )}
                <span className="text-sm text-gray-700">{candidate.status}</span>
              </div>
            );
          }
          return null;
        })}
      </div>
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg relative w-11/12 md:w-1/3">
            <button 
              className="absolute top-0 right-0 mt-2 mr-2 text-gray-500 hover:text-gray-700" 
              onClick={() => setShowModal(false)}
            >
              &times;
            </button>
            <p className="text-center font-medium">
              {appliedCandidates.find(candidate => candidate.userId === profile._id)?.comment}
            </p>
          </div>
        </div>
      )}
      <MyVerticallyCenteredModal
        show={modalShow}
        onHide={() => setModalShow(false)}
      />
      <DeleteModal
        show={deleteModalShow}
        onHide={() => setDeleteModalShow(false)}
      />
    </div>
  );
}

export default JobPost;
