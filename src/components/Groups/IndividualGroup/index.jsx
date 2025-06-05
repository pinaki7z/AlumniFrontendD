import { useNavigate, useParams } from "react-router-dom";
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
    const navigate = useNavigate()
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
    const [isMember, setIsMember] = useState(false);
    const [isApproved, setIsApproved] = useState(false);
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

    const checkIsMember = () => {
        axios.get(`${process.env.REACT_APP_API_URL}/groupMember/isMember/${_id}/${profile._id}`).then((res) => {
            // if (res.data.isMember === true && res.data.approved === true) {
            setIsMember(res.data.isMember)
            setIsApproved(res.data.approved)
            // }
        })
    }

    useEffect(() => {
        getGroup();
        checkIsMember();
    }, []);


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

    const handleJoinGroup = () => {
        // console.log("group", group);
        const data = {
            groupId: _id,
            userId: profile._id,
            approved: group[0].groupType == "Public" ? true : false
        }
        axios.post(`${process.env.REACT_APP_API_URL}/groupMember/add`, data)
            .then((res) => {
                // console.log(res.data);
                if (group[0].groupType == "Public") navigate(`/home/groups`)
                else {
                    toast.success('Request sent successfully!');
                    // fetchJoin()
                }
                navigate(`/home/groups/suggested-groups`)

                //   setConfirmModal(false);

            })
            .catch((err) => {
                console.log(err);
            })
    }

    const handleCancelModal = () => {
        navigate(`/home/groups/suggested-groups`)
    }


    const hideBlurGroup = (admin || isMember || profile._id === group.userId);
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
                                        <div className="md:flex relative justify-between items-center grid grid-cols-1 ">
                                            <div className="px-6 py-8 md:py-0" >
                                                <p style={{ fontWeight: '600', color: '#3A3A3A', fontSize: '24px', fontFamily: 'Inter', textAlign: 'left' }}>{groupItem.groupName}</p>
                                                <p style={{ textAlign: 'left', display: 'flex', alignItems: 'center' }}><BsGlobeAmericas style={{ color: '#7a7a7a' }} />&nbsp;&nbsp;{groupItem.groupType}</p>
                                                <p style={{ textAlign: 'left', display: 'flex', alignItems: 'center' }}>
                                                    <BsFillTagFill style={{ color: '#7a7a7a' }} />&nbsp;&nbsp;{groupItem.category}
                                                </p>
                                            </div>

                                            {(isMember && !isApproved) && <div className="absolute top-1/2 right-[44.5%] px-2 py-1 bg-green-600 text-white rounded-lg text-lg md:text-2xl font-semibold">Request Sent</div>}

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

                                {/* show join group modal */}
                                {!hideBlurGroup && (
                                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
                                        <div className="bg-white p-6 rounded-lg shadow-lg md:w-1/3">
                                            <h2 className="text-xl font-semibold mb-4">Join Group</h2>
                                            <p className="mb-6">Would you like to join this group?</p>
                                            <div className="flex justify-end gap-4">
                                                <button
                                                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                                                    onClick={handleJoinGroup}
                                                >
                                                    Join Group
                                                </button>
                                                <button
                                                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                                                    onClick={handleCancelModal}
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                    {/* <div className="md:col-span-2"> */}
                                    <div className={`md:col-span-2   ${((isMember && isApproved) || profile._id === groupItem.userId || admin) ? "" : "blur-lg pointer-events-none select-none h-[500px]"}`} >

                                        <Routes >
                                            <Route exact path="/" element={<div >
                                                <SocialMediaPost style={{ marginLeft: '0px' }} showCreatePost={true} groupID={_id} />
                                            </div>} />
                                            <Route exact path="/groupInvite" element={<div style={{ width: '65%', paddingTop: '50px' }}>
                                                <GroupInvite />
                                            </div>} />
                                            <Route exact path="/invite" element={<div >
                                                <JoinGroup />
                                            </div>} />
                                        </Routes>
                                    </div>



                                    {/* right side content */}
                                    <div className="md:col-span-1">

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

                            </div>
                        ))}
                </>} />
                <Route path="/add" element={<>
                    <GroupMembers members={groupMembers} />
                </>} />

            </Routes>
        </div>
    );
}

export default IndividualGroup;
