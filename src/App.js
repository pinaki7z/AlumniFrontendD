import LeftSidebar from "./components/left-sidebar";
import TopBar from "./components/topbar";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import { useState, useEffect } from "react";
import Dashboard from "./pages/Dashboard";
import { useCookies } from "react-cookie";
import { JoinGroup } from "./components/Groups/JoinGroup";
import { useSelector } from "react-redux";
import Events from "./pages/Events";
import ForgotPasswordPage from "./pages/ForgetPassword/ForgotPasswordPage";
import PasswordReset from "./pages/ForgetPassword/PasswordReset";
import BackButtonHandler from "./components/BackButtonHandler";
import ScrollToTop from "./components/ScrollToTop";
import useCapacitorRedirect from "./utils/useCapacitorRedirect";
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
      // document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/login";
    }
    setIsLoggedIn(false);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>

      <div className="App">
        <ToastContainer />
        <Router>
          <ScrollToTop />
          <BackButtonHandler />


          <Routes>


            {/* Login and Register Routes */}
            <Route
              path="/login"
              element={
                isLoggedIn ? <Navigate to="/home" replace /> : <LoginPage handleLogin={handleLogin} />
              }
            />
            <Route
              path="/register"
              element={
                isLoggedIn ? <Navigate to="/home" replace /> : <RegisterPage handleLogin={handleLogin} />
              }
            />

            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route
              path="/reset-password/:userId/:token"
              element={<PasswordReset />}
            />
            {/* Route for the base URL */}
            <Route
              path="/*"
              element={<LandingPage handleLogin={handleLogin} />}
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
              path="/"
              element={<LandingPage handleLogin={handleLogin} />}
            />
          </Routes>
        </Router>
      </div>
    </>
  );
}

export default App;
