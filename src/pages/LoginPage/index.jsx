import io from "../../images/logo-io.png";
import { useState, useEffect } from 'react';
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { updateProfile, setAdmin } from "../../store/profileSlice";
import ReCAPTCHA from "react-google-recaptcha";
import CryptoJS from "crypto-js";

const LoginPage = ({ handleLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cookie, setCookie] = useCookies(["token"]);
  const navigateTo = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState(null);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(false);

  const SECRET_KEY = "f3c8a3c9b8a9f0b2440a646f3a5b8f9e6d6e46555a4b2b5c6d7c8d9e0a1b2c3d4f5e6a7b8c9d0e1f2a3b4c5d6e7f8g9h0";

  const encrypt = (text) => CryptoJS.AES.encrypt(text, SECRET_KEY).toString();
  const decrypt = (cipherText) => CryptoJS.AES.decrypt(cipherText, SECRET_KEY).toString(CryptoJS.enc.Utf8);

  useEffect(() => {
    const savedEmail = localStorage.getItem("savedEmail");
    const savedPassword = localStorage.getItem("savedPassword");
    if (savedEmail && savedPassword) {
      setEmail(savedEmail);
      setPassword(decrypt(savedPassword));
      setRememberDevice(true);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (!captchaToken) {
      toast.error("Please complete the CAPTCHA.");
      setLoading(false);
      return;
    }

    try {
      if (rememberDevice) {
        localStorage.setItem("savedEmail", email);
        localStorage.setItem("savedPassword", encrypt(password));
      } else {
        localStorage.removeItem("savedEmail");
        localStorage.removeItem("savedPassword");
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
      const currentDate = new Date();
      const response = await fetch(`${process.env.REACT_APP_API_URL}/alumni/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password, captchaToken }),
      });

      if (response.ok) {
        const responseData = await response.json();

        handleLogin();

        const { token, alumni } = responseData;
        dispatch(updateProfile(alumni))
        setCookie("token", token, { path: "/" });
        if (alumni.profileLevel === 0) {
          console.log("level zero")
          dispatch(setAdmin(true));
        }

        if (alumni.expirationDate && new Date(alumni.expirationDate) < currentDate) {
          toast.error("Your account has expired. Contact admin to recover account");
          setLoading(false);
          return;
        }

        toast.success("Logged in successfully!");
        setLoading(false);
        const currentUrl = window.location.href;

        const loginPath = '/login';
        const baseUrl = currentUrl.endsWith(loginPath)
          ? currentUrl.slice(0, -loginPath.length)
          : currentUrl;

        if (currentUrl.endsWith(loginPath)) {
          window.location.href = baseUrl + "/home";
        } else {
          window.location.href = window.location.href;
        }
      } else {
        const errorData = await response.json();
        console.error('Login failed', errorData);
        toast.error(errorData);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error during login:', error);
      setLoading(false);

    }
  };

  return (
    <>
      <div className="relative min-h-screen">

        <img
          src="/v2/loginBg.webp"
          alt="Background"
          className="absolute inset-0 w-full h-full object-cover brightness-[1.5] filter opacity-50 blur-xl"
        />
        <div className=" relative  flex flex-col items-center justify-center  p-4">
          {/* Logo */}
          <img src={io} alt="InsideOut Logo" className="w-[200px] mb-8 " />

          {/* Panels Container */}
          <div className="flex w-full max-w-4xl bg-white rounded-3xl shadow-lg overflow-hidden">
            {/* Left Panel */}
            <div className="hidden md:flex w-1/2 bg-[#0a3a4c] text-white flex-col justify-center p-10 space-y-4">
              <h2 className="text-4xl font-bold">REDISCOVER</h2>
              <h2 className="text-4xl font-bold">RECONNECT</h2>
              <h2 className="text-4xl font-bold">REIGNITE</h2>
              <p className="text-lg">Your Alumni Journey Starts Here!</p>
            </div>

            {/* Right Panel */}
            <div className="w-full md:w-1/2 bg-gray-50 p-8 flex flex-col justify-center">
              <h1 className="text-2xl font-normal text-gray-800 mb-2">Welcome To</h1>
              <div className="mb-6">
                <span className="text-5xl font-bold text-[#0a3a4c]">ALUMNIFY</span>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Field */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email address"
                    className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none"
                  />
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Password</label>
                  <div className="relative">
                    <input
                      type={passwordVisible ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password"
                      className="w-full border border-gray-300 rounded-lg p-2 pr-10 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setPasswordVisible(!passwordVisible)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                    >
                      👁️
                    </button>
                  </div>
                </div>

                {/* Remember & Forgot */}
                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={rememberDevice}
                      onChange={() => setRememberDevice(!rememberDevice)}
                      className="h-4 w-4 text-teal-600 border-gray-300 rounded"
                    />
                    <span className="text-teal-600">Remember this device</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => navigateTo('/forgot-password')}
                    className="text-gray-800 hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>

                {/* reCAPTCHA */}
                <ReCAPTCHA sitekey="6LdPzXgqAAAAACrakqqSjHvl4XIVyec6u1UimfSM" onChange={token => setCaptchaToken(token)} />

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full bg-green-400 hover:bg-green-500 text-white py-3 rounded-lg text-lg font-medium"
                  disabled={loading}
                >
                  {loading ? 'Logging in...' : 'Login'}
                </button>

                {/* Register Link */}
                <div className="text-center text-sm">
                  <span className="text-gray-600">Don’t have an account?</span>
                  <a href="/register" className="ml-1 text-blue-600 hover:underline">Register</a>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

    </>
  );
};

export default LoginPage;
