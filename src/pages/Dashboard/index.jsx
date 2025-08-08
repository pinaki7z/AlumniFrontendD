import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import LeftSidebar from "../../components/left-sidebar";
import TopBar from "../../components/topbar";
import SocialMediaPost from "../../components/Social-wall-post";
import SideWidgets from "../../components/SideWidgets";
import Groups from "../Groups";
import Settings from "../Settings";
import ProfilePage from "../ProfilePage";
import Members from '../Members';
import Profile from '../Profile';
import Events from "../Events";
import Jobs from "../Jobs";
import IndividualJobPost from "../Jobs/IndividualJobPost.jsx";
import NotificationsPage from "../NotificationsPage";
import Forum from "../Forum";
import { ProfileSettings } from "../ProfilePage/ProfileSettings/index.jsx";
import { Following } from "../../components/Following/index.jsx";
import { Followers } from "../../components/Followers/index.jsx";
import { Ipost } from "../../components/Ipost"
import { WorkExperience } from "../../components/WorkExperience/index.jsx";
import { SearchedResults } from "../../components/SearchedResults";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { CreateJob } from "../Jobs/CreateJob/index.jsx";
import { InterestedJobCandidates } from "../Jobs/InterestedJobCandidates/index.jsx";
import MemberForm from "../Members/MemberForm.jsx";
import ValidateUser from "../ValidateUser/ValidateUser.jsx";
import V2PhotoGallery from "../PhotoGallery/V2PhotoGallary.jsx";
import MessagingPage from "../Chat2/MessagingPage.jsx";
import TopicPage from "../Forum/TopicPage.jsx";
import DiscussionPage from "../Forum/DiscussionPage.jsx";
import ForumPost from "../Forum/ForumPost.jsx";
import { Menu, X } from "lucide-react";
import RightSidebar from "../../components/SideWidgets/RightSidebar.jsx";
import BusinessConnect from "../BusinessConnect/BusinessConnect.jsx";
import CreateBusiness from "../BusinessConnect/CreateBusiness.jsx";
import BusinessVerificationPanel from "../BusinessConnect/BusinessVerificationPanel.jsx";
import BusinessConnectDetails from "../BusinessConnect/BusinessConnectDetails.jsx";
import SponsorshipConnect from "../Sponsorships/SponsorshipConnect.jsx";
import CreateSponsorship from "../Sponsorships/CreateSponsorship.jsx";
import SponsorshipDetails from "../Sponsorships/SponsorshipDetails.jsx";
import SponsorshipVerificationPanel from "../Sponsorships/SponsorshipVerificationPanel.jsx";
import NewsUpdatesPage from "../NewsV2/NewsUpdatesPage.jsx";
import NewsDetailPage from "../NewsV2/NewsDetailPage.jsx";
import CreateNewsPage from "../NewsV2/CreateNewsPage.jsx";
import DraftsPage from "../NewsV2/DraftsPage.jsx";
import AnalyticsPage from "../NewsV2/AnalyticsPage.jsx";
import ScrollToTop from "../../components/ScrollToTop.jsx";
import ProhibitedKeywords from "../../pages/ProhibitedKeywords/ProhibitedKeywords.jsx"
import NotificationCenterPage from "../NotificationCenterPage/NotificationCenterPage.jsx";
import UserVerification from "../UserVerification/UserVerification.jsx";
import { useCookies } from "react-cookie";
const Dashboard = ({ handleLogout }) => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get('search');
  const navigate = useNavigate();
  const profile = useSelector((state) => state.profile);
  // const profileVerification = useSelector((state) => state.profileVerification);
  const [cookie, setCookie, removeCookie] = useCookies('token');

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [profileVerification, setProfileVerification] = useState(null);
  const toggleMobileSidebar = () => {
    setMobileSidebarOpen(!mobileSidebarOpen);
  };

  const closeMobileSidebar = () => {
    setMobileSidebarOpen(false);
  };



  const fetchUserVerification = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/user-verification/user/${profile._id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch profile verification');
      }
      const data = await response.json();
      setProfileVerification(data);
    } catch (error) {
      console.error('Error fetching profile verification:', error.message);
    }
  };

  useEffect(() => {
    fetchUserVerification();
  }, []);

  useEffect(() => {
  console.log("profileVerification", profileVerification)

    if (profile?._id===undefined ||profileVerification?.accountDeleted === true || (profileVerification?.expirationDate && new Date(profileVerification?.expirationDate) < new Date())) {
      // console.log("alksdfjalskdfj asdf adsfsafasfadfafafasfsafasdfffffffff")
      removeCookie('token');
      navigate("/login");
    }
  }, [profileVerification?.accountDeleted, profileVerification?.expirationDate]);

  return (
    <div  className="flex h-screen w-full overflow-hidden">
       <ScrollToTop targetId="main-scroll" />
      {/* Desktop Sidebar - Collapsed by default, expands on hover */}
      <div className="hidden lg:block">
        <LeftSidebar onNavigate={() => {}} isMobile={false} isExpanded={false} />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar with Mobile Hamburger Menu */}
        <div className="flex items-center dynamic-site-bg py-2 md:px-5 px-2 relative z-50 shadow-lg lg:hidden">
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
          <div className="dynamic-site-bg py-3 px-5 shadow-lg">
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
        <div id="main-scroll" className="flex-1 overflow-auto bg-gray-100 overscroll-y-contain md:py-4">

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
              {/* <Route path="/donations/*" element={<Donations />} /> */}


              {/* all business connect routes */}
              <Route path="/business-connect" element={<BusinessConnect />} />
              <Route path="/business-connect/:id/" element={<BusinessConnectDetails/>} />
              <Route path="/business-connect/create" element={<CreateBusiness />} />
              <Route path="/business-connect/edit/:id" element={<CreateBusiness/>} />
              <Route path="/business-connect/admin/verify" element={<BusinessVerificationPanel/>} />

            {/* all sponsorship routes */}
              <Route path="/sponsorship-connect" element={<SponsorshipConnect />} />
              <Route path="/sponsorship-connect/:id/" element={<SponsorshipDetails/>} />
              <Route path="/sponsorship-connect/create" element={<CreateSponsorship />} />
              <Route path="/sponsorship-connect/edit/:id" element={<CreateSponsorship/>} />
              <Route path="/sponsorship-connect/admin/verify" element={<SponsorshipVerificationPanel/>} />


              {/* all newsv2 routes */}
              <Route path="/news/*" element={<NewsUpdatesPage />} />
              <Route path="/news/create" element={<CreateNewsPage />} />
              <Route path="/news/:id" element={<NewsDetailPage />} />
              <Route path="/news/drafts" element={<DraftsPage />} />
              <Route path="/news/analytics" element={<AnalyticsPage />} />

              <Route path="/prohibited-keywords" element={<ProhibitedKeywords />} />
             

              {/* admin routes */}
              <Route path="/admin/user-verification" element={<UserVerification />} />



              {/* <Route path="/guidance/*" element={<Guidance />} /> */}
              <Route path="/photo-gallery/*" element={<V2PhotoGallery />} />
              <Route path="/chatv2">
                <Route index element={<MessagingPage />} />
                <Route path=":userId" element={<MessagingPage />} />
              </Route>
              {/* <Route path="/sponsorships/*" element={<Sponsorships />} /> */}
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
              <Route path="/notifications/*" element={<NotificationCenterPage />} />
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
              {/* <Route path="/news/*" element={
                <div className="w-full">
                  <News />
                </div>
              } />
              <Route path="/news/:id/*" element={<NewsDetails />} />
              <Route path="/news/:id/edit" element={<CreateNews />} />
              <Route path="/news/createNews" element={<CreateNews />} /> */}
              <Route path="/validate-user" element={<ValidateUser />} />
            </Routes>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
