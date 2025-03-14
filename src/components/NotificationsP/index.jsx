// import React, { useEffect, useState } from 'react';
// import { useSelector } from 'react-redux';
// import axios from 'axios';
// import Modal from 'react-bootstrap/Modal';
// import './notificationsP.css';
// import { Link } from 'react-router-dom';
// import baseUrl from "../../config";
// import { toast } from "react-toastify";

// export const NotificationsP = () => {
//     const [notificationList, setNotificationList] = useState([]);
//     const profile = useSelector((state) => state.profile);
//     const [loading, setLoading] = useState(false);
//     const [isAdded, setIsAdded] = useState(false);
//     //const isAdmin = profile.profileLevel === 0;
//     const [isAdmin, setIsAdmin] = useState(false);
//     const [showImagesModal, setShowImagesModal] = useState(false);
//     const [selectedImage, setSelectedImage] = useState(null);
//     const [user, setUser] = useState('');
//     let deleteComment;


//     // Function to handle adding link-specific notifications
//     const handleAddLink = async (notificationId, link) => {
//         console.log('Notification Link:', link);
//         setLoading(true);
//         try {
//             const response = await axios.post(`${baseUrl}/images/addLink`, {
//                 notificationId,
//                 link,
//                 userId: profile._id,
//             });
//             if (response.status === 200) {
//                 console.log('Link added successfully');
//                 toast.success('Added to Photo Gallery')
//                 setIsAdded(true);
//             } else {
//                 console.error('Failed to add the link');
//             }
//             setLoading(false);
//         } catch (error) {
//             console.error('Error adding link:', error);
//             setLoading(false);
//         }
//     };

//     const handleAddMember = async (notificationId, groupId, memberId, type, toDelete) => {
//         console.log('notificationId, groupId, memberId, type, toDelete', notificationId, groupId, memberId, type, toDelete)
//         setLoading(true);
//         console.log('type', type);
//         try {
//             let url = '';
//             if (type === 'forum') {
//                 url = `${baseUrl}/forums/members/${groupId}`;
//             } else if (type === 'group') {
//                 url = `${baseUrl}/groups/members/${groupId}`;
//             } else if (type === 'ID') {
//                 url = `${baseUrl}/alumni/alumni/validateId`;
//             } else if (type === 'Job') {
//                 url = `${baseUrl}/jobs/${groupId}`;
//             }
//             else {
//                 throw new Error('Invalid type provided');
//             }

//             if (type === 'Job') {
//                 console.log('deleting job')
//                 const response = await axios.put(url, {
//                     approved: toDelete,
//                     notificationId: notificationId,
//                 });

//                 if (response.status === 200) {
//                     setIsAdded(true);
//                     setLoading(false);
//                     console.log('Job approved');
//                 } else {
//                     console.error('Failed to approve job');
//                     setLoading(false);
//                 }

//             }
//             else if (type === 'group') {
//                 console.log('group')
//                 const response = await axios.put(url, {
//                     members: {
//                         userId: profile._id,
//                         profilePicture: profile.profilePicture,
//                         userName: `${profile.firstName} ${profile.lastName}`,
//                         profileLevel: profile.profileLevel
//                     },
//                     notificationId: notificationId,
//                     toDelete
//                 });

//                 if (response.status === 200) {
//                     const { isUserAdded } = response.data;
//                     setIsAdded(true);
//                     setLoading(false);
//                     console.log('User added/removed from the group:', isUserAdded);
//                 } else {
//                     console.error('Failed to add/remove user from the group');
//                     setLoading(false);
//                 }
//             }
//             else {
//                 console.log('Not a job')
//                 const response = await axios.put(url, {
//                     userId: memberId,
//                     notificationId: notificationId,
//                     toDelete
//                 });

//                 if (response.status === 200) {
//                     const { isUserAdded } = response.data;
//                     setIsAdded(true);
//                     setLoading(false);
//                     console.log('User added/removed from the group:', isUserAdded);
//                 } else {
//                     console.error('Failed to add/remove user from the group');
//                     setLoading(false);
//                 }
//             }
//         } catch (error) {
//             console.error('Error adding/removing user from the group:', error);
//             setLoading(false);
//         }
//     };

//     const handleDeleteNotification = async (notificationId) => {
//         console.log('notificationId for delete:', notificationId);
//         try {
//             const response = await axios.delete(`${baseUrl}/alumni/alumni/deleteNotification`, {
//                 data: { notificationId }
//             });
//             console.log(response.data);
//             getRequest();
//         } catch (error) {
//             console.error("Error deleting notification:", error);
//         }
//     }

//     const getRequest = async () => {
//         setLoading(true);
//         try {
//             const response = await axios.get(`${baseUrl}/groups/requests/req`);
//             const filteredData = response.data.filter(notification => notification.status === false);
//             setNotificationList(filteredData);
//             setLoading(false);
//         } catch (error) {
//             console.error('Error fetching request:', error);
//             setLoading(false);
//         }
//     };

//     useEffect(() => {
//         if(profile.profileLevel === 0) setIsAdmin(true);
//         getRequest();
//     }, [isAdded]);

//     const handleImageClick = (image) => {
//         setSelectedImage(image);
//         setShowImagesModal(true);
//     };

//     const ImagesModal = () => (
//         <Modal
//             show={showImagesModal}
//             onHide={() => setShowImagesModal(false)}
//             size="lg"
//             aria-labelledby="contained-modal-title-vcenter"
//             centered
//         >
//             <Modal.Header closeButton>
//                 <Modal.Title id="contained-modal-title-vcenter">
//                     View Image
//                 </Modal.Title>
//             </Modal.Header>
//             <Modal.Body>
//                 <img
//                     src={selectedImage}
//                     alt="Selected Image"
//                     style={{ width: '100%', height: '100%' }}
//                 />
//             </Modal.Body>
//         </Modal>
//     );

//     const filteredNotifications = isAdmin
//         ? notificationList
//         : notificationList.filter((notification) => notification.ownerId === profile._id);

//     const handleAlumniSearch = async (e, userInput) => {
//         e.preventDefault();

//         try {
//             const response = await axios.get(`${baseUrl}/search/search/notifications?keyword=${user}`);
//             // Handle the response data, such as updating state with the search results
//             console.log('search data', response.data);
//             setNotificationList(response.data.filter(notification => notification.status === false))
//         } catch (error) {
//             console.error("Error searching alumni:", error);
//             // Handle error, such as displaying an error message to the user
//         }
//     };

//     const handleComment = async (commentId, forumId, userId, notificationId, deleteComment) => {
//         console.log('check', commentId, forumId, userId, notificationId, deleteComment)
//         setLoading(true);
//         try {
//             const response = await axios.put(`${baseUrl}/forums/${forumId}/removeBlock`, {
//                 commentId,
//                 userId,
//                 notificationId,
//                 deleteComment
//             });

//             console.log("Comment block removed successfully:", response.data);
//             getRequest();
//             setLoading(false);
//         } catch (error) {

//             console.error("Error removing comment block:", error);
//             setLoading(false);
//         }
//     };

//     const calculateTimeDifference = (createdAt) => {
//         const currentTime = new Date();
//         const notificationTime = new Date(createdAt);
//         const timeDiff = Math.floor((currentTime - notificationTime) / (1000 * 60 * 60)); // Difference in hours

//         if (timeDiff < 1) {
//             const timeDiffMinutes = Math.floor((currentTime - notificationTime) / (1000 * 60)); // Difference in minutes
//             return timeDiffMinutes > 1 ? `${timeDiffMinutes}m ago` : 'Just now';
//         } else if (timeDiff < 24) {
//             return `${timeDiff}h ago`;
//         } else {
//             const timeDiffDays = Math.floor(timeDiff / 24);
//             return `${timeDiffDays}d ago`;
//         }
//     };

//     return (
//         <div style={{ paddingTop: '20px' }}>
//             <form onSubmit={handleAlumniSearch} style={{ display: 'flex', gap: '15px', }}>
//                 <input type="text" placeholder='Search for name' name='user' value={user} onChange={(e) => setUser(e.target.value)} style={{ width: '40%', borderRadius: '5px' }} />
//                 <button type="submit" style={{ borderRadius: '5px', backgroundColor: "#efeff0" }}>Search</button>
//             </form>
//             <div style={{ padding: '2% 5%' }}>
//                 {loading ? (
//                     <l-line-spinner size="20" stroke="3" speed="1" color="black"></l-line-spinner>
//                 ) : filteredNotifications.length ? (
//                     filteredNotifications.map((notification) => (
//                         <div className="notification-item" key={notification._id}>
//                             <div className="notification-image">
//                                 <img src={notification.profileImage || "https://via.placeholder.com/50"} alt="Profile" />
//                             </div>
//                             <div className="notification-content">
//                                 <p>
//                                     {notification.link ? (
//                                         <span>
//                                             <Link to={`/members/${notification.userId}`} className="notification-link">
//                                                 {notification.requestedUserName}
//                                             </Link>{" "}
//                                             has requested to add <a href={notification.link} target="_blank" rel="noopener noreferrer">{notification.link}</a> to the photo gallery.
//                                         </span>
//                                     ) : notification.businessVerification ? (
//                                         <div>
//                                           <Link
//                                             to={`/members/${notification.userId}`}
//                                             style={{
//                                               textDecoration: "underline",
//                                               color: "inherit",
//                                             }}
//                                           >
//                                             {notification.requestedUserName}
//                                           </Link>{" "}
//                                           has requested to validate for Business Connect. Click{" "}
//                                           <a
//                                             href={`${baseUrl}/uploads/${notification.businessVerification}`}
//                                             target="_blank"
//                                             rel="noopener noreferrer"
//                                           >
//                                             here
//                                           </a>{" "}
//                                           to view the document.
//                                         </div>
//                                       ): (
//                                         <span>
//                                             <Link to={`/members/${notification.userId}`} className="notification-link">
//                                                 {notification.requestedUserName}
//                                             </Link>{" "}
//                                             requested to join {notification.groupName || notification.forumName}.{" "}
//                                             {notification.ID ? (
//                                                 <a
//                                                     href={notification.ID}
//                                                     target="_blank"
//                                                     rel="noopener noreferrer"
//                                                     className="notification-link"
//                                                 >
//                                                     Click here to view the ID
//                                                 </a>
//                                             ) : null}
//                                             <br />
//                                             <span className="notification-info">
//                                                 {calculateTimeDifference(notification.createdAt)} |{" "}
//                                                 {notification.groupName ? "Groups" : "Jobs"}
//                                             </span>
//                                         </span>
//                                     )}
//                                 </p>

//                                 <div className="notification-buttons">
//                                     {notification.link ? (
//                                         <button className="accept-button" onClick={() => handleAddLink(notification._id, notification.link)}>
//                                             Accept Link
//                                         </button>
//                                     ) : (
//                                         <button className="accept-button" onClick={() => handleAddMember(notification._id, notification.forumId || notification.groupId || notification.jobId || '', notification.userId, notification.job !== undefined ? 'Job' : (notification.ID ? 'ID' : (notification.forumId ? 'forum' : 'group')), false)}>
//                                             Accept
//                                         </button>
//                                     )}
//                                     <button className="decline-button" onClick={() => {
//                                         if (notification.ID) {
//                                             handleAddMember(notification._id, '', notification.userId, 'ID', true);
//                                         } else if (notification.job !== undefined) {
//                                             handleAddMember(notification._id, notification.jobId, notification.userId, 'Job', true);
//                                         } else if (notification.commentId) {
//                                             handleComment(notification.commentId, notification.forumId, notification.userId, notification._id, deleteComment = true);
//                                         } else {
//                                             handleDeleteNotification(notification._id);
//                                         }
//                                     }}>
//                                         Decline
//                                     </button>
//                                 </div>
//                             </div>
//                         </div>
//                     ))
//                 ) : (
//                     <div style={{ paddingTop: '10px' }}>No Notifications</div>
//                 )}
//                 <ImagesModal />
//             </div>
//         </div>
//     );
// };

import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { FcApprove, FcDisapprove } from "react-icons/fc";
import Modal from "react-bootstrap/Modal";
import "./notificationsP.css";
import { Link } from "react-router-dom";
import baseUrl from "../../config";
import { MdOutlineDeleteOutline } from "react-icons/md";
import { toast } from "react-toastify";
import { filter } from "lodash";

export const NotificationsP = ({ sendNotificationCount }) => {
  const [notificationList, setNotificationList] = useState([]);
  const profile = useSelector((state) => state.profile);
  const [loading, setLoading] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const isAdmin = profile.profileLevel === 0;
  const [showImagesModal, setShowImagesModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [user, setUser] = useState("");
  let deleteComment;


  const handleAddLink = async (notificationId, link,department) => {
         console.log('Notification Link:', link);
         setLoading(true);
         try {
             const response = await axios.post(`${baseUrl}/images/addLink`, {
                 notificationId,
                 link,
                 userId: profile._id,
                 department
             });
             if (response.status === 200) {
                 console.log('Link added successfully');
                 toast.success('Added to Photo Gallery')
                 setIsAdded(true);
             } else {
                 console.error('Failed to add the link');
             }
             setLoading(false);
         } catch (error) {
             console.error('Error adding link:', error);
             setLoading(false);
         }
     };

  const handleAddMember = async (
    notificationId,
    groupId,
    memberId,
    type,
    toDelete,
    requestedUserName
  ) => {
    console.log(
      "notificationId, groupId, memberId, type, toDelete,requested username",
      notificationId,
      groupId,
      memberId,
      type,
      toDelete,
      requestedUserName
    );
    setLoading(true);
    console.log("type", type);
    try {
      let url = "";
      if (type === "forum") {
        url = `${baseUrl}/forums/members/${groupId}`;
      } else if (type === "group") {
        url = `${baseUrl}/groups/members/${groupId}`;
      } else if (type === "ID") {
        url = `${baseUrl}/alumni/alumni/validateId`;
      } else if (type === "Job") {
        url = `${baseUrl}/jobs/${groupId}`;
      } else {
        throw new Error("Invalid type provided");
      }

      if (type === "Job") {
        console.log("deleting job");
        const response = await axios.put(url, {
          approved: toDelete,
          notificationId: notificationId,
        });

        if (response.status === 200) {
          setIsAdded(true);
          setLoading(false);
          console.log("Job approved");
        } else {
          console.error("Failed to approve job");
          setLoading(false);
        }
      } else if (type === "group") {
        console.log("group");
        const response = await axios.put(url, {
          members: {
            userId: memberId,
            profilePicture: profile.profilePicture,
            userName: requestedUserName,
            //profileLevel: profile.profileLevel,
          },
          notificationId: notificationId,
          toDelete,
        });

        if (response.status === 200) {
          const { isUserAdded } = response.data;
          setIsAdded(true);
          setLoading(false);
          console.log("User added/removed from the group:", isUserAdded);
        } else {
          console.error("Failed to add/remove user from the group");
          setLoading(false);
        }
      } else {
        console.log("Not a job");
        const response = await axios.put(url, {
          userId: memberId,
          notificationId: notificationId,
          toDelete,
        });

        if (response.status === 200) {
          const { isUserAdded } = response.data;
          setIsAdded(true);
          setLoading(false);
          console.log("User added/removed from the group:", isUserAdded);
        } else {
          console.error("Failed to add/remove user from the group");
          setLoading(false);
        }
      }
    } catch (error) {
      console.error("Error adding/removing user from the group:", error);
      setLoading(false);
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    console.log("notificationId for delete:", notificationId);
    try {
      const response = await axios.delete(
        `${baseUrl}/alumni/alumni/deleteNotification`,
        {
          data: { notificationId },
        }
      );
      console.log(response.data);
      getRequest();
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const getRequest = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${baseUrl}/groups/requests/req`);
      const filteredData = response.data.filter(
        (notification) => notification.status === false
      );
      setNotificationList(filteredData);
      //sendNotificationCount(filteredData.length);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching request:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    getRequest();
    //sendNotificationCount(filteredNotifications.length)
  }, [isAdded]);

  const handleImageClick = (image) => {
    setSelectedImage(image);
    setShowImagesModal(true);
  };

  const ImagesModal = () => (
    <Modal
      show={showImagesModal}
      onHide={() => setShowImagesModal(false)}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">View Image</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <img
          src={selectedImage}
          alt="Selected Image"
          style={{ width: "100%", height: "100%" }}
        />
      </Modal.Body>
    </Modal>
  );

  const filteredNotifications = isAdmin
    ? notificationList
    : notificationList.filter(
        (notification) => notification.ownerId === profile._id
      );

  sendNotificationCount(filteredNotifications.length)    
  const handleAlumniSearch = async (e, userInput) => {
    e.preventDefault();

    try {
      const response = await axios.get(
        `${baseUrl}/search/search/notifications?keyword=${user}`
      );
      // Handle the response data, such as updating state with the search results
      console.log("search data", response.data);
      setNotificationList(
        response.data.filter((notification) => notification.status === false)
      );
    } catch (error) {
      console.error("Error searching alumni:", error);
      // Handle error, such as displaying an error message to the user
    }
  };

  const handleComment = async (
    commentId,
    forumId,
    userId,
    notificationId,
    deleteComment
  ) => {
    console.log(
      "check",
      commentId,
      forumId,
      userId,
      notificationId,
      deleteComment
    );
    setLoading(true);
    try {
      const response = await axios.put(
        `${baseUrl}/forums/${forumId}/removeBlock`,
        {
          commentId,
          userId,
          notificationId,
          deleteComment,
        }
      );

      console.log("Comment block removed successfully:", response.data);
      getRequest();
      setLoading(false);
    } catch (error) {
      console.error("Error removing comment block:", error);
      setLoading(false);
    }
  };

  return (
    <div style={{ paddingTop: "20px" }}>
      <form
        className="px-5 lg:float-right"
        onSubmit={handleAlumniSearch}
        style={{ display: "flex", gap: "15px" }}
      >
        <input
          type="text"
          className="bg-gray-200 shadow-sm text-black p-2 rounded border-gray-500 "
          placeholder="Search for name"
          name="user"
          value={user}
          onChange={(e) => setUser(e.target.value)}
        />
        <button
          className="bg-[#F8A700] rounded px-3 font-semibold"
          type="submit"
        >
          Search
        </button>
      </form>
      <div>
        {loading ? (
          <l-line-spinner
            size="20"
            stroke="3"
            speed="1"
            color="black"
          ></l-line-spinner>
        ) : filteredNotifications.length ? (
          <table style={{ width: "100%" }}>
            {/* <thead>
                            <tr>
                                <th></th>
                                <th style={{ color: 'mediumseagreen' }}>ACCEPT</th>
                                <th style={{ color: 'orangered' }}>REJECT</th>
                            </tr>
                        </thead> */}
            <tbody style={{ display: "table-cell", paddingBottom: "50px" }}>
              {filteredNotifications.map((notification) => (
                <div key={notification._id}>
                  <div className="text-lg py-4 font-semibold">
                    {notification.commented ? (
                        <span>
                        <Link to={`/members/${notification.userId}`} className="notification-link">
                          {notification.requestedUserName}
                        </Link>{" "}
                        has commented on your{" "}
                        <a
                          href={`/home/posts/${notification.postId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          post
                        </a>.
                      </span>
                    ) : notification.link ? (
                                         <span>
                                            <Link to={`/members/${notification.userId}`} className="notification-link">
                                                 {notification.requestedUserName}
                                             </Link>{" "}
                                             has requested to add <a href={notification.link} target="_blank" rel="noopener noreferrer">{notification.link}</a> to the photo gallery.
                                         </span>
                                     ) :notification.ID ? (
                      <div>
                        <Link
                          to={`/members/${notification.userId}`}
                          style={{
                            textDecoration: "underline",
                            color: "inherit",
                          }}
                        >
                          {notification.requestedUserName}
                        </Link>{" "}
                        has requested to validate. Click{" "}
                        <span
                          style={{
                            cursor: "pointer",
                            textDecoration: "underline",
                          }}
                          onClick={() => handleImageClick(notification.ID)}
                        >
                          here
                        </span>{" "}
                        to view the identity.
                      </div>
                    ) : notification.businessVerification ? (
                      <div>
                        <Link
                          to={`/members/${notification.userId}`}
                          style={{
                            textDecoration: "underline",
                            color: "inherit",
                          }}
                        >
                          {notification.requestedUserName}
                        </Link>{" "}
                        has requested to validate for Business Connect. Click{" "}
                        <a
                          href={`${baseUrl}/uploads/${notification.businessVerification}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          here
                        </a>{" "}
                        to view the document.
                      </div>
                    ) : notification.job !== undefined ? (
                      <>
                        <Link
                          to={`/members/${notification.userId}`}
                          style={{
                            textDecoration: "underline",
                            color: "inherit",
                          }}
                        >
                          {notification.requestedUserName}
                        </Link>{" "}
                        has requested to post a Job/Internship. Click{" "}
                        {notification.job ? (
                          <Link
                            to={`/jobs/${notification.jobId}/Jobs`}
                            style={{
                              textDecoration: "underline",
                              color: "inherit",
                            }}
                          >
                            here
                          </Link>
                        ) : (
                          <Link
                            to={`/internships/${notification.jobId}/Internships`}
                            style={{
                              textDecoration: "underline",
                              color: "inherit",
                            }}
                          >
                            here
                          </Link>
                        )}{" "}
                        to view the Job/Internship{" "}
                      </>
                    ) : notification.commentId ? (
                      <>
                        <Link
                          to={`/members/${notification.userId}`}
                          style={{
                            textDecoration: "underline",
                            color: "inherit",
                          }}
                        >
                          {notification.requestedUserName}
                        </Link>{" "}
                        has requested to unblock him/her from{" "}
                        {notification.forumName} forum. The comment is :{" "}
                        {notification.comment}.
                      </>
                    ) : (
                      <span>
                        <Link
                          to={`/members/${notification.userId}`}
                          style={{
                            textDecoration: "underline",
                            color: "inherit",
                          }}
                        >
                          {notification.requestedUserName}
                        </Link>
                        &nbsp; has requested to join{" "}
                        {notification.groupName
                          ? `${notification.groupName} Group`
                          : `${notification.forumName} forum`}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-4 mb-3 items-center justify-start ">
                    <div className="">
                      {notification.commented ? null : notification.link ? (
                                         <button className="accept-button" onClick={() => handleAddLink(notification._id, notification.link,notification.department)}>
                                             Accept Link
                                         </button>
                                     ) : notification.commentId ? (
                        <div
                          onClick={() =>
                            handleComment(
                              notification.commentId,
                              notification.forumId,
                              notification.userId,
                              notification._id,
                              (deleteComment = false)
                            )
                          }
                          className="border px-3 w-20 p-1 rounded hover:bg-gray-400 font-semibold cursor-pointer  text-center bg-gray-300 "
                        >
                          Accept
                        </div>
                      ) : (
                        <div
                          onClick={() =>
                            handleAddMember(
                              notification._id,
                              notification.forumId ||
                                notification.groupId ||
                                notification.jobId ||
                                "",
                              notification.userId,
                              notification.job !== undefined
                                ? "Job"
                                : notification.ID
                                ? "ID"
                                : notification.forumId
                                ? "forum"
                                : "group",
                              false,
                              notification.requestedUserName
                            )
                          }
                          className="border px-3 w-20 p-1 rounded hover:bg-gray-400 font-semibold  cursor-pointer  text-center bg-gray-300 "
                        >
                          Accept
                        </div>
                      )}
                    </div>
                    {notification.commented === true ? null : <div className="">
                      <div
                        onClick={() => {
                          if (notification.ID) {
                            handleAddMember(
                              notification._id,
                              "",
                              notification.userId,
                              "ID",
                              true
                            );
                          } else if (notification.job !== undefined) {
                            handleAddMember(
                              notification._id,
                              notification.jobId,
                              notification.userId,
                              "Job",
                              true
                            );
                          } else if (notification.commentId) {
                            handleComment(
                              notification.commentId,
                              notification.forumId,
                              notification.userId,
                              notification._id,
                              (deleteComment = true)
                            );
                          } else {
                            handleDeleteNotification(notification._id);
                          }
                        }}
                        className="border w-20 px-3 p-1 rounded hover:bg-red-600 font-semibold cursor-pointer  text-center text-white bg-red-500 "
                      >
                       {notification.commented === undefined && 'Reject'}

                      </div>
                    </div>}
                  </div>
                  <hr className="border mb-2"></hr>
                 
                </div>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ paddingTop: "10px" }}>No Notifications</div>
        )}
         
        <ImagesModal />
      </div>
    </div>
  );
};
