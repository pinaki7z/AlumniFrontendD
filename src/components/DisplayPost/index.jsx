import './displayPost.css';
import NoGroups from '../Groups/NoGroups';
import picture from '../../images/d-group.jpg';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { lineSpinner } from 'ldrs';
import { useNavigate } from 'react-router-dom';
import { toast } from "react-toastify";
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import React from 'react';
import baseUrl from '../../config';
import groupMembers from "../../images/Groups-c.svg";
import groupPic from "../../images/d-group.jpg";
import { 
  Users, 
  Calendar, 
  Lock, 
  Globe, 
  FileText, 
  Loader2, 
  Eye,
  Clock,
  UserPlus
} from "lucide-react";

lineSpinner.register();

const DisplayPost = ({ groups = [], loading, joined }) => {
  const profile = useSelector((state) => state.profile);
  const [notificationList, setNotificationList] = useState([]);
  const navigateTo = useNavigate();
  
  const admin = profile.profileLevel === 0;

  const getRequest = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/groups/requests/req`);
      setNotificationList(response.data);
    } catch (error) {
      console.error("Error fetching request:", error);
    }
  };

  useEffect(() => {
    getRequest();
  }, []);

  const GroupItem = ({ group }) => {
    const [requestStatus, setRequestStatus] = useState("Request to Join");
    const [confirmModal, setConfirmModal] = useState(false);
    const [isMember, setIsMember] = useState(false);
    const [approved, setApproved] = useState(false);
    const [modalShow, setModalShow] = useState(false);
    const [isLoading, setIsLoading] = useState(false);


      // Add these missing state variables
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [selectedGroupName, setSelectedGroupName] = useState("");
  const [selectedGroupUserId, setSelectedGroupUserId] = useState("");

    function MyVerticallyCenteredModal(props) {
      return (
        <Modal 
          {...props} 
          size="lg" 
          aria-labelledby="contained-modal-title-vcenter" 
          centered 
          className="custom-modal"
        >
          <Modal.Header closeButton className="border-b border-gray-200 bg-gray-50">
            <Modal.Title id="contained-modal-title-vcenter" className="text-lg sm:text-xl font-bold text-gray-900">
              Verify your Business
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-4 sm:p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="text-blue-600" size={18} />
                <h4 className="text-base sm:text-lg font-semibold text-gray-900">Upload a document:</h4>
              </div>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-6 text-center hover:border-blue-400 transition-colors">
                <input
                  type="file"
                  name="businessVerification"
                  id="businessVerification"
                  className="w-full text-xs sm:text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs sm:file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer className="border-t border-gray-200 bg-gray-50 flex flex-col sm:flex-row gap-2">
            <Button
              onClick={() =>
                handleRequest(
                  selectedGroupUserId,
                  selectedGroupId,
                  profile._id,
                  selectedGroupName,
                  profile.firstName,
                  profile.lastName,
                )
              }
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg border-0 transition-colors text-sm"
            >
              Submit
            </Button>
            <Button
              onClick={props.onHide}
              className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg border-0 transition-colors text-sm"
            >
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      );
    }

    const fetchJoin = () => {
      axios
        .get(`${process.env.REACT_APP_API_URL}/groupMember/isMember/${group._id}/${profile._id}`)
        .then((res) => {
          setIsMember(res.data.isMember);
          setApproved(res.data.approved);
        })
        .catch((err) => {
          console.log(err);
        });
    };

    useEffect(() => {
      if (profile.profileLevel === 0 || group.userId === profile._id) {
        return;
      } else {
        fetchJoin();
      }
    }, [group._id, profile._id]);

    useEffect(() => {
      const matchingNotification = notificationList.find(
        (notification) => notification.groupId === group._id && notification.userId === profile._id,
      );
      if (matchingNotification) {
        setRequestStatus("Requested");
      } else {
        setRequestStatus("Request to Join");
      }
    }, [group._id, notificationList, profile._id]);

    const handleRequest = async (ownerId, groupId, userId, groupName, firstName, lastName) => {
      if (document.getElementById("businessVerification")) {
        setRequestStatus("Loading...");
        const formData = new FormData();
        const requestedUserName = `${firstName} ${lastName}`;
        const body = {
          ownerId,
          groupId,
          userId,
          groupName,
          requestedUserName,
        };
        const pdfFile = document.getElementById("businessVerification").files[0];
        formData.append("businessVerification", pdfFile);
        for (const key in body) {
          formData.append(key, body[key]);
        }
        try {
          const config = {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          };
          const response = await axios.post(`${process.env.REACT_APP_API_URL}/groups/createRequest`, formData, config);
          setModalShow(false);
          getRequest();
          toast.success("requested");
          if (response.data.requested === true) {
            setRequestStatus("Requested");
          } else setRequestStatus("Request to Join");
        } catch (error) {
          console.error("Error creating request:", error);
        }
      }
      setRequestStatus("Loading...");
      try {
        const requestedUserName = `${firstName} ${lastName}`;
        const body = {
          ownerId,
          groupId,
          userId,
          groupName,
          requestedUserName,
        };
        const response = await axios.post(`${process.env.REACT_APP_API_URL}/groups/createRequest`, body);
        if (response.data.requested === true) setRequestStatus("Requested");
        else setRequestStatus("Request");
      } catch (error) {
        console.error("Error creating request:", error);
      }
    };

    const handleAddMember = async (groupId) => {
      try {
        setIsLoading(true);
        const response = await axios.put(`${process.env.REACT_APP_API_URL}/groups/members/${groupId}`, {
          members: {
            userId: profile._id,
            profilePicture: profile.profilePicture,
            userName: `${profile.firstName} ${profile.lastName}`,
            profileLevel: profile.profileLevel,
          },
        });
        if (response.status === 200) {
          const { isUserAdded } = response.data;
          if (isUserAdded === true) {
            toast.success("added");
            navigateTo(`/home/groups/${groupId}`);
            setIsLoading(false);
          }
          if (isUserAdded === false) {
            toast.success("removed");
            setIsLoading(false);
            navigateTo(`/home/groups/${groupId}`);
          }
          setIsLoading(false);
          navigateTo(`/home/groups/${groupId}`);
        } else {
          console.error("Failed to add/remove user to/from the group");
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error adding/removing user to/from the group:", error);
        setIsLoading(false);
      }
    };

    function formatDate(isoDate) {
      const date = new Date(isoDate);
      const day = date.getDate();
      const month = date.toLocaleString("default", { month: "long" });
      const year = date.getFullYear();
      const suffix = (d) => {
        if (d > 3 && d < 21) return "th";
        switch (d % 10) {
          case 1:
            return "st";
          case 2:
            return "nd";
          case 3:
            return "rd";
          default:
            return "th";
        }
      };
      return `${day}${suffix(day)} ${month} ${year}`;
    }

    const handleJoinGroup = () => {
      const data = {
        groupId: group._id,
        userId: profile._id,
        approved: group.groupType == "Public" ? true : false,
      };
      axios
        .post(`${process.env.REACT_APP_API_URL}/groupMember/add`, data)
        .then((res) => {
          if (group.groupType == "Public") navigateTo(`/home/groups/${group._id}`);
          else {
            toast.success("Request sent successfully!");
            fetchJoin();
          }
          setConfirmModal(false);
        })
        .catch((err) => {
          console.log(err);
        });
    };

    const ConfirmModalShow = () => {
      return (
        <Modal show={confirmModal} onHide={() => setConfirmModal(false)} centered className="custom-modal">
          <Modal.Header closeButton className="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <Modal.Title className="text-lg sm:text-xl font-bold text-gray-900">Join Group</Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-4 sm:p-6">
            <div className="text-center space-y-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <Users className="text-blue-600" size={24} />
              </div>
              <p className="text-base sm:text-lg text-gray-700">
                Are you sure you want to join{" "}
                <span className="font-bold text-blue-600 text-lg sm:text-xl capitalize">{group.groupName}</span>?
              </p>
            </div>
          </Modal.Body>
          <Modal.Footer className="border-t border-gray-200 bg-gray-50 flex flex-col sm:flex-row justify-center gap-2">
            <Button
              className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg border-0 transition-colors text-sm"
              onClick={() => setConfirmModal(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg border-0 transition-colors text-sm"
              onClick={() => handleJoinGroup(group._id)}
            >
              Join
            </Button>
          </Modal.Footer>
        </Modal>
      );
    };

    const directEntry = (isMember && approved) || profile.profileLevel === 0;

    const getGroupTypeIcon = () => {
      return group.groupType === "Public" ? (
        <Globe size={12} className="text-green-600" />
      ) : (
        <Lock size={12} className="text-orange-600" />
      );
    };

    const getGroupTypeBadge = () => {
      const isPublic = group.groupType === "Public";
      return (
        <div
          className={`absolute top-2 right-2 sm:top-3 sm:right-3 px-2 py-1 sm:px-3 sm:py-1.5 rounded-full text-xs font-semibold flex items-center gap-1 backdrop-blur-sm ${
            isPublic
              ? "bg-green-100/90 text-green-800 border border-green-200"
              : "bg-orange-100/90 text-orange-800 border border-orange-200"
          }`}
        >
          {getGroupTypeIcon()}
          <span className="hidden sm:inline">{group.groupType}</span>
        </div>
      );
    };

    const getActionButton = () => {
      if (isMember && approved === false) {
        return (
          <button className="w-full bg-yellow-100 text-yellow-800 border border-yellow-200 font-semibold rounded-lg text-sm px-4 py-2.5 flex items-center justify-center gap-2 cursor-not-allowed">
            <Clock size={14} />
            <span>Requested</span>
          </button>
        );
      } else {
        const isPublic = group?.groupType === "Public";
        return (
          <button
            onClick={() => setConfirmModal(true)}
            className="w-full dynamic-site-bg hover:opacity-90 text-white font-semibold rounded-lg text-sm px-4 py-2.5 transition-all duration-200 flex items-center justify-center gap-2 shadow-sm"
          >
            <UserPlus size={14} />
            <span>{isPublic ? "Join Group" : "Request to Join"}</span>
          </button>
        );
      }
    };

    return (
      <div key={group._id} className="w-full">
        <div className="w-full bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 overflow-hidden group">
          {directEntry ? (
            <Link to={`/home/groups/${group._id}`} className="block">
              {/* Group Image */}
              <div className="relative w-full h-32 sm:h-40 lg:h-48 overflow-hidden">
                <div
                  className="w-full h-full bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
                  style={{
                    backgroundImage: `url(${group.groupPicture || group.groupLogo || groupPic})`,
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>
                {getGroupTypeBadge()}
              </div>

              {/* Group Info */}
              <div className="p-3 sm:p-4 lg:p-6">
                <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 mb-2 sm:mb-3 group-hover:text-[#0A3A4C] transition-colors line-clamp-2">
                  {group.groupName}
                </h3>

                <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-4">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users size={14} className="text-blue-500" />
                    <span className="text-xs sm:text-sm font-medium">{group.members.length} members</span>
                  </div>

                  <div className="flex items-center gap-2 text-gray-500">
                    <Calendar size={14} />
                    <span className="text-xs sm:text-sm">Created {formatDate(group.createdAt)}</span>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.preventDefault();
                    navigateTo(`/home/groups/${group._id}`);
                  }}
                  className="w-full dynamic-site-bg hover:opacity-90 text-white font-semibold rounded-lg text-xs sm:text-sm px-3 sm:px-4 py-2 sm:py-2.5 transition-all duration-200 shadow-sm flex items-center justify-center gap-2"
                >
                  <Eye size={14} />
                  <span>View Group</span>
                </button>
              </div>
            </Link>
          ) : (
            <div>
              {/* Group Image */}
              <div className="relative w-full h-32 sm:h-40 lg:h-48 overflow-hidden">
                <div
                  className="w-full h-full bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
                  style={{
                    backgroundImage: `url(${group.groupPicture || group.groupLogo || groupPic})`,
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>
                {getGroupTypeBadge()}
              </div>

              {/* Group Info */}
              <div className="p-3 sm:p-4 lg:p-6">
                <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 mb-2 sm:mb-3 line-clamp-2">{group.groupName}</h3>

                <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-4">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users size={14} className="text-blue-500" />
                    <span className="text-xs sm:text-sm font-medium">{group.members.length} members</span>
                  </div>

                  <div className="flex items-center gap-2 text-gray-500">
                    <Calendar size={14} />
                    <span className="text-xs sm:text-sm">Created {formatDate(group.createdAt)}</span>
                  </div>
                </div>

                {getActionButton()}
              </div>
            </div>
          )}
        </div>

        <ConfirmModalShow show={confirmModal} onHide={() => setConfirmModal(false)} />
        <MyVerticallyCenteredModal show={modalShow} onHide={() => setModalShow(false)} />
      </div>
    );
  };

  let filteredGroups;
  if (profile.department === 'All') {
    filteredGroups = groups;
  } else {
    filteredGroups = groups.filter(group => 
      group.groupType === 'Public' || 
      (group.groupType === 'Private' && profile.department === group.department) || 
      group.category === 'Business Connect' || 
      group.department === 'All'
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 sm:py-16">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={32} className="animate-spin text-[#0A3A4C]" />
          <p className="text-sm text-gray-600">Loading groups...</p>
        </div>
      </div>
    );
  }

  if (filteredGroups.length === 0) {
    return (
      <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-8 sm:p-12 text-center">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Users size={32} className="text-gray-400" />
        </div>
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No groups found</h3>
        <p className="text-gray-600 text-sm sm:text-base">
          Try adjusting your search criteria or check back later for new groups.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
      {filteredGroups.map((group) => (
        <GroupItem key={group._id} group={group} />
      ))}
    </div>
  );
};

export default DisplayPost;
