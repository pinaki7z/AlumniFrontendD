import LeftSidebar from "./components/left-sidebar";
import TopBar from "./components/topbar";
import SocialMediaPost from "./components/Social-wall-post";
import SideWidgets from "./components/SideWidgets";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useParams,
} from "react-router-dom";
import Groups from "./pages/Groups";
import Donations from "./pages/Donations";
import Sponsorships from "./pages/Sponsorships";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Settings from "./pages/Settings";
import ProfilePage from "./pages/ProfilePage";
import Members from "./pages/Members";
import Profile from "./pages/Profile";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import { useState, useEffect } from "react";
import React from "react";
import Dashboard from "./pages/Dashboard";
import { useCookies } from "react-cookie";
import { JoinGroup } from "./components/Groups/JoinGroup";
import IndividualGroup from "./components/Groups/IndividualGroup";
import { GiConsoleController } from "react-icons/gi";
import { useSelector } from "react-redux";
import Events from "./pages/Events";
import ForgotPasswordPage from "./pages/ForgetPassword/ForgotPasswordPage";
import PasswordReset from "./pages/ForgetPassword/PasswordReset";
import { Helmet } from "react-helmet";

function App() {
  const [cookies, removeCookie] = useCookies(["token"]);
  const [loading, setLoading] = useState(true);
  const profile = useSelector((state) => state.profile);
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  useEffect(() => {
    const token = cookies.token;
    if (token && token !== undefined) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
    setLoading(false);
  }, [cookies.token]);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    if (cookies.token) {
      document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
    }
    setIsLoggedIn(false);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
        {/* <Helmet>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>Alumnify by InsideOut</title>
          <meta name="description" content="This is an awesome web app!" />

          <meta property="og:title" content="Alumnify by InsideOut" />
          <meta
            property="og:description"
            content="This is an awesome web app!"
          />
          <meta property="og:image" content="https://alumnify.in/image.jpg" />
          <meta property="og:url" content={window.location.href} />
          <meta property="og:type" content="website" />

          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content="Alumnify by InsideOut" />
          <meta
            name="twitter:description"
            content="This is an awesome web app!"
          />
          <meta name="twitter:image" content="https://alumnify.in/image.jpg" />
        </Helmet> */}
      <div className="App">
        <ToastContainer />
        <Router>
          <Routes>
            {/* Route for the base URL */}
            <Route
              path="/*"
              element={<LandingPage handleLogin={handleLogin} />}
            />

            {/* Login and Register Routes */}
            <Route
              path="/login"
              element={<LoginPage handleLogin={handleLogin} />}
            />
            <Route
              path="/register"
              element={<RegisterPage handleLogin={handleLogin} />}
            />

            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route
              path="/reset-password/:userId/:token"
              element={<PasswordReset />}
            />

            {isLoggedIn && (
              <>
                {/* Home route for logged-in users */}
                <Route
                  path="/home/*"
                  element={<Dashboard handleLogout={handleLogout} />}
                />
                <Route
                  path="/groups/:_id/invite/*"
                  element={
                    <div
                      style={{
                        width: "100%",
                        display: "flex",
                        flexDirection: "row",
                      }}
                    >
                      <LeftSidebar />
                      <div style={{ marginLeft: "20%", width: "80%" }}>
                        <TopBar handleLogout={handleLogout} />
                        <JoinGroup />
                      </div>
                    </div>
                  }
                />
                <Route
                  path="/events/:_id/*"
                  element={
                    <div
                      style={{
                        width: "100%",
                        display: "flex",
                        flexDirection: "row",
                      }}
                    >
                      <LeftSidebar />
                      <div style={{ marginLeft: "20%", width: "80%" }}>
                        <TopBar handleLogout={handleLogout} />
                        <Events />
                      </div>
                    </div>
                  }
                />
              </>
            )}

            {/* Catch-all route to redirect to LandingPage */}
            <Route
              path="*"
              element={<LandingPage handleLogin={handleLogin} />}
            />
          </Routes>
        </Router>
      </div>
    </>
  );
}

export default App;
