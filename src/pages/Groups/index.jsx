
import PageTitle from "../../components/PageTitle";
import PageSubTitle from "../../components/PageSubTitle";
import { BsGridFill } from "react-icons/bs";
import { Route, Routes } from "react-router-dom";
import SuggestedGroups from "../../components/Groups/SuggestedGroups";
import MyGroups from "../../components/Groups/MyGroups";
import JoinedGroups from "../../components/Groups/JoinedGroups";
import DonSponRequest from "../../components/DonSponRequest";
import IndividualGroup from "../../components/Groups/IndividualGroup";
import { useSelector } from "react-redux";
import AllGroups from "../../components/Groups/AllGroups";
import { IoSearchSharp } from "react-icons/io5";
import { Link, useLocation } from "react-router-dom";
import { AddMembers } from "../../components/Groups/AddMembers";
import GroupMembers from "../../components/Groups/GroupMembers";
import { FaPlus } from "react-icons/fa";
import { useState } from "react";
import GroupRequest from "./GroupRequest";
const Groups = () => {
  const profile = useSelector((state) => state.profile);
  const title = "Groups";
  const icon = <BsGridFill style={{ color: "#174873" }} />;
  // const buttontext1 = "My Groups";
  // const buttontext2 = "Suggested Groups";
  // const buttontext3 = "Joined Groups";
  // const buttontext1Link = "/home/groups";
  // const buttontext2Link = "/home/groups/suggested-groups";
  // const buttontext3Link = `/home/groups/${profile._id}/joined-groups`;
  const buttontext1 = 'Suggested Groups';
  const buttontext2 = 'Joined Groups';
  const buttontext3 = '';
  const buttontext1Link = "/home/groups/suggested-groups";
  const buttontext2Link = `/home/groups/${profile._id}/joined-groups`;
  const buttontext3Link = ``;
  const [groupType, setGroupType] = useState(""); // State to store selected option
  const [searchQuery, setSearchQuery] = useState("")

  // Handler to update the groupType when an option is selected
  const handleGroupTypeChange = (e) => {
    setGroupType(e.target.value); // Store selected option in state
  };

  let admin;
  if (profile.profileLevel === 0 || profile.profileLevel === 1) {
    admin = true;
  }

  return (
    <div
      style={{ width: '100%', paddingLeft: '5%', paddingTop: '25px', paddingRight: '5%' }}
      //className="p-5 lg:px-20"
    >
      <Routes>
        <Route
          path="/"
          element={
            <>
              <div className='bg-[#cef3df] p-4 rounded-lg mb-3'>
                <h2 className='text-[#136175] mb-2 text-3xl md:text-4xl font-bold'>Groups</h2>
                <p className='text-base md:text-lg text-[#136175]' >
                Join communities based on interests like music, sports, and tech. Connect, share updates, and engage with like-minded people in discussions and events.
                </p>
              </div>
              <div
                style={{ display: 'flex', justifyContent: 'space-between' }}
              //className="grid grid-cols-1 lg:grid-cols-2 lg:flex  gap-3"
              >
                <div
                  className="search"
                  style={{ display: "flex", width: "75%" }}
                >
                  <form
                    style={{
                      display: "flex",
                      alignItems: "center",
                      width: "100%",
                    }}
                  >
                    <div style={{ position: "relative", width: "100%" }}>
                      <input
                        type="search"
                        name="search"
                        id="search"
                        placeholder="Search for groups"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "10px 40px 10px 10px",
                          border: "1px solid #004C8A",
                          backgroundColor: "white",
                        }}
                      />
                      <button
                        type="submit"
                        style={{
                          position: "absolute",
                          right: "10px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          backgroundColor: "white",
                          border: "none",
                          padding: "5px",
                          color: "white",
                          cursor: "pointer",
                        }}
                      >
                        <IoSearchSharp
                          style={{
                            color: "#004C8A",
                            width: "25px",
                            height: "25px",
                          }}
                        />
                      </button>
                    </div>
                  </form>
                </div>
                <div className=" w-full lg:w-[340px]   ">
                  <select className="w-full h-12 select-dropdown rounded shadow" value={groupType} // Binding state to the dropdown
                    onChange={handleGroupTypeChange} >
                    <option value="">All Groups</option>
                    <option value="Public">Public</option>
                    <option value="Private">Private</option>
                  </select>
                </div>
              </div>
            </>
          }
        />
        <Route path="/:_id/*" element={<IndividualGroup />} />
        <Route
          path="/suggested-groups"
          element={
            <>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div
                  className="search"
                  style={{ display: "flex", width: "75%" }}
                >
                  <form
                    style={{
                      display: "flex",
                      alignItems: "center",
                      width: "100%",
                    }}
                  >
                    <div style={{ position: "relative", width: "100%" }}>
                      <input
                        type="search"
                        name="search"
                        id="search"
                        placeholder="Search for groups"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "10px 40px 10px 10px",
                          border: "1px solid #004C8A",
                          backgroundColor: "white",
                        }}
                      />
                      <button
                        type="submit"
                        style={{
                          position: "absolute",
                          right: "10px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          backgroundColor: "white",
                          border: "none",
                          padding: "5px",
                          color: "white",
                          cursor: "pointer",
                        }}
                      >
                        <IoSearchSharp
                          style={{
                            color: "#004C8A",
                            width: "25px",
                            height: "25px",
                          }}
                        />
                      </button>
                    </div>
                  </form>
                </div>
                <select className="select-dropdown" value={groupType} // Binding state to the dropdown
                  onChange={handleGroupTypeChange} >
                  <option value="">All Groups</option>
                  <option value="Public">Public</option>
                  <option value="Private">Private</option>
                </select>
              </div>
            </>
          }
        />
        <Route
          path="/:id/joined-groups"
          element={
            <>
              {/* <PageTitle title={title} icon={icon} /> */}
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div
                  className="search"
                  style={{ display: "flex", width: "75%" }}
                >
                  <form
                    style={{
                      display: "flex",
                      alignItems: "center",
                      width: "100%",
                    }}
                  >
                    <div style={{ position: "relative", width: "100%" }}>
                      <input
                        type="search"
                        name="search"
                        id="search"
                        placeholder="Search for groups"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "10px 40px 10px 10px",
                          border: "1px solid #004C8A",
                          backgroundColor: "white",
                        }}
                      />
                      <button
                        type="submit"
                        style={{
                          position: "absolute",
                          right: "10px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          backgroundColor: "white",
                          border: "none",
                          padding: "5px",
                          color: "white",
                          cursor: "pointer",
                        }}
                      >
                        <IoSearchSharp
                          style={{
                            color: "#004C8A",
                            width: "25px",
                            height: "25px",
                          }}
                        />
                      </button>
                    </div>
                  </form>
                </div>
                <select className="select-dropdown" value={groupType} // Binding state to the dropdown
                  onChange={handleGroupTypeChange} >
                  <option value="">All Groups</option>
                  <option value="Public">Public</option>
                  <option value="Private">Private</option>
                </select>
              </div>
            </>
          }
        />
        <Route
          path="/create"
          element={<>{/* <PageTitle title={title} icon={icon} /> */}</>}
        />
        <Route path="/edit/:_id" element={<></>} />
        {/* <Route path="/:id/add" element={
          <>
            <GroupMembers />
          </>
        } /> */}
      </Routes>
      <Routes>
        {admin ? (
          <Route
            path="/"
            element={
              <div className="flex justify-end" style={{ marginTop: "25px" }}>
                <Link
                  to={`/home/groups/create`}
                  // style={{ textDecoration: "none", color: "black" }}
                  className=""
                >
                  <button
                    className="flex items-center justify-center gap-3 w-full lg:w-[150px] px-6 py-2 rounded-md bg-[#004C8A] text-white hover:bg-[#003561] transition duration-150 ease-in-out"
                  >
                    <FaPlus className="text-xl" /> Create
                  </button>
                </Link>
              </div>
            }
          />
        ) : (
          <Route path="/" element={<></>} />
        )}
        {/* {admin ? (
          <Route path="/suggested-groups" element={<>Create</>} />
        ) : (
          <Route path="/suggested-groups" element={<></>} />
        )}
      {admin ? (
          <Route path="/:id/joined-groups" element={<>Create</>} />
        ) : (
          <Route path="/:id/joined-groups" element={<></>} />
        )} */}
      </Routes>
      <Routes>
        {admin ? (
          <Route
            path="/"

            element={
              <PageSubTitle
                buttontext1="All Groups"
                name="groups"
                create={true}
              />
            }
          />
        ) : (
          <Route
            path="/"
            element={
              <PageSubTitle
                buttontext1={buttontext1}
                buttontext2={buttontext2}
                buttontext3={buttontext3}
                buttontext1Link={buttontext1Link}
                buttontext2Link={buttontext2Link}
                buttontext3Link={buttontext3Link}
                name="groups"
                create={false}
              />
            }
          />
        )}
        {admin ? (
          <Route
            path="/suggested-groups"
            element={<>Wrong Route.Please Go Back</>}
          />
        ) : (
          <Route
            path="/suggested-groups"
            element={
              <PageSubTitle
                buttontext1={buttontext1}
                buttontext2={buttontext2}
                buttontext3={buttontext3}
                buttontext1Link={buttontext1Link}
                buttontext2Link={buttontext2Link}
                buttontext3Link={buttontext3Link}
                name="groups"
                create={false}
              />
            }
          />
        )}
        {admin ? (
          <Route
            path="/:id/joined-groups"
            element={
              <PageSubTitle
                buttontext1={buttontext1}
                buttontext2={buttontext2}
                buttontext3={buttontext3}
                buttontext1Link={buttontext1Link}
                buttontext2Link={buttontext2Link}
                buttontext3Link={buttontext3Link}
                name="groups"
                create={true}
              />
            }
          />
        ) : (
          <Route
            path="/:id/joined-groups"
            element={
              <PageSubTitle
                buttontext1={buttontext1}
                buttontext2={buttontext2}
                buttontext3={buttontext3}
                buttontext1Link={buttontext1Link}
                buttontext2Link={buttontext2Link}
                buttontext3Link={buttontext3Link}
                name="groups"
                create={false}
              />
            }
          />
        )}
        <Route
          path="/create"
          element={<GroupRequest name="group" edit={false} />}
        />
        <Route
          path="/edit/:_id"
          element={<GroupRequest name="group" edit={true} />}
        />
      </Routes>
      <Routes>
        {admin ? (
          <Route path="/suggested-groups" element={<></>} />
        ) : (
          <Route path="/suggested-groups" element={<SuggestedGroups searchQuery={searchQuery} groupType={groupType} />} />
        )}
        {/* <Route path="/suggested-groups" element={<SuggestedGroups />} /> */}
        <Route path="/:id/joined-groups" element={<JoinedGroups searchQuery={searchQuery} groupType={groupType} />} />
        {admin ? (
          <Route path="/" element={<AllGroups searchQuery={searchQuery} groupType={groupType} />} />
        ) : (
          <Route path="/" element={<></>} />
        )}
      </Routes>
    </div>
  );
};

export default Groups;
