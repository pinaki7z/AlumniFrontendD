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



lineSpinner.register();

const DisplayPost = ({ title, groups = [], loading, joined }) => {
  const profile = useSelector((state) => state.profile);
  const [notificationList, setNotificationList] = useState([]);
  const [modalShow, setModalShow] = React.useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [selectedGroupName, setSelectedGroupName] = useState("");
  const [selectedGroupUserId, setSelectedGroupUserId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigateTo = useNavigate();
  console.log('groups display post', groups)
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
    const [requestStatus, setRequestStatus] = useState('Request to Join');
    const [confirmModal, setConfirmModal] = useState(false);
    const [isMember, setIsMember] = useState(false);
    const [approved, setApproved] = useState(false);
    console.log('request ', requestStatus);

    function MyVerticallyCenteredModal(props) {
      return (
        <Modal
          {...props}
          size="lg"
          aria-labelledby="contained-modal-title-vcenter"
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title id="contained-modal-title-vcenter">
              Verify your Business
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <h4>Upload a document:-</h4>
            <input type="file" name="businessVerification" id="businessVerification" />
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={handleRequest}>Submit</Button>
            <Button onClick={props.onHide}>Close</Button>
          </Modal.Footer>
        </Modal>
      );
    }

    const fetchJoin = () => {
      axios.get(`${process.env.REACT_APP_API_URL}/groupMember/isMember/${group._id}/${profile._id}`)
        .then((res) => {
          setIsMember(res.data.isMember);
          setApproved(res.data.approved);
        }).catch((err) => {
          console.log(err);
        })
    }
    useEffect(() => {
      if (profile.profileLevel === 0 || group.userId === profile._id) {
        return;
      }
      else {
        fetchJoin();
      }
    }, [group._id, profile._id]);


    useEffect(() => {
      const matchingNotification = notificationList.find(
        (notification) => notification.groupId === group._id && notification.userId === profile._id
      );
      if (matchingNotification) {
        setRequestStatus('Requested');
      } else {
        setRequestStatus('Request to Join');
      }
    }, [group._id, notificationList, profile._id]);

    const handleRequest = async (ownerId, groupId, userId, groupName, firstName, lastName) => {
      if (document.getElementById('businessVerification')) {
        setRequestStatus('Loading...');
        const formData = new FormData();
        const requestedUserName = `${profile.firstName} ${profile.lastName}`;
        const userId = profile._id;
        const body = {
          ownerId: selectedGroupUserId,
          groupId: selectedGroupId,
          userId,
          groupName: selectedGroupName,
          requestedUserName
        };
        const pdfFile = document.getElementById('businessVerification').files[0];

        formData.append('businessVerification', pdfFile);

        for (const key in body) {
          formData.append(key, body[key]);
        }

        try {
          const config = {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          };
          const response = await axios.post(`${process.env.REACT_APP_API_URL}/groups/createRequest`, formData, config);
          setModalShow(false);
          getRequest();
          toast.success('requested');
          if (response.data.requested === true) {

            setRequestStatus('Requested');
            console.log('requested if');
          }
          else setRequestStatus('Request to Join');
        } catch (error) {
          console.error("Error creating request:", error);
        }
      }

      setRequestStatus('Loading...');
      try {
        const requestedUserName = `${firstName} ${lastName}`;
        const body = {
          ownerId,
          groupId,
          userId,
          groupName,
          requestedUserName
        };
        const response = await axios.post(`${process.env.REACT_APP_API_URL}/groups/createRequest`, body);
        console.log('body', response.data);
        if (response.data.requested === true) setRequestStatus('Requested');
        else setRequestStatus('Request');
      } catch (error) {
        console.error("Error creating request:", error);
      }
    };


    const handleAddMember = async (groupId) => {
      console.log('adding member', groupId);
      try {
        setIsLoading(true);
        const response = await axios.put(`${process.env.REACT_APP_API_URL}/groups/members/${groupId}`, {
          members: {
            userId: profile._id,
            profilePicture: profile.profilePicture,
            userName: `${profile.firstName} ${profile.lastName}`,
            profileLevel: profile.profileLevel
          }
        });

        if (response.status === 200) {
          const { isUserAdded } = response.data;
          if (isUserAdded === true) {
            toast.success('added')
            navigateTo(`/home/groups/${groupId}`)
            setIsLoading(false);
          }
          if (isUserAdded === false) {
            toast.success('removed')
            setIsLoading(false);
            navigateTo(`/home/groups/${groupId}`)
          }
          setIsLoading(false);
          console.log('User added/removed to/from the group:', isUserAdded);
          navigateTo(`/home/groups/${groupId}`)
        } else {

          console.error('Failed to add/remove user to/from the group');
          setIsLoading(false);
        }
      } catch (error) {

        console.error('Error adding/removing user to/from the group:', error);
        setIsLoading(false);
      }
    };

    function formatDate(isoDate) {
      const date = new Date(isoDate);

      // Extract day, month, and year
      const day = date.getDate();
      const month = date.toLocaleString('default', { month: 'long' }); // Full month name
      const year = date.getFullYear();

      // Determine the day suffix
      const suffix = (d) => {
        if (d > 3 && d < 21) return "th"; // Special case for 11th to 19th
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
        approved: group.groupType == "Public" ? true : false
      }
      axios.post(`${process.env.REACT_APP_API_URL}/groupMember/add`, data)
        .then((res) => {
          // console.log(res.data);
         if(group.groupType == "Public") navigateTo(`/home/groups/${group._id}`)
          else{
            toast.success('Request sent successfully!');
            fetchJoin()
          }
          setConfirmModal(false);

        })
        .catch((err) => {
          console.log(err);
        })
    }

    const ConfirmModalShow = () => {
      return (
        <>
          <Modal
            show={confirmModal}
            onHide={() => setConfirmModal(false)}
            centered
          >
            <Modal.Header closeButton>
              <Modal.Title className="text-lg font-bold">Join Group</Modal.Title>
            </Modal.Header>
            <Modal.Body className="flex justify-center align-center py-5">
              <p className="text-xl font-semibold">Are you sure you want to join <span className='font-semibold text-blue-500 underline text-2xl capitalize'>{group.groupName}</span>?</p>
            </Modal.Body>
            <Modal.Footer className="flex justify-center">
              <Button className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-1 px-4 rounded" onClick={() => setConfirmModal(false)}>
                Cancel
              </Button>
              <Button className='bg-blue-950 hover:bg-blue-900 text-white font-semibold py-1 px-4 rounded' onClick={() => handleJoinGroup(group._id)}>
                Join
              </Button>
            </Modal.Footer>
          </Modal>
        </>
      )
    }

    const directEntry = (isMember && approved) || profile.profileLevel === 0

    return (
      <div key={group._id} className='w-full'>
        <div className="w-full min-h-80 border border-gray-300 bg-[#EAF5EF] rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
          {(directEntry)? (
            <Link to={`/home/groups/${group._id}`} className="text-black">
              <div className="relative w-full h-48 rounded-t-lg overflow-hidden">
                <div
                  className="w-full h-full bg-cover bg-center"
                  style={{
                    backgroundImage: `url(${group.groupPicture || group.groupLogo || groupPic})`,
                  }}
                ></div>
                <p className="absolute top-3 right-5 bg-white text-black px-5 py-1 border border-gray-400 text-xs font-medium rounded-lg">
                  {group.groupType}
                </p>
              </div>
              <div className="px-4 py-2">
                <h3 className="text-xl font-semibold text-[#136175]">
                  {group.groupName}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <img src={groupMembers} alt="Members" className="w-5 h-5" />
                  <p className="text-gray-600 text-sm">{group.members.length}</p>
                </div>
                <p className="text-gray-500 text-xs mt-2">{formatDate(group.createdAt)}</p>
                <div className='mt-3 flex justify-end'>
                  <button onClick={() => navigateTo(`/home/groups/${group._id}`)} className='text-white cursor-pointer bg-[#136175] hover:bg-[#136175] focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center'>View Group</button>

                </div>
              </div>
            </Link>
          ) : (
            <div>
              <div className="relative w-full h-48 rounded-t-lg overflow-hidden">
                <div
                  className="w-full h-full bg-cover bg-center"
                  style={{
                    backgroundImage: `url(${group.groupPicture || group.groupLogo || groupPic})`,
                  }}
                ></div>
                <p className="absolute top-3 right-5 bg-white text-black px-5 py-1 border border-gray-400 text-xs font-medium rounded-lg">
                  {group.groupType}
                </p>
              </div>
              <div className="px-4 py-2">
                <h3 className="text-xl font-semibold text-[#136175]">
                  {group.groupName}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <img src={groupMembers} alt="Members" className="w-5 h-5" />
                  <p className="text-gray-600 text-sm">{group.members.length}</p>
                </div>
                <p className="text-gray-500 text-xs mt-2">{formatDate(group.createdAt)}</p>
                <div className='mt-3 flex justify-end'>
                  {
                    (isMember && approved==false) ? (
                      <>
                        <button  className='text-white cursor-pointer bg-[#136175] hover:bg-[#136175] focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center'>Requested</button>

                      </>
                    ) : (
                      <>
                        <button onClick={() => setConfirmModal(true)} className='text-white cursor-pointer bg-[#136175] hover:bg-[#136175] focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center'>{group?.groupType === 'Public' ? 'Join' : 'Request'}</button>

                      </>
                    )
                  }
                </div>
              </div>

            </div>
          )}
        </div>

        {/* {console.log('groupType', group.groupType, group.members)} */}
        <ConfirmModalShow show={confirmModal} onHide={() => setConfirmModal(false)} />
        <MyVerticallyCenteredModal
          show={modalShow}
          onHide={() => setModalShow(false)}
        />
      </div>
    );
  };


  let filteredGroups;
  if (profile.department === 'All') {
    filteredGroups = groups;
  } else {

    filteredGroups = groups.filter(group => group.groupType === 'Public' || (group.groupType === 'Private' && profile.department === group.department) || group.category === 'Business Connect' || group.department === 'All');
  }


  return (
    <div className="">
      {loading ? (
        <div style={{ display: 'flex', width: '100%', height: '40vh', alignItems: 'center', justifyContent: 'center' }}>
          <l-line-spinner
            size="40"
            stroke="3"
            speed="1"
            color="black"
          ></l-line-spinner>
        </div>

      ) : filteredGroups.length > 0 ?
        <div className='grid grid-cols-1 md:grid-cols-3  px-2 py-3 gap-6'>
          {filteredGroups.map((group) => <GroupItem key={group._id} group={group} />)}
        </div>
        : (
          <div className='display-post-noGroups'>No groups</div>
        )}


    </div>
  );
};

export default DisplayPost;
