import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import LeftSidebar from "../../components/left-sidebar";
import TopBar from "../../components/topbar";
import SocialMediaPost from "../../components/Social-wall-post";
import SideWidgets from "../../components/SideWidgets";
import Groups from "../Groups";
import Donations from "../Donations";
import Sponsorships from "../Sponsorships";
import Settings from "../Settings";
import ProfilePage from "../ProfilePage";
import Members from '../Members';
import Profile from '../Profile';
import Events from "../Events";
import Jobs from "../Jobs";
import LandingPage from "../LandingPage/index.jsx";
import IndividualJobPost from "../Jobs/IndividualJobPost.jsx";
import Internships from "../Internships";
import NotificationsPage from "../NotificationsPage";
import News from "../News/index.jsx";
import Forum from "../Forum";
import CreateForum from "../../components/Forum/CreateForum";
import IForum from "../../components/Forum/IForum";
import Chatbox from "../../components/Chatbox"
import { ProfileSettings } from "../ProfilePage/ProfileSettings/index.jsx";
import { Following } from "../../components/Following/index.jsx";
import { Followers } from "../../components/Followers/index.jsx";
import { Ipost } from "../../components/Ipost"
import IndividualGroup from "../../components/Groups/IndividualGroup/index.jsx";
import Chat from "../../pages/Chat";
import { WorkExperience } from "../../components/WorkExperience/index.jsx";
import Guidance from "../Guidance/index.jsx";
import { Archive } from "../Jobs/Archive/index.jsx";
import DonSponRequest from "../../components/DonSponRequest/index.jsx";
import { SearchedResults } from "../../components/SearchedResults";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import PhotoGallery from "../PhotoGallery/index.jsx";
import { CreateJob } from "../Jobs/CreateJob/index.jsx";
import { InterestedJobCandidates } from "../Jobs/InterestedJobCandidates/index.jsx";
import { CreateNews } from "../News/CreateNews/index.jsx";
import NewsDetails from "../News/NewsDetails.jsx";
import MemberForm from "../Members/MemberForm.jsx";
import ValidateUser from "../ValidateUser/ValidateUser.jsx";
import V2PhotoGallery from "../PhotoGallery/V2PhotoGallary.jsx";
import MessagingPage from "../Chat2/MessagingPage.jsx";
import TopicPage from "../Forum/TopicPage.jsx";
import DiscussionPage from "../Forum/DiscussionPage.jsx";
import ForumPost from "../Forum/ForumPost.jsx";
import { Menu, X } from "lucide-react";
import RightSidebar from "../../components/SideWidgets/RightSidebar.jsx";

const Dashboard = ({ handleLogout }) => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get('search');
  const navigate = useNavigate();
  const profile = useSelector((state) => state.profile);

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const toggleMobileSidebar = () => {
    setMobileSidebarOpen(!mobileSidebarOpen);
  };

  const closeMobileSidebar = () => {
    setMobileSidebarOpen(false);
  };

  useEffect(() => {
    if (profile.accountDeleted === true || (profile.expirationDate && new Date(profile.expirationDate) < new Date())) {
      navigate("/login");
    }
  }, [profile.accountDeleted, profile.expirationDate]);

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Desktop Sidebar - Collapsed by default, expands on hover */}
      <div className="hidden lg:block">
        <LeftSidebar onNavigate={() => {}} isMobile={false} isExpanded={false} />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar with Mobile Hamburger Menu */}
        <div className="flex items-center bg-gradient-to-r from-[#0A3A4C] to-[#174873] py-2 md:px-5 px-2 relative z-50 shadow-lg lg:hidden">
          <button
            onClick={toggleMobileSidebar}
            className="p-2 rounded-md hover:bg-white/20 transition-all duration-200 mr-4 hover:scale-105 shadow-lg"
          >
            <Menu className="h-6 w-6 text-white" />
          </button>
          <div className="flex-1">
            <TopBar handleLogout={handleLogout} />
          </div>
        </div>

        {/* Desktop TopBar - No hamburger menu */}
        <div className="hidden lg:block ">
          <div className="bg-gradient-to-r from-[#0A3A4C] to-[#174873] py-3 px-5 shadow-lg">
            <div className="text-white font-semibold text-lg absolute left-[0.5%] top-[0%]">
                <img src="/v2/logo2.png" alt="InsideOut Logo" className="w-[200px] h-[99px] mx-auto rounded-lg object-contain transition-all duration-300" />
               </div>
            <div className="max-w-6xl mx-auto">

            <TopBar handleLogout={handleLogout} />
            </div>
          </div>
        </div>

        {/* Mobile Sidebar Overlay */}
        {mobileSidebarOpen && (
          <div 
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
            onClick={closeMobileSidebar}
          />
        )}

        {/* Mobile Sidebar */}
        <div className={`
          lg:hidden fixed top-0 left-0 h-full shadow-2xl z-50
          transform transition-transform duration-300 ease-in-out
          ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          w-72 max-w-[85vw]
        `}>
          <div className="h-full">
            <LeftSidebar onNavigate={closeMobileSidebar} isMobile={true} isExpanded={true} />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto bg-gray-100 overscroll-y-contain py-4">
          <div className="">
            <Routes>
              <Route path="/groups/*" element={<Groups />} />
              {searchQuery && (
                <Route
                  path="/*"
                  element={<SearchedResults searchQuery={searchQuery} />}
                />
              )}
              {!searchQuery && (
                <Route
                  path="/*"
                  element={
                    <div className="md:max-w-7xl mx-auto md:p-4">
                      <div className="grid grid-cols-12 gap-4">
                        {/* Left Sidebar - Sticky */}
                        <div className="col-span-12 lg:col-span-3 hidden lg:block">
                          <div className="sticky top-4">
                            <SideWidgets />
                          </div>
                        </div>
                        
                        {/* Middle Column - Wider and Scrollable */}
                        <div className="col-span-12 lg:col-span-6">
                          <SocialMediaPost showCreatePost={true} />
                        </div>
                        
                        {/* Right Sidebar - Sticky */}
                        <div className="col-span-12 lg:col-span-3 hidden lg:block">
                          <div className="sticky top-4">
                            <RightSidebar />
                          </div>
                        </div>
                      </div>
                    </div>
                  }
                />
              )}

              {/* All other routes remain the same */}
              <Route path="/donations/*" element={<Donations />} />
              <Route path="/guidance/*" element={<Guidance />} />
              <Route path="/photo-gallery/*" element={<V2PhotoGallery />} />
              <Route path="/chatv2">
                <Route index element={<MessagingPage />} />
                <Route path=":userId" element={<MessagingPage />} />
              </Route>
              <Route path="/sponsorships/*" element={<Sponsorships />} />
              <Route path="/members/*" element={
                <div className="w-full">
                  <Members showHeading={true} />
                </div>
              } />
              <Route path="/members/create" element={
                  <MemberForm name='member' />
              } />
              <Route path="/members/:id/*" element={<Profile />} />
              <Route path="/profile/*" element={<ProfilePage />} />
              <Route path="/notifications/*" element={<NotificationsPage />} />
              <Route path="/events/*" element={<Events />} />
              <Route path="/jobs/*" element={<Jobs />} />
              <Route path="/jobs/create" element={<CreateJob />} />
              <Route path="/jobs/candidates" element={<InterestedJobCandidates />} />
              <Route path="/settings/*" element={<Settings />} />
              <Route path="/jobs/:_id/:title" element={<IndividualJobPost />} />
              <Route path="/posts/:_id/" element={<Ipost />} />
              <Route path="/internships/:_id/:title" element={<IndividualJobPost />} />
              <Route path="/forums/*" element={<Forum />} />
              <Route path="/forums/category/:categoryId" element={<TopicPage />} />
              <Route path="/forums/category/:categoryId/topic/:topicId" element={<ForumPost />} />
              <Route path="/forums/category/:categoryId/topic/:topicId/post/:postId" element={<DiscussionPage />} />
              <Route path="/profile/:id/following" element={<Following />} />
              <Route path="/profile/:id/followers" element={<Followers />} />
              <Route path="/profile/workExperience" element={<WorkExperience />} />
              <Route path="/profile/profile-settings" element={<ProfileSettings />} />
              <Route path="/news/*" element={
                <div className="w-full">
                  <News />
                </div>
              } />
              <Route path="/news/:id/*" element={<NewsDetails />} />
              <Route path="/news/:id/edit" element={<CreateNews />} />
              <Route path="/news/createNews" element={<CreateNews />} />
              <Route path="/validate-user" element={<ValidateUser />} />
            </Routes>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
