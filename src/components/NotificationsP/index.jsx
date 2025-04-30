import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import Modal from "react-bootstrap/Modal";
import { Link } from "react-router-dom";
import baseUrl from "../../config";
import { toast } from "react-toastify";

export const NotificationsP = ({ sendNotificationCount, topBar }) => {
  const [notificationList, setNotificationList] = useState([]);
  const profile = useSelector((state) => state.profile);
  const [loading, setLoading] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const isAdmin = profile.profileLevel === 0;
  const [showImagesModal, setShowImagesModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [user, setUser] = useState("");

  const handleAddLink = async (notificationId, link, department) => {
    setLoading(true);
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/images/addLink`, {
        notificationId,
        link,
        userId: profile._id,
        department,
      });
      if (response.status === 200) {
        toast.success("Added to Photo Gallery");
        setIsAdded(true);
      }
    } catch (error) {
      console.error("Error adding link:", error);
    } finally {
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
    setLoading(true);
    try {
      let url = "";
      if (type === "forum") {
        url = `${process.env.REACT_APP_API_URL}/forums/members/${groupId}`;
      } else if (type === "group") {
        url = `${process.env.REACT_APP_API_URL}/groups/members/${groupId}`;
      } else if (type === "ID") {
        url = `${process.env.REACT_APP_API_URL}/alumni/alumni/validateId`;
      } else if (type === "Job") {
        url = `${process.env.REACT_APP_API_URL}/jobs/${groupId}`;
      } else {
        throw new Error("Invalid type provided");
      }

      if (type === "Job") {
        const response = await axios.put(url, {
          approved: toDelete,
          notificationId,
        });
        if (response.status === 200) {
          setIsAdded(true);
        }
      } else if (type === "group") {
        const response = await axios.put(url, {
          members: {
            userId: memberId,
            profilePicture: profile.profilePicture,
            userName: requestedUserName,
          },
          notificationId,
          toDelete,
        });
        if (response.status === 200) {
          setIsAdded(true);
        }
      } else {
        const response = await axios.put(url, {
          userId: memberId,
          notificationId,
          toDelete,
        });
        if (response.status === 200) {
          setIsAdded(true);
        }
      }
    } catch (error) {
      console.error("Error adding/removing user:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/alumni/alumni/deleteNotification`, {
        data: { notificationId },
      });
      getRequest();
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const handleComment = async (
    commentId,
    forumId,
    userId,
    notificationId,
    deleteComment
  ) => {
    setLoading(true);
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/forums/${forumId}/removeBlock`, {
        commentId,
        userId,
        notificationId,
        deleteComment,
      });
      getRequest();
    } catch (error) {
      console.error("Error removing comment block:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRequest = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/groups/requests/req`);
      const filtered = response.data.filter((n) => n.status === false);
      setNotificationList(filtered);
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAlumniSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/search/search/notifications?keyword=${user}`
      );
      setNotificationList(
        response.data.filter((notification) => notification.status === false)
      );
    } catch (error) {
      console.error("Error searching alumni:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getRequest();
  }, [isAdded]);

  const filteredNotifications = isAdmin
    ? notificationList
    : notificationList.filter((n) => n.ownerId === profile._id);

  sendNotificationCount(filteredNotifications.length);

  const handleImageClick = (image) => {
    setSelectedImage(image);
    setShowImagesModal(true);
  };

  return (
    <div className="pt-5 px-4 z-[999999999999999] ">
     {!topBar && <form
        className="flex flex-col lg:flex-row lg:justify-end gap-4 mb-6"
        onSubmit={handleAlumniSearch}
      >
        <input
          type="text"
          className="w-full lg:w-64 bg-gray-100 text-gray-800 p-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500"
          placeholder="Search for name"
          value={user}
          onChange={(e) => setUser(e.target.value)}
        />
        <button
          type="submit"
          className="w-full lg:w-auto bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded transition"
        >
          Search
        </button>
      </form>}

      {loading ? (
        <div className="flex justify-center py-10">
          <l-line-spinner size="24" stroke="4" speed="1" color="#1F2937" />
        </div>
      ) : filteredNotifications.length ? (
        <div className="">
          {filteredNotifications.map((notification) => (
            <div
              key={notification._id}
              className={`rounded-lg py-3 px-3 border border-gray-600 mb-1 hover:bg-gray-100 ${topBar && "overflow-x-hidden"}`}
            >
              <div className={` font-medium text-gray-800 ${topBar?"text-sm":"text-lg"}`}>
                {notification.commented ? (
                  <span>
                    <Link
                      to={`/members/${notification.userId}`}
                      className="text-blue-600 hover:underline"
                    >
                      {notification.requestedUserName}
                    </Link>{" "}
                    has commented on your{" "}
                    <a
                      href={`/home/posts/${notification.postId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      post
                    </a>.
                  </span>
                ) : notification.link ? (
                  <span>
                    <Link
                      to={`/members/${notification.userId}`}
                      className="text-blue-600 hover:underline"
                    >
                      {notification.requestedUserName}
                    </Link>{" "}
                    has requested to add{" "}
                    <a
                      href={notification.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {notification.link}
                    </a>{" "}
                    to the photo gallery.
                  </span>
                ) : notification.ID ? (
                  <span>
                    <Link
                      to={`/members/${notification.userId}`}
                      className="text-blue-600 hover:underline"
                    >
                      {notification.requestedUserName}
                    </Link>{" "}
                    has requested to validate.{" "}
                    <button
                      onClick={() => handleImageClick(notification.ID)}
                      className="text-blue-600 hover:underline"
                    >
                      View ID
                    </button>
                    .
                  </span>
                ) : notification.businessVerification ? (
                  <span>
                    <Link
                      to={`/members/${notification.userId}`}
                      className="text-blue-600 hover:underline"
                    >
                      {notification.requestedUserName}
                    </Link>{" "}
                    has requested to validate for Business Connect.{" "}
                    <a
                      href={`${process.env.REACT_APP_API_URL}/uploads/${notification.businessVerification}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      View Document
                    </a>
                    .
                  </span>
                ) : notification.job !== undefined ? (
                  <span>
                    <Link
                      to={`/members/${notification.userId}`}
                      className="text-blue-600 hover:underline"
                    >
                      {notification.requestedUserName}
                    </Link>{" "}
                    has requested to post a Job/Internship.{" "}
                    <Link
                      to={
                        notification.job
                          ? `/jobs/${notification.jobId}/Jobs`
                          : `/internships/${notification.jobId}/Internships`
                      }
                      className="text-blue-600 hover:underline"
                    >
                      View
                    </Link>
                    .
                  </span>
                ) : notification.commentId ? (
                  <span>
                    <Link
                      to={`/members/${notification.userId}`}
                      className="text-blue-600 hover:underline"
                    >
                      {notification.requestedUserName}
                    </Link>{" "}
                    has requested to unblock from{" "}
                    <span className="font-semibold">
                      {notification.forumName}
                    </span>{" "}
                    forum. Comment: “{notification.comment}”.
                  </span>
                ) : (
                  <span>
                    <Link
                      to={`/members/${notification.userId}`}
                      className="text-blue-600 hover:underline"
                    >
                      {notification.requestedUserName}
                    </Link>{" "}
                    has requested to join{" "}
                    <span className="font-semibold">
                      {notification.groupName || notification.forumName}{" "}
                      {notification.groupName ? "Group" : "Forum"}
                    </span>
                    .
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-4 ">
                {/* Accept */}
                {notification.commented ? null : notification.link ? (
                  <button
                    onClick={() =>
                      handleAddLink(
                        notification._id,
                        notification.link,
                        notification.department
                      )
                    }
                    className="flex-1 lg:flex-none bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded transition"
                  >
                    Accept Link
                  </button>
                ) : notification.commentId ? (
                  <button
                    onClick={() =>
                      handleComment(
                        notification.commentId,
                        notification.forumId,
                        notification.userId,
                        notification._id,
                        false
                      )
                    }
                    className="flex-1 lg:flex-none bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded transition"
                  >
                    Accept
                  </button>
                ) : (
                  <button
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
                    className="flex-1 lg:flex-none bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded transition"
                  >
                    Accept
                  </button>
                )}

                {/* Reject */}
                {notification.commented === true ? null : (
                  <button
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
                          true
                        );
                      } else {
                        handleDeleteNotification(notification._id);
                      }
                    }}
                    className="flex-1 lg:flex-none bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded transition"
                  >
                    Reject
                  </button>
                )}
              </div>

            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500 py-10">
          No Notifications
        </div>
      )}

      {/* Image Modal */}
      <Modal
        show={showImagesModal}
        onHide={() => setShowImagesModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>View Image</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0">
          <img
            src={selectedImage}
            alt="Selected"
            className="w-full h-auto rounded-b-lg"
          />
        </Modal.Body>
      </Modal>
    </div>
  );
};
