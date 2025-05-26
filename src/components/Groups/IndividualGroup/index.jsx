import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import picture from '../../../images/placement-banner-1.jpg';
import { Link } from "react-router-dom";
import './IndividualGroup.css';
import SocialMediaPost from "../../Social-wall-post";
import { IoMdInformationCircle } from 'react-icons/io';
import { MdGroup, MdFeed } from 'react-icons/md';
import { BsGlobeAmericas, BsFillTagFill } from 'react-icons/bs';
import { IoIosAdd } from "react-icons/io";
import { Route, Routes } from "react-router-dom";
import { AddMembers } from "../AddMembers";
import { useSelector, useDispatch } from "react-redux";
import { FcInvite } from "react-icons/fc";
import { GroupInvite } from "../GroupInvite";
import { JoinGroup } from "../JoinGroup";
import profilePic from "../../../images/profilepic.jpg";
import baseUrl from "../../../config";
import LinkIcon from "../../../images/Link.svg";
import Add from "../../../images/Add.svg";
import { updateProfile } from "../../../store/profileSlice";
import { toast } from "react-toastify";
import GroupMembers from "../GroupMembers";
import editProfilePicture from "../../../images/edit-profile-picture.svg";
import { useCookies } from "react-cookie";
import { lineSpinner } from 'ldrs';
import searchIcon from "../../../images/search.svg"
lineSpinner.register()

const IndividualGroup = () => {
    const { _id } = useParams();
    const [group, setGroup] = useState([]);
    const [groupMembers, setGroupMembers] = useState(null);
    const profile = useSelector((state) => state.profile);
    const [isLoading, setIsLoading] = useState({});
    const dispatch = useDispatch();
    const [showModal, setShowModal] = useState(false);
    // const allPendingReq = useSelector((state) => state.member);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [sendMembers, setSendMembers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(false);
    const [cookie, setCookie] = useCookies(["token"]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [saving, setSaving] = useState(false);
    const [postCount, setPostCount] = useState(0);
    const [allPendingReq, setAllPendingReq] = useState([]);
    const [allMembers, setAllMembers] = useState([]);
    const token = cookie.token;
    let admin;
    if (profile.profileLevel === 0) {
        admin = true;
    }

    const getGroup = async () => {
        try {
            setPageLoading(true);
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/groups/${_id}`);
            setGroup([response.data]);
            setGroupMembers(response.data.members)
            setSelectedMembers(response.data.members.map(member => ({
                userId: member.userId,
                profilePicture: member.profilePicture,
                userName: member.userName
            })));
            setPageLoading(false);
        } catch (error) {
            console.error("Error fetching group details:", error);
            setPageLoading(false);
        }
    }

    useEffect(() => {
        getGroup();
    }, []);

    const handleFollow = async (memberId) => {
        setIsLoading(prev => ({ ...prev, [memberId]: true }));
        setTimeout(() => {
            setIsLoading(prev => ({ ...prev, [memberId]: false }));
        }, 2000);
    };

    const handleFollowToggle = async (memberId, userName) => {
        setIsLoading(prevLoading => ({ ...prevLoading, [memberId]: true }));
        console.log('firstname lastname', userName)
        try {
            const response = await axios.patch(`${process.env.REACT_APP_API_URL}/alumni/${memberId}/follow`, {
                userId: profile._id,
                requestedUserName: `${profile.firstName} ${profile.lastName}`,
                followedUserName: userName
            });

            if (response.status === 200) {
                const responseData = await response.data;
                const { alumni } = responseData;
                dispatch(updateProfile(alumni));
            }
            setIsLoading(prevLoading => ({ ...prevLoading, [memberId]: false }));
        } catch (error) {
            console.error("Error toggling follow status:", error);
            setIsLoading(prevLoading => ({ ...prevLoading, [memberId]: false }));
        }
    };

    const isFollowing = (memberId) => {
        return profile.following.some(follower => follower.userId === memberId);
    }

    // const filteredMembers = allPendingReq.filter(member =>
    //     member.firstName.toLowerCase().includes(searchTerm.toLowerCase())
    // );

    const handleMemberSelect = (memberId, profilePicture, firstName, lastName, profileLevel) => {
        console.log('member id', memberId);
        setSelectedMembers((prevSelected) => {
            const memberIndex = prevSelected.findIndex((member) => member.userId === memberId);

            if (memberIndex !== -1) {
                return prevSelected.filter((member) => member.userId !== memberId);
            } else {
                return [
                    ...prevSelected,
                    {
                        userId: memberId,
                        profilePicture: profilePicture,
                        userName: `${firstName} ${lastName}`,
                        profileLevel: profileLevel
                    }
                ];
            }
        });
        setSendMembers((prevSelected) => {
            const memberIndex = prevSelected.findIndex((member) => member.userId === memberId);

            if (memberIndex !== -1) {
                return prevSelected.filter((member) => member.userId !== memberId);
            } else {
                return [
                    ...prevSelected,
                    {
                        userId: memberId,
                        profilePicture: profilePicture,
                        userName: `${firstName} ${lastName}`,
                        profileLevel: profileLevel
                    }
                ];
            }
        });
    };


    const handleSaveMembers = async () => {
        console.log('selectedMembers', sendMembers, group[0]._id)
        try {
            setSaving(true);
            const response = await axios.put(
                `${process.env.REACT_APP_API_URL}/groups/members/${group[0]._id}`,
                {
                    members: sendMembers,
                }
            );
            setShowModal(false);
            setSendMembers([]);
            getGroup();
            toast.success('Group updated successfully!');
            setSaving(false);
        } catch (error) {
            console.error('Error updating members:', error);
            toast.error('Failed to update members.');
            setSaving(false);
        }
    };

    const handleFileChange = (event, fileType) => {
        const file = event.target.files[0];
        const api = `${process.env.REACT_APP_API_URL}/uploadImage/singleImage`

        const formData = new FormData();
        formData.append('image', file);
        axios.post(api, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
            .then((res) => {
                handleSubmit(res.data?.imageUrl, fileType);
            }).catch((err) => {
                setLoading(false);
                toast.dismiss()
                toast.error('Upload failed');
            })

    };

    const handleSubmit = async (fileData, fileType) => {
        setLoading(true);
        if (!fileData) {
            alert('Please select an image to upload.');
            setLoading(false);
            return;
        }

        try {
            const response = await axios.put(`${process.env.REACT_APP_API_URL}/groups/${_id}`, {
                [fileType]: fileData
            }, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.status === 200) {
                const responseData = await response.data;
                console.log('response data', responseData)
                setLoading(false);
                getGroup();
                toast.success(`${fileType === 'groupPicture' ? 'Group Picture' : fileType === 'coverPicture' ? 'Cover Picture' : 'Image'} updated successfully.`);
            } else {
                alert('Failed to update cover picture.');
                setLoading(false);
            }
        } catch (error) {
            console.error('Error updating cover picture:', error);
            alert('An error occurred while updating the cover picture.');
            setLoading(false)
        }
    };

    const countPost = () => {
        const api = `${process.env.REACT_APP_API_URL}/groups/groups/${_id}`
        axios.get(api).then((res) => {
            setPostCount(res.data.total)
        }).catch((err) => {
            console.log(err)
        })
    }
    const getAllPendingReq = () => {
        if (_id) {
            const api = `${process.env.REACT_APP_API_URL}/groupMember/pending/${_id}`
            axios.get(api).then((res) => {
                setAllPendingReq(res.data)
            }).catch((err) => {
                console.log(err)
            })
        }
    }

    useEffect(() => {
        getGroup();
        countPost();
        getAllPendingReq()
        getAllMemberOfGroup()
    }, []);

    const handleDecline = (userId) => {
        const api = `${process.env.REACT_APP_API_URL}/groupMember/decline/${_id}/${userId}`
        axios.put(api).then((res) => {
            getAllPendingReq()
            getGroup()
        })
            .catch((err) => {
                console.log(err)
            })
    }

    const handleAccept = (userId) => {
        const api = `${process.env.REACT_APP_API_URL}/groupMember/accept/${_id}/${userId}`
        axios.put(api).then((res) => {
            getAllPendingReq()
            getGroup()
        }).catch((err) => {
            console.log(err)
        })
    }

    const getAllMemberOfGroup = () => {
        if (_id) {
            const api = `${process.env.REACT_APP_API_URL}/groupMember/all/${_id}`
            axios.get(api).then((res) => {
                setAllMembers(res.data)
            }).catch((err) => {
                console.log(err)
            })
        }
    }
    return (
        <div style={{ width: '100%' }}>
            <Routes>
                <Route exact path="*" element={<>
                    {pageLoading ?
                        <div style={{ textAlign: 'center' }}>
                            <l-line-spinner
                                size="30"
                                stroke="3"
                                speed="1"
                                color="black"
                            ></l-line-spinner>
                        </div>
                        : group.map((groupItem) => (
                            <div key={groupItem._id} className="ig-container">
                                <div className="container-div" style={{ width: '100%', borderRadius: '12px', position: 'relative' }}>
                                    <div className="upper-div" style={{
                                        backgroundImage: `url(${groupItem.groupBackground ? groupItem.groupBackground : picture})`,
                                        width: '100%',
                                        minHeight: '35vh',
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center',
                                        borderRadius: '12px 12px 0px 0px'
                                    }}>
                                        <div className="message-follow" style={{ display: 'flex', justifyContent: 'end', paddingTop: '20px', paddingRight: '50px' }}>
                                            {(profile._id === groupItem.userId || admin) && <Link to={`/home/groups/edit/${_id}`}>
                                                <button className="bg-white border-2 border-green-600 w-full py-1 px-3 font-semibold text-lg rounded-xl shadow-lg text-gray-600 hover:scale-105">Edit</button>
                                            </Link>}
                                        </div>
                                    </div>
                                    <div className="absolute top-[22vh] left-1/2 transform -translate-x-1/2">
                                        <div className="relative w-[160px] h-[160px] ">
                                            <img
                                                src={groupItem.groupLogo ? groupItem.groupLogo : profilePic}
                                                alt="profile-picture"
                                                className="w-full h-full rounded-full border-4 border-white object-cover"
                                            />

                                            <input
                                                type="file"
                                                name="profilePicture"
                                                id="profilePicture"
                                                className="hidden"
                                                onChange={(event) => handleFileChange(event, 'groupLogo')}
                                            />

                                            <img
                                                src={editProfilePicture}
                                                alt="edit-icon"
                                                className="w-8 h-8 rounded-full border-4 border-white absolute top-2 right-2 cursor-pointer"
                                                onClick={() => document.getElementById('profilePicture').click()}
                                            />

                                            {loading && (
                                                <div className="absolute inset-0 flex items-center justify-center bg-white/70 rounded-full">
                                                    <l-line-spinner
                                                        size="30"
                                                        stroke="3"
                                                        speed="1"
                                                        color="black"
                                                    ></l-line-spinner>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="bg-gray-200  rounded-b-lg pt-[80px] md:pt-[50px] pb-[40px] mb-4" >
                                        <div className="md:flex justify-between items-center grid grid-cols-1 ">
                                            <div className="px-6 py-8 md:py-0" >
                                                <p style={{ fontWeight: '600', color: '#3A3A3A', fontSize: '24px', fontFamily: 'Inter', textAlign: 'left' }}>{groupItem.groupName}</p>
                                                <p style={{ textAlign: 'left', display: 'flex', alignItems: 'center' }}><BsGlobeAmericas style={{ color: '#7a7a7a' }} />&nbsp;&nbsp;{groupItem.groupType}</p>
                                                <p style={{ textAlign: 'left', display: 'flex', alignItems: 'center' }}>
                                                    <BsFillTagFill style={{ color: '#7a7a7a' }} />&nbsp;&nbsp;{groupItem.category}
                                                </p>
                                            </div>
                                            <div className="flex md:flex-row   justify-between gap-8 px-6">
                                                <div>
                                                    <p style={{ fontWeight: '400', fontSize: '14px', fontFamily: 'Inter' }}>Posts</p>
                                                    <p style={{ fontWeight: '500', fontSize: '18px', fontFamily: 'Inter' }}>{postCount}</p>
                                                </div>
                                                <div>
                                                    <p style={{ fontWeight: '400', fontSize: '14px', fontFamily: 'Inter' }}>Members</p>
                                                    <p style={{ fontWeight: '500', fontSize: '18px', fontFamily: 'Inter' }}>{allMembers?.length}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div >
                                <div className="ig-lower-container">
                                    <Routes>
                                        <Route exact path="/" element={<div style={{ width: '65%' }}>
                                            <SocialMediaPost style={{ marginLeft: '0px' }} showCreatePost={true} groupID={_id} />
                                        </div>} />
                                        <Route exact path="/groupInvite" element={<div style={{ width: '65%', paddingTop: '50px' }}>
                                            <GroupInvite />
                                        </div>} />
                                        <Route exact path="/invite" element={<div style={{ width: '65%' }}>
                                            <JoinGroup />
                                        </div>} />
                                    </Routes>
                                    <div style={{ width: '35%', paddingTop: '50px', paddingBottom: '100px' }}>

                                        {
                                            ((profile._id === groupItem.userId || admin) && groupItem.groupType === 'Private') &&
                                            <div className="mb-8">
                                                <div className="sideWidget2-post-header">
                                                    <p style={{ marginBottom: '0rem', fontWeight: '500', fontSize: '20px' }}>Group Join Request</p>
                                                </div>
                                                <div className="flex flex-col gap-2 bg-[#F5F5F5] p-4 rounded-lg  max-h-[500px] overflow-y-auto">
                                                    {
                                                        allPendingReq?.length > 0 ?
                                                            allPendingReq?.map((member, index) => (
                                                                <div className="flex flex-col  gap-2 py-2 text-lg bg-white px-4 rounded-lg " key={index}>

                                                                    <div className="flex gap-2 items-center">
                                                                        <img src={member?.userId?.profilePicture} alt="" className="w-10 h-10 rounded-full border-4 border-white" />
                                                                        <p className="font-semibold text-base">{member?.userId?.firstName + ' ' + member?.userId?.lastName}</p>

                                                                    </div>

                                                                    <div className="flex gap-2 justify-start">
                                                                        <button className="bg-[#0A3A4C] text-xs hover:bg-blue-900 text-white font-semibold py-1 px-4 rounded" onClick={() => handleAccept(member.userId?._id)}>
                                                                            Accept
                                                                        </button>
                                                                        <button className="bg-red-900 text-xs hover:bg-red-950 text-white font-semibold py-1 px-4 rounded" onClick={() => handleDecline(member.userId?._id)}>
                                                                            Decline
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            ))
                                                            :
                                                            <p className="text-gray-500 text-sm">No group join requests</p>
                                                    }

                                                </div>

                                            </div>
                                        }

                                        {

                                        }
                                        <div className="ig-lc-card">
                                            {
                                                (profile._id === groupItem.userId || admin) &&
                                                <div>
                                                    <ul className="flex flex-col gap-4 bg-[#F5F5F5] p-4 rounded-lg ">
                                                       

                                                        <Link to={`/home/groups/${_id}/groupInvite`} className="text-blue-500 underline font-semibold">
                                                            <li className="flex items-center gap-2 py-2 text-lg" >
                                                                <img src={LinkIcon} alt="" />
                                                                Generate a Group Link</li>
                                                        </Link>
                                                    </ul>
                                                </div>
                                            }
                                        </div>



                           <div className="mb-8 mt-8">
                                                <div className="sideWidget2-post-header">
                                                    <p style={{ marginBottom: '0rem', fontWeight: '500', fontSize: '20px' }}>Group Members</p>
                                                </div>
                                                <div className="flex flex-col gap-2 bg-[#F5F5F5] p-4 rounded-lg  max-h-[500px] overflow-y-auto">
                                                    {
                                                        allMembers?.length > 0 ?
                                                            allMembers?.map((member, index) => (
                                                                <div className="flex flex-col  gap-2 py-2 text-lg bg-white px-4 rounded-lg " key={index}>

                                                                    <div className="flex gap-2 items-center">
                                                                        <img src={member?.userId?.profilePicture} alt="" className="w-10 h-10 rounded-full border-4 border-white" />
                                                                        <p className="font-semibold text-base">{member?.userId?.firstName + ' ' + member?.userId?.lastName}</p>

                                                                    </div>

                                                                   
                                                                </div>
                                                            ))
                                                            :
                                                            <p className="text-gray-500 text-sm">No group members </p>
                                                    }

                                                </div>

                                            </div>
                                    </div>
                                </div>
                                {/* {showModal && (
                                    <div className="modal-overlay-forum">
                                        <div className="modal-forum">
                                            <div className="modal-header-forum">
                                                <div>
                                                    <h2>Manage Members</h2>
                                                    <p>Add/Remove Members</p>
                                                </div>
                                                <button className="close-button"
                                                    style={{ fontSize: 'larger', fontFamily: 'Inter', color: '#0a3a4c' }}
                                                    onClick={() => {
                                                        setShowModal(false);
                                                    }
                                                    }>X</button>
                                            </div>
                                            <div style={{ position: 'relative' }}>
                                                <input
                                                    type="text"
                                                    placeholder="Search people"
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                    className="search-input"
                                                    style={{ backgroundColor: '#efeff0' }}
                                                />
                                                <img src={searchIcon} alt="" srcset="" style={{ position: 'absolute', top: '10px', right: '10px' }} />
                                            </div>
                                            <ul className="members-list">
                                                {filteredMembers.map((member, index) => (
                                                    <li key={index} className="member-item">
                                                        <div className="member-info">
                                                            <img src={member.profilePicture ? member.profilePicture : profilePic} alt="avatar" className="member-avatar" />
                                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                                <span>{member.firstName}</span>
                                                                <span className="member-role">{member.profileLevel === 0 ? 'Super Admin' : member.profileLevel === 1 ? 'Admin' : member.profileLevel === 2 ? 'Alumni' : 'Student'}</span>
                                                            </div>
                                                        </div>
                                                        <input
                                                            type="checkbox"
                                                            checked={
                                                                selectedMembers.some((selectedMember) => selectedMember.userId === member._id)
                                                            }
                                                            onChange={() => handleMemberSelect(member._id, member.profilePicture, member.firstName, member.lastName, member.profileLevel)}
                                                            disabled={
                                                                member._id === groupItem.userId ||
                                                                member._id === '677e42e03041d82e4b54fdf6'
                                                            }
                                                        />

                                                    </li>
                                                ))}
                                            </ul>
                                            <button className="save-button"
                                                onClick={handleSaveMembers}
                                            >
                                                {saving ? 'Saving...' : 'Save'}</button>
                                        </div>
                                    </div>
                                )} */}
                            </div>
                        ))}
                </>} />
                <Route path="/add" element={<>
                    <GroupMembers members={groupMembers} />
                </>} />
                {/* <Route path="/groupInvite" element={<div style={{ width: '65%' }}>
                    <GroupInvite />
                </div>} />
                <Route path="/invite" element={<div style={{ width: '65%' }}>
                    <JoinGroup />
                </div>} /> */}
            </Routes>
        </div>
    );
}

export default IndividualGroup;
