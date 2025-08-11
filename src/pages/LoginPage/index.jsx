import io from "../../images/logo-io.png";
import { useState, useEffect } from 'react';
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { updateProfile, setAdmin } from "../../store/profileSlice";
import ReCAPTCHA from "react-google-recaptcha";
import CryptoJS from "crypto-js";
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  Loader2, 
  UserCheck, 
  ArrowRight,
  Shield,
  Star,
  Users,
  Heart,
  CheckCircle,
  LogIn
} from 'lucide-react';

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
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

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

      const loginUrl = `${process.env.REACT_APP_API_URL}/alumni/login`;
      const response = await fetch(loginUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, captchaToken }),
      });

      if (response.ok) {
        const responseData = await response.json();
        handleLogin();

        const { token, alumni } = responseData;
        dispatch(updateProfile(alumni));
        setCookie("token", token, { path: "/" });

        if (alumni.profileLevel === 0) {
          dispatch(setAdmin(true));
        }

        // if (alumni.expirationDate && new Date(alumni.expirationDate) < currentDate) {
        //   toast.error("Your account has expired. Contact admin.");
        //   setLoading(false);
        //   return;
        // }

        toast.success("Welcome back!");
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
        let errorText = "";
        try {
          const errorData = await response.json();
          errorText = errorData.message || "Login failed";
        } catch (parseErr) {
          errorText = "Login failed";
        }
        toast.error(errorText);
        setLoading(false);
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Network error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="h-screen relative overflow-hidden bg-gray-50">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img
          src="/v2/loginBg.webp"
          alt="Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0A3A4C]/90 via-[#174873]/80 to-[#71be95]/70"></div>
        <div className="absolute inset-0 backdrop-blur-sm"></div>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden relative h-full flex flex-col items-center justify-center p-4">
        {/* Mobile Logo */}
        <div className="mb-6">
          <img 
            src={io} 
            alt="InsideOut Logo" 
            className="w-32 sm:w-40 drop-shadow-2xl transform hover:scale-105 transition-transform duration-300" 
          />
        </div>

        {/* Mobile Form Container */}
        <div className="w-full max-w-sm bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-6 border border-white/20">
          <div className="text-center space-y-2 mb-6">
            <h1 className="text-lg font-medium text-gray-800">Welcome Back To</h1>
            <h2 className="text-2xl font-bold dynamic-site-bg bg-clip-text text-transparent">
              ALUMNIFY
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Mobile Email Field */}
            <div className="space-y-1">
              <label className="block text-sm font-semibold text-gray-700">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#71be95] transition-all duration-200"
                  required
                />
              </div>
            </div>

            {/* Mobile Password Field */}
            <div className="space-y-1">
              <label className="block text-sm font-semibold text-gray-700">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={passwordVisible ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-10 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#71be95] transition-all duration-200"
                  required
                />
                <button
                  type="button"
                  onClick={() => setPasswordVisible(!passwordVisible)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                >
                  {passwordVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Mobile Remember & Forgot */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={rememberDevice}
                  onChange={() => setRememberDevice(!rememberDevice)}
                  className="w-4 h-4 text-[#71be95] border-gray-300 rounded"
                />
                <span className="text-gray-700">Remember</span>
              </label>
              <button
                type="button"
                onClick={() => navigateTo('/forgot-password')}
                className="text-[#71be95] hover:underline"
              >
                Forgot Password?
              </button>
            </div>

            {/* Mobile Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#71be95] to-[#5fa080] text-white py-3 rounded-lg font-semibold transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing In...
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Sign In
                </>
              )}
            </button>

            {/* Mobile Register Link */}
            <div className="text-center text-sm">
              <span className="text-gray-600">Don't have an account? </span>
              <a href="/register" className="text-[#71be95] font-semibold hover:underline">
                Register
              </a>
            </div>
          </form>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:flex relative h-full items-center justify-center p-8">
        <div className="w-full max-w-5xl bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden border border-white/20 h-[650px]">
          <div className="flex h-full">
            {/* Left Panel - Features with Logo */}
            <div className="w-1/2 bg-gradient-to-br from-[#0A3A4C] to-[#174873] text-white relative overflow-hidden flex flex-col">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl"></div>
                <div className="absolute bottom-20 right-10 w-24 h-24 bg-[#71be95] rounded-full blur-2xl"></div>
                <div className="absolute top-1/2 right-20 w-16 h-16 bg-white rounded-full blur-xl"></div>
              </div>
              
              {/* Logo at top */}
              <div className="relative z-10  text-center">
                <img 
                  src="/v2/logo2.png" 
                  alt="InsideOut Logo" 
                  className="w-[280px] mx-auto drop-shadow-2xl transform hover:scale-105 transition-transform duration-300" 
                />
              </div>

              {/* Content */}
              <div className="relative z-10 flex-1 flex flex-col justify-center px-10 space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 transform hover:translate-x-2 transition-transform duration-300">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                      <UserCheck className="w-5 h-5" />
                    </div>
                    <h2 className="text-2xl xl:text-3xl font-bold">REDISCOVER</h2>
                  </div>
                  
                  <div className="flex items-center gap-3 transform hover:translate-x-2 transition-transform duration-300 delay-100">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5" />
                    </div>
                    <h2 className="text-2xl xl:text-3xl font-bold">RECONNECT</h2>
                  </div>
                  
                  <div className="flex items-center gap-3 transform hover:translate-x-2 transition-transform duration-300 delay-200">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                      <Star className="w-5 h-5" />
                    </div>
                    <h2 className="text-2xl xl:text-3xl font-bold">REIGNITE</h2>
                  </div>
                </div>
                
                <p className="text-lg text-white/90 font-medium">Your Alumni Journey Starts Here!</p>

                {/* Compact Features List */}
                <div className="space-y-2">
                  {[
                    "Connect with fellow alumni",
                    "Discover career opportunities", 
                    "Share your success stories"
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-white/80 text-sm">
                      <CheckCircle className="w-3 h-3 text-[#71be95] flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Panel - Login Form */}
            <div className="w-1/2 p-10 flex flex-col justify-center">
              <div className="max-w-sm mx-auto w-full space-y-6">
                {/* Header */}
                <div className="text-center space-y-2">
                  <h1 className="text-xl font-medium text-gray-800">Welcome Back To</h1>
                  <h2 className="text-3xl font-bold dynamic-site-bg bg-clip-text text-transparent">
                    ALUMNIFY
                  </h2>
                  <p className="text-gray-600 text-sm">Sign in to continue your journey</p>
                </div>

                {/* Login Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Email Field */}
                  <div className="space-y-1">
                    <label className="block text-sm font-semibold text-gray-700">Email Address</label>
                    <div className="relative">
                      <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 transition-colors ${emailFocused ? 'text-[#71be95]' : 'text-gray-400'}`} />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onFocus={() => setEmailFocused(true)}
                        onBlur={() => setEmailFocused(false)}
                        placeholder="Enter your email address"
                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#71be95] focus:ring-2 focus:ring-[#71be95]/20 transition-all duration-200 bg-gray-50/50"
                        required
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className="space-y-1">
                    <label className="block text-sm font-semibold text-gray-700">Password</label>
                    <div className="relative">
                      <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 transition-colors ${passwordFocused ? 'text-[#71be95]' : 'text-gray-400'}`} />
                      <input
                        type={passwordVisible ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onFocus={() => setPasswordFocused(true)}
                        onBlur={() => setPasswordFocused(false)}
                        placeholder="Enter your password"
                        className="w-full pl-10 pr-10 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#71be95] focus:ring-2 focus:ring-[#71be95]/20 transition-all duration-200 bg-gray-50/50"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setPasswordVisible(!passwordVisible)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-[#71be95] transition-colors"
                      >
                        {passwordVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Remember & Forgot */}
                  <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rememberDevice}
                        onChange={() => setRememberDevice(!rememberDevice)}
                        className="w-4 h-4 text-[#71be95] border-gray-300 rounded focus:ring-[#71be95]/20"
                      />
                      <span className="text-gray-700 font-medium">Remember device</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => navigateTo('/forgot-password')}
                      className="text-[#71be95] hover:text-[#5fa080] font-medium hover:underline transition-colors"
                    >
                      Forgot Password?
                    </button>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-[#71be95] to-[#5fa080] hover:from-[#5fa080] hover:to-[#71be95] text-white py-3 rounded-xl text-lg font-semibold transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Signing In...
                      </>
                    ) : (
                      <>
                        <LogIn className="w-5 h-5" />
                        Sign In
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  {/* Register Link */}
                  <div className="text-center">
                    <p className="text-gray-600 text-sm">
                      Don't have an account?{' '}
                      <a 
                        href="/register" 
                        className="text-[#71be95] hover:text-[#5fa080] font-semibold hover:underline transition-colors"
                      >
                        Create Account
                      </a>
                    </p>
                  </div>
                </form>

                {/* Security Badge */}
                <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                  <Shield className="w-3 h-3" />
                  <span>Your data is secure and encrypted</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
