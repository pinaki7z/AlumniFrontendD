import FrameComponent1 from "../../components/FrameComponent/FrameComponent1.jsx";
import "./registerpage.css";
import React, { useState } from 'react';
import axios from 'axios';
import "./registerpage.css";
import "../LoginPage/loginPage.css"
import backgroundPic from "../../images/imgb.jpg";
import pic from "../../images/bhuUni.jpg";
import logo from "../../images/bhu.png";
import { useNavigate } from 'react-router-dom';
import { toast } from "react-toastify";
import baseUrl from "../../config.js";
import ReCAPTCHA from "react-google-recaptcha";

const RegisterPage = () => {
  const navigateTo = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    gender: '',
    accept: false,
    captchaToken: null
  });

  const handleReCaptcha = (token) => {
    setFormData({ ...formData, captchaToken: token });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    setFormData({ ...formData, [name]: val });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    console.log('handling reg submission')
    if (!formData.captchaToken) {
      toast.error("Please complete the CAPTCHA.");
      setLoading(false);
      return;
    }

    if (!formData.accept) {
      toast.error("You must accept the terms and conditions to register.");
      setLoading(false);
      return;
    }

    console.log('handling reg submission 2')
    try {
      console.log('formData', formData);
      const response = await axios.post(`${baseUrl}/alumni/register`, formData);

      console.log('Registration successful!', response.data);
      toast.success("User Registered successfully!");
      navigateTo('/login');
      setLoading(false);

    } catch (error) {
      console.error('Registration failed!', error.response.data);
      toast.error(error.response.data);
      setLoading(false);

    }
  };
  const generateYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear - 1; i >= currentYear - 100; i--) {
      years.push(`${i}-${i + 1}`);
    }
    return years;
  };

  const generateGraduatingYears = () => {
    const currentYear = new Date().getFullYear();
    const years = ['Graduated'];
    for (let i = currentYear; i >= currentYear - 100; i--) {
      years.push(i);
    }
    return years;
  };

  return (
    <div className="register">
      <main className="rectangle-parent">
        <div className="frame-child" />
        <div className="rectangle-group">
          <div className="frame-item" />
          <div className="bhu-alumni-association-container1">
            <span>Welcome to</span>
            <span className="alumni-association">
              <b>{` `}</b>
              <span className="alumni-association1" style={{ fontSize: '65px' }}>Alumnify</span>
            </span>
          </div>
        </div>
        <div className="first-name-field-wrapper">
          <form className="first-name-field" onSubmit={handleSubmit} >
            <h1 className="create-an-account">Create an account</h1>
            <span style={{ fontSize: "15px" }}>(All fields are mandatory)</span>
            <div className="last-name-field-parent">
              <div className="last-name-field">First Name</div>
              <div className="input">
                <div className="input1">
                  <div className="field">
                    <input
                      className="register-email-address"
                      placeholder="Enter First Name"
                      type="text"
                      style={{ width: '100%' }}
                      name='firstName' id='firstName' onChange={handleChange} required
                    />
                  </div>
                </div>
              </div>
              <div className="last-name-field">Last Name</div>
              <div className="input">
                <div className="input1">
                  <div className="field">
                    <input
                      className="register-email-address"
                      placeholder="Enter Last Name"
                      type="text"
                      style={{ width: '100%' }}
                      name='lastName' id='lastName' onChange={handleChange} required
                    />
                  </div>
                </div>
              </div>
              <div className="last-name-field">E-mail</div>
              <div className="input">
                <div className="input1">
                  <div className="field">
                    <input
                      className="register-email-address"
                      placeholder="Enter Email Address"
                      type="text"
                      style={{ width: '100%' }}
                      name='email' id='email' onChange={handleChange} required
                    />
                  </div>
                </div>

              </div>
              <div className="last-name-field1">
                <div className="password">Password</div>
                <div className="input2">
                  <div className="input3">
                    <div className="field1">
                      <input
                        className="email-address1"
                        placeholder="Enter Password"
                        type="password"
                        style={{ width: '100%' }}
                        name='password' id='password' onChange={handleChange} required
                      />
                    </div>
                  </div>

                </div>
              </div>
              <div className="last-name-field2">
                <div className="password">Confirm Password</div>
                <div className="input2">
                  <div className="input3">
                    <div className="field1">
                      <input
                        className="email-address1"
                        placeholder="Confirm Password"
                        type="password"
                        style={{ width: '100%' }}
                        name='confirmPassword' id='confirmPassword' onChange={handleChange} required
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="last-name-field3">
                <div className="gender">Gender</div>
                <div className="gender1">
                  <select name='gender' id='gender' style={{ fontSize: 'var(--input-text-title-size)', width: '100%', height: '100%', borderRadius: 'var(--br-9xs)', border: '1px solid var(--outline-box)', boxSizing: 'border-box', backgroundColor: 'var(--background-light)' }} onChange={handleChange} required>
                    <option value='' disabled selected >Select Gender</option>
                    <option value='Male'>Male</option>
                    <option value='Female'>Female</option>
                    <option value='Other'>Other</option>
                  </select>

                </div>
              </div>
              <div className="last-name-field4">
                <div className="department">Department</div>
                <div className="dept">
                  <select name='department' id='department' style={{ fontSize: 'var(--input-text-title-size)', width: '100%', height: '100%', borderRadius: 'var(--br-9xs)', border: '1px solid var(--outline-box)', boxSizing: 'border-box', backgroundColor: 'var(--background-light)' }} onChange={handleChange} required>
                    <option value='' disabled selected >Select Department</option>
                    <option value='Agricultural Engineering'>Agricultural Engineering</option>
                    <option value='Gastroenterology'>Gastroenterology</option>
                    <option value='Indian languages'>Indian languages</option>
                    <option value='Neurosurgery'>Neurosurgery</option>
                    <option value='Vocal Music'>Vocal Music</option>
                  </select>
                </div>
              </div>
              <div className="last-name-field5">
                <div className="last-name-field">Graduating Year</div>
                <div className="batch1">
                  <select name='graduatingYear' id='graduatingYear' style={{ fontSize: 'var(--input-text-title-size)', width: '100%', height: '100%', borderRadius: 'var(--br-9xs)', border: '1px solid var(--outline-box)', boxSizing: 'border-box', backgroundColor: 'var(--background-light)' }} onChange={handleChange} required>
                    <option value='' disabled selected>Select Graduating Year</option>
                    {generateGraduatingYears().map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="batch">Batch</div>
                <div className="batch1">
                  <select name='batch' id='batch' style={{ fontSize: 'var(--input-text-title-size)', width: '100%', height: '100%', borderRadius: 'var(--br-9xs)', border: '1px solid var(--outline-box)', boxSizing: 'border-box', backgroundColor: 'var(--background-light)' }} onChange={handleChange} required>
                    <option value='' disabled selected>Select Batch</option>
                    {generateYears().map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <ReCAPTCHA
                  sitekey="6LdPzXgqAAAAACrakqqSjHvl4XIVyec6u1UimfSM"
                  onChange={handleReCaptcha}
                />
              </div>
              <div className="privacy-policy-link">
                <div className="controls">
                  <div className="union-wrapper">
                    <input
                      type="checkbox"
                      name="accept"
                      id="accept"
                      checked={formData.accept}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div className="by-creating-your" htmlFor="accept">
                  By creating your account, you agree to our
                </div>
                <div className="privacy-policy">Privacy Policy</div>
              </div>
            </div>
            <button className="register-button" type='submit' id='btn' name='btn'>
              <div className="register-button1">{loading ? 'Registering...' : "Register"}</div>
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default RegisterPage;
