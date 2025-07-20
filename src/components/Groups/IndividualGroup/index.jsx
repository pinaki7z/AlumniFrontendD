"use client"

import { useNavigate, useParams } from "react-router-dom"
import { useState, useEffect } from "react"
import axios from "axios"
import picture from "../../../images/placement-banner-1.jpg"
import { Link } from "react-router-dom"
import SocialMediaPost from "../../Social-wall-post"
import { Users, Globe, Lock, Tag, Camera, Check, X, Loader2, UserPlus, Settings, Mail, Info } from "lucide-react"
import { Route, Routes } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { GroupInvite } from "../GroupInvite"
import { JoinGroup } from "../JoinGroup"
import profilePic from "../../../images/profilepic.jpg"
import { toast } from "react-toastify"
import GroupMembers from "../GroupMembers"
import { useCookies } from "react-cookie"
import { lineSpinner } from "ldrs"
import { Modal, Button } from "react-bootstrap" // Keeping existing modal

lineSpinner.register()

// Placeholder imports/declarations for variables not provided in the snippet
// You should replace these with your actual imports or declarations
// const profile = { _id: "user123", profileLevel: 2, firstName: "John", lastName: "Doe" } // Example profile
const notificationList = [] // Example notification list
const selectedGroupUserId = "owner123" // Example
const selectedGroupId = "group456" // Example
const selectedGroupName = "Example Group" // Example
const getRequest = () => console.log("getRequest called") // Example function
const navigateTo = (path) => console.log("Navigate to:", path) // Example function
const handleRequest = () => console.log("handleRequest called") // Example function

const IndividualGroup = () => {
  const navigate = useNavigate()
  const { _id } = useParams()
  const [group, setGroup] = useState([])
  const [groupMembers, setGroupMembers] = useState(null)
  const profile = useSelector((state) => state.profile); // Uncomment if using Redux
  const [isLoading, setIsLoading] = useState({})
  const dispatch = useDispatch()
  const [showModal, setShowModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedMembers, setSelectedMembers] = useState([])
  const [sendMembers, setSendMembers] = useState([])
  const [loading, setLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(false)
  const [cookie, setCookie] = useCookies(["token"])
  const [selectedFile, setSelectedFile] = useState(null)
  const [saving, setSaving] = useState(false)
  const [postCount, setPostCount] = useState(0)
  const [allPendingReq, setAllPendingReq] = useState([])
  const [allMembers, setAllMembers] = useState([])
  const [isMember, setIsMember] = useState(false)
  const [isApproved, setIsApproved] = useState(false)
  const token = cookie.token

  let admin
  if (profile.profileLevel === 0) {
    admin = true
  }

  const getGroup = async () => {
    try {
      setPageLoading(true)
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/groups/${_id}`)
      setGroup([response.data])
      setGroupMembers(response.data.members)
      setSelectedMembers(
        response.data.members.map((member) => ({
          userId: member.userId,
          profilePicture: member.profilePicture,
          userName: member.userName,
        })),
      )
      setPageLoading(false)
    } catch (error) {
      console.error("Error fetching group details:", error)
      setPageLoading(false)
    }
  }

  const checkIsMember = () => {
    axios.get(`${process.env.REACT_APP_API_URL}/groupMember/isMember/${_id}/${profile._id}`).then((res) => {
      setIsMember(res.data.isMember)
      setIsApproved(res.data.approved)
    })
  }

  useEffect(() => {
    getGroup()
    checkIsMember()
  }, [])

  const handleFileChange = (event, fileType) => {
    const file = event.target.files[0]
    const api = `${process.env.REACT_APP_API_URL}/uploadImage/singleImage`
    const formData = new FormData()
    formData.append("image", file)
    axios
      .post(api, formData, { headers: { "Content-Type": "multipart/form-data" } })
      .then((res) => {
        handleSubmit(res.data?.imageUrl, fileType)
      })
      .catch((err) => {
        setLoading(false)
        toast.dismiss()
        toast.error("Upload failed")
      })
  }

  const handleSubmit = async (fileData, fileType) => {
    setLoading(true)
    if (!fileData) {
      alert("Please select an image to upload.")
      setLoading(false)
      return
    }
    try {
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/groups/${_id}`,
        {
          [fileType]: fileData,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      )
      if (response.status === 200) {
        const responseData = await response.data
        console.log("response data", responseData)
        setLoading(false)
        getGroup()
        toast.success(
          `${fileType === "groupPicture" ? "Group Picture" : fileType === "coverPicture" ? "Cover Picture" : "Image"} updated successfully.`,
        )
      } else {
        alert("Failed to update cover picture.")
        setLoading(false)
      }
    } catch (error) {
      console.error("Error updating cover picture:", error)
      alert("An error occurred while updating the cover picture.")
      setLoading(false)
    }
  }

  const countPost = () => {
    const api = `${process.env.REACT_APP_API_URL}/groups/groups/${_id}`
    axios
      .get(api)
      .then((res) => {
        setPostCount(res.data.total)
      })
      .catch((err) => {
        console.log(err)
      })
  }

  const getAllPendingReq = () => {
    if (_id) {
      const api = `${process.env.REACT_APP_API_URL}/groupMember/pending/${_id}`
      axios
        .get(api)
        .then((res) => {
          setAllPendingReq(res.data)
        })
        .catch((err) => {
          console.log(err)
        })
    }
  }

  useEffect(() => {
    getGroup()
    countPost()
    getAllPendingReq()
    getAllMemberOfGroup()
  }, [])

  const handleDecline = (userId) => {
    const api = `${process.env.REACT_APP_API_URL}/groupMember/decline/${_id}/${userId}`
    axios
      .put(api)
      .then((res) => {
        getAllPendingReq()
        getGroup()
      })
      .catch((err) => {
        console.log(err)
      })
  }

  const handleAccept = (userId) => {
    const api = `${process.env.REACT_APP_API_URL}/groupMember/accept/${_id}/${userId}`
    axios
      .put(api)
      .then((res) => {
        getAllPendingReq()
        getGroup()
      })
      .catch((err) => {
        console.log(err)
      })
  }

  const getAllMemberOfGroup = () => {
    if (_id) {
      const api = `${process.env.REACT_APP_API_URL}/groupMember/all/${_id}`
      axios
        .get(api)
        .then((res) => {
          setAllMembers(res.data)
        })
        .catch((err) => {
          console.log(err)
        })
    }
  }

  const handleJoinGroup = () => {
    const data = {
      groupId: _id,
      userId: profile._id,
      approved: group[0].groupType == "Public" ? true : false,
    }
    axios
      .post(`${process.env.REACT_APP_API_URL}/groupMember/add`, data)
      .then((res) => {
        if (group[0].groupType == "Public") navigate(`/home/groups`)
        else {
          toast.success("Request sent successfully!")
        }
        navigate(`/home/groups/suggested-groups`)
      })
      .catch((err) => {
        console.log(err)
      })
  }

  const handleCancelModal = () => {
    navigate(`/home/groups/suggested-groups`)
  }

  const hideBlurGroup = admin || isMember || profile._id === group.userId

  function MyVerticallyCenteredModal(props) {
    return (
      <Modal {...props} size="lg" aria-labelledby="contained-modal-title-vcenter" centered className="custom-modal">
        <Modal.Header closeButton className="border-b border-gray-200 bg-gray-50">
          <Modal.Title id="contained-modal-title-vcenter" className="text-xl font-bold text-gray-900">
            Verify your Business
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Info className="text-blue-600" size={20} />
              <h4 className="text-lg font-semibold text-gray-900">Upload a document:</h4>
            </div>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
              <input
                type="file"
                name="businessVerification"
                id="businessVerification"
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer className="border-t border-gray-200 bg-gray-50">
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
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg border-0 transition-colors"
          >
            Submit
          </Button>
          <Button
            onClick={props.onHide}
            className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-6 rounded-lg border-0 transition-colors"
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    )
  }

  return (
    <div className="w-full min-h-screen ">
      <Routes>
        <Route
          exact
          path="*"
          element={
            <>
              {pageLoading ? (
                <div className="flex flex-col justify-center items-center min-h-screen">
                  <div className="bg-white p-8 rounded-2xl ">
                    <l-line-spinner size="40" stroke="3" speed="1" color="#3b82f6"></l-line-spinner>
                  </div>
                    <p className="mt-1 text-gray-600 font-semibold text-lg md:text-xl">Loading group...</p>
                </div>
              ) : (
                group.map((groupItem) => (
                  <div key={groupItem._id} className="max-w-7xl mx-auto">
                    {/* Header Section */}
                    <div className=" rounded-2xl shadow-lg overflow-hidden mb-6">
                      {/* Cover Image and Profile Picture (overlapping) */}
                      <div
                        className="relative w-full h-64 md:h-80 bg-cover bg-center"
                        style={{
                          backgroundImage: `url(${groupItem.groupBackground ? groupItem.groupBackground : picture})`,
                        }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>

                        {/* Edit Button */}
                        {(profile._id === groupItem.userId || admin) && (
                          <div className="absolute top-6 right-6">
                            <Link to={`/home/groups/edit/${_id}`}>
                              <button className="bg-white/90 backdrop-blur-sm hover:bg-white text-gray-800 font-semibold py-2 px-4 rounded-xl shadow-lg transition-all duration-200 flex items-center gap-2">
                                <Settings size={16} />
                                Edit Group
                              </button>
                            </Link>
                          </div>
                        )}

                        {/* Profile Picture - positioned relative to the cover image */}
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 md:translate-y-1/2 lg:left-8 lg:translate-x-0">
                          <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white shadow-xl overflow-hidden bg-white">
                            <img
                              src={groupItem.groupLogo ? groupItem.groupLogo : profilePic}
                              alt="Group Logo"
                              className="w-full h-full object-cover"
                            />
                          </div>

                          {/* Edit Profile Picture Button and Loading Spinner */}
                          {(profile._id === groupItem.userId || admin) && (
                            <>
                              <input
                                type="file"
                                name="profilePicture"
                                id="profilePicture"
                                className="hidden"
                                onChange={(event) => handleFileChange(event, "groupLogo")}
                              />
                              <button
                                onClick={() => document.getElementById("profilePicture").click()}
                                className="absolute bottom-0 right-0 w-10 h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-colors"
                              >
                                <Camera size={16} />
                              </button>
                            </>
                          )}

                          {loading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-full">
                              <l-line-spinner size="30" stroke="3" speed="1" color="#3b82f6"></l-line-spinner>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Group Info - adjusted padding to make space for profile pic */}
                      <div className="px-6 pb-8 pt-16 md:pt-20 lg:pt-4 lg:pl-48">
                        <div className="md:ml-6 flex flex-col md:flex-row justify-between items-center gap-6 lg:items-start">
                          <div className="text-center md:text-left">
                            <h1 className="  text-2xl md:text-3xl font-bold text-gray-900 mb-3">{groupItem.groupName}</h1>

                            <div className="flex flex-col sm:flex-row gap-4 mb-4">
                              <div className="flex items-center justify-center md:justify-start gap-2 text-gray-600">
                                {groupItem.groupType === "Public" ? (
                                  <Globe size={18} className="text-green-600" />
                                ) : (
                                  <Lock size={18} className="text-orange-600" />
                                )}
                                <span className="font-medium">{groupItem.groupType} Group</span>
                              </div>

                              <div className="flex items-center justify-center md:justify-start gap-2 text-gray-600">
                                <Tag size={18} className="text-blue-600" />
                                <span className="font-medium">{groupItem.category}</span>
                              </div>
                            </div>

                            {/* Request Status */}
                            {isMember && !isApproved && (
                              <div className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full font-semibold">
                                <Loader2 size={16} className="animate-spin" />
                                Request Pending
                              </div>
                            )}
                          </div>

                          {/* Stats */}
                          <div className="flex gap-8">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-gray-900">{postCount}</div>
                              <div className="text-sm text-gray-600 font-medium">Posts</div>
                            </div>
                            <div className="w-px bg-gray-200"></div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-gray-900">{allMembers?.length}</div>
                              <div className="text-sm text-gray-600 font-medium">Members</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Join Group Modal */}
                    {!hideBlurGroup && (
                      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
                          <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                              <UserPlus className="text-blue-600" size={32} />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Join Group</h2>
                            <p className="text-gray-600">
                              Would you like to join{" "}
                              <span className="font-semibold text-blue-600">{groupItem.groupName}</span>?
                            </p>
                          </div>

                          <div className="flex gap-3">
                            <button
                              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors"
                              onClick={handleJoinGroup}
                            >
                              Join Group
                            </button>
                            <button
                              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-xl transition-colors"
                              onClick={handleCancelModal}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Main Content */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Posts Section */}
                      <div
                        className={`lg:col-span-2 ${
                          (isMember && isApproved) || profile._id === groupItem.userId || admin
                            ? ""
                            : "blur-lg pointer-events-none select-none"
                        }`}
                      >
                        <Routes>
                          <Route
                            exact
                            path="/"
                            element={
                              <div className=" rounded-2xl  overflow-hidden ">
                                <SocialMediaPost showCreatePost={true} groupID={_id} />
                              </div>
                            }
                          />
                          <Route
                            exact
                            path="/groupInvite"
                            element={
                              <div className="bg-white rounded-2xl shadow-lg p-6">
                                <GroupInvite />
                              </div>
                            }
                          />
                          <Route
                            exact
                            path="/invite"
                            element={
                              <div className="bg-white rounded-2xl shadow-lg p-6">
                                <JoinGroup />
                              </div>
                            }
                          />
                        </Routes>
                      </div>

                      {/* Sidebar */}
                      <div className="lg:col-span-1 space-y-6">
                        {/* Join Requests */}
                        {(profile._id === groupItem.userId || admin) && groupItem.groupType === "Private" && (
                          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b">
                              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <UserPlus size={20} className="text-blue-600" />
                                Join Requests
                              </h3>
                            </div>

                            <div className="p-4 max-h-96 overflow-y-auto">
                              {allPendingReq?.length > 0 ? (
                                <div className="space-y-3">
                                  {allPendingReq?.map((member, index) => (
                                    <div key={index} className="bg-gray-50 rounded-xl p-4">
                                      <div className="flex items-center gap-3 mb-3">
                                        <img
                                          src={member?.userId?.profilePicture || profilePic}
                                          alt=""
                                          className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                                        />
                                        <div>
                                          <p className="font-semibold text-gray-900">
                                            {member?.userId?.firstName + " " + member?.userId?.lastName}
                                          </p>
                                        </div>
                                      </div>

                                      <div className="flex gap-2">
                                        <button
                                          className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-3 rounded-lg text-sm transition-colors flex items-center justify-center gap-1"
                                          onClick={() => handleAccept(member.userId?._id)}
                                        >
                                          <Check size={14} />
                                          Accept
                                        </button>
                                        <button
                                          className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-3 rounded-lg text-sm transition-colors flex items-center justify-center gap-1"
                                          onClick={() => handleDecline(member.userId?._id)}
                                        >
                                          <X size={14} />
                                          Decline
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-center py-8">
                                  <UserPlus size={48} className="text-gray-300 mx-auto mb-3" />
                                  <p className="text-gray-500">No pending requests</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Group Actions */}
                        {(profile._id === groupItem.userId || admin) && (
                          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b">
                              <h3 className="text-lg font-bold text-gray-900">Group Actions</h3>
                            </div>

                            <div className="p-4">
                              <Link
                                to={`/home/groups/${_id}/groupInvite`}
                                className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors text-blue-600 hover:text-blue-700"
                              >
                                <Mail size={20} />
                                <span className="font-semibold">Generate Group Link</span>
                              </Link>
                            </div>
                          </div>
                        )}

                        {/* Group Members */}
                        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                          <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4 border-b">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                              <Users size={20} className="text-purple-600" />
                              Group Members
                            </h3>
                          </div>

                          <div className="p-4 max-h-96 overflow-y-auto">
                            {allMembers?.length > 0 ? (
                              <div className="space-y-3">
                                {allMembers?.map((member, index) => (
                                  <div
                                    key={index}
                                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                                  >
                                    <img
                                      src={member?.userId?.profilePicture || profilePic}
                                      alt=""
                                      className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                                    />
                                    <div>
                                      <p className="font-semibold text-gray-900">
                                        {member?.userId?.firstName + " " + member?.userId?.lastName}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center py-8">
                                <Users size={48} className="text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500">No members yet</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </>
          }
        />
        <Route
          path="/add"
          element={
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <GroupMembers members={groupMembers} />
            </div>
          }
        />
      </Routes>
      <MyVerticallyCenteredModal show={showModal} onHide={() => setShowModal(false)} />
    </div>
  )
}

export default IndividualGroup
