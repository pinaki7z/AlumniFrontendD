import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Technology from '../../images/pexels-pixabay-356056.jpg';
import Retail from '../../images/pexels-pixabay-264636.jpg';
import Manufacturing from '../../images/pexels-pixabay-257700.jpg';
import Healthcare from '../../images/pexels-chokniti-khongchum-2280568.jpg';
import Finance from '../../images/pexels-lukas-590041.jpg';
import axios from 'axios';

const CreateDonation = ({ edit }) => {
  const profile = useSelector(state => state.profile);
  const navigate = useNavigate();
  const [fullName, setFullName] = useState(`${profile.firstName} ${profile.lastName}`);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [industry, setIndustry] = useState('');
  const [businessDescription, setBusinessDescription] = useState('');
  const [targetMarket, setTargetMarket] = useState('');
  const [competitiveAdvantage, setCompetitiveAdvantage] = useState('');
  const [currentRevenue, setCurrentRevenue] = useState('');
  const [fundingGoal, setFundingGoal] = useState('');
  const [teamExperience, setTeamExperience] = useState('');
  const [marketingStrategy, setMarketingStrategy] = useState('');
  const [businessPlan, setBusinessPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [picturePath, setPicturePath] = useState('');
    const [backgroundImage, setBackgroundImage] = useState('');
  const handleIndustryChange = (event) => {
    setIndustry(event.target.value);
    const industryImages = { Technology, Finance, Manufacturing, Retail, Healthcare };
    const imagePath = industryImages[event.target.value];
    if (imagePath) {
      fetch(imagePath)
        .then(response => response.blob())
        .then(blob => {
          const reader = new FileReader();
          reader.onloadend = () => setPicturePath(reader.result);
          reader.readAsDataURL(blob);
        })
        .catch(error => console.error('Error loading image:', error));
    } else {
      setPicturePath('');
    }
  };

  const handleBusinessPlanChange = (e) => {
    // setBusinessPlan(e.target.files[0]);
    const file = e.target.files[0]
    const formDataImage = new FormData();
    formDataImage.append('image', file);
    const api = `${process.env.REACT_APP_API_URL}/uploadImage/singleImage`
    axios.post(api, formDataImage, { headers: { 'Content-Type': 'multipart/form-data' } })
    .then((res)=>{
      setBusinessPlan(res.data?.imageUrl)
    })


  };

  const handleBackgroundImageChange = (e) => {
    const file = e.target.files[0]
    const formDataImage = new FormData();
    formDataImage.append('image', file);
    const api = `${process.env.REACT_APP_API_URL}/uploadImage/singleImage`
    axios.post(api, formDataImage, { headers: { 'Content-Type': 'multipart/form-data' } })
    .then((res)=>{
      setBackgroundImage(res.data?.imageUrl)
    })
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const body = {
        userId: profile._id,
        name: fullName,
        email,
        phone,
        amount,
        businessName,
        industry,
        businessDescription,
        businessPlan,
        targetMarket,
        competitiveAdvantage,
        currentRevenue,
        fundingGoal,
        teamExperience,
        marketingStrategy,
        // picturePath,
        backgroundImage
      };

      const response = await axios.post(`${process.env.REACT_APP_API_URL}/donations/create`, body);

      if (response.status === 201) {
        toast.success('Donation request created successfully');
        navigate('/home/donations');
      } else {
        const errorData = response.data;
        toast.error(errorData.error || 'Failed to create donation request');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-6 p-6 bg-white rounded-xl ">
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Full Name */}
        <div className="flex flex-col">
          <label className="mb-2 font-medium text-gray-700">Full Name</label>
          <input
            type="text"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            required
            disabled
            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>
  
        {/* Email */}
        <div className="flex flex-col">
          <label className="mb-2 font-medium text-gray-700">Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
  
        {/* Phone Number */}
        <div className="flex flex-col">
          <label className="mb-2 font-medium text-gray-700">Phone Number</label>
          <input
            type="Number"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            required
            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
  
        {/* Investment Amount */}
        <div className="flex flex-col">
          <label className="mb-2 font-medium text-gray-700">Investment Amount (₹)</label>
          <input
            type="number"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            required
            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
  
        {/* Business Name */}
        <div className="flex flex-col">
          <label className="mb-2 font-medium text-gray-700">Business Name</label>
          <input
            type="text"
            value={businessName}
            onChange={e => setBusinessName(e.target.value)}
            required
            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
  
        {/* Industry */}
        <div className="flex flex-col">
          <label className="mb-2 font-medium text-gray-700">Industry</label>
          <select
            value={industry}
            onChange={handleIndustryChange}
            required
            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Industry</option>
            <option value="Technology">Technology</option>
            <option value="Finance">Finance</option>
            <option value="Healthcare">Healthcare</option>
            <option value="Manufacturing">Manufacturing</option>
            <option value="Retail">Retail</option>
          </select>
        </div>
  
        {/* Business Description */}
        <div className="flex flex-col md:col-span-2">
          <label className="mb-2 font-medium text-gray-700">Business Description</label>
          <textarea
            value={businessDescription}
            onChange={e => setBusinessDescription(e.target.value)}
            required
            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
          />
        </div>
  
        {/* Business Plan (PDF) */}
        <div className="flex flex-col md:col-span-2">
          <label className="mb-2 font-medium text-gray-700">Business Plan (PDF)</label>
          <input
            type="file"
            accept=".pdf"
            onChange={handleBusinessPlanChange}
            required
            className="block text-sm text-gray-600"
          />

          {businessPlan && (
            <div className="mt-2">
              <a
                href={businessPlan}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                View Business Plan
              </a>
            <button
              type="button"
              onClick={() => setBusinessPlan(null)}
              className="text-red-500 hover:underline ml-2"
            >
              Remove
            </button>
            
            </div>
          )}

        </div>


        <div className="flex flex-col md:col-span-2">
          <label className="mb-2 font-medium text-gray-700">Add Background Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleBackgroundImageChange}
            required
            className="block text-sm text-gray-600"
          />

          {backgroundImage && (
            <div className="mt-2">
              <img src={backgroundImage} alt="Background Image" className="w-40 h-40 object-cover" />
            <button
              type="button"
              onClick={() => setBackgroundImage(null)}
              className="text-red-500 hover:underline ml-2"
            >
              Remove
            </button>
            
            </div>
          )}

        </div>
  
        {/* Target Market */}
        <div className="flex flex-col">
          <label className="mb-2 font-medium text-gray-700">Target Market</label>
          <input
            type="text"
            value={targetMarket}
            onChange={e => setTargetMarket(e.target.value)}
            required
            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
  
        {/* Competitive Advantage */}
        <div className="flex flex-col md:col-span-2">
          <label className="mb-2 font-medium text-gray-700">Competitive Advantage</label>
          <textarea
            value={competitiveAdvantage}
            onChange={e => setCompetitiveAdvantage(e.target.value)}
            required
            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
          />
        </div>
  
        {/* Current Revenue */}
        <div className="flex flex-col">
          <label className="mb-2 font-medium text-gray-700">Current Revenue (₹)</label>
          <input
            type="number"
            value={currentRevenue}
            onChange={e => setCurrentRevenue(e.target.value)}
            required
            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
  
        {/* Funding Goal */}
        <div className="flex flex-col">
          <label className="mb-2 font-medium text-gray-700">Funding Goal (₹)</label>
          <input
            type="number"
            value={fundingGoal}
            onChange={e => setFundingGoal(e.target.value)}
            required
            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
  
        {/* Team Experience */}
        <div className="flex flex-col md:col-span-2">
          <label className="mb-2 font-medium text-gray-700">Team Experience</label>
          <textarea
            value={teamExperience}
            onChange={e => setTeamExperience(e.target.value)}
            required
            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
          />
        </div>
  
        {/* Marketing Strategy */}
        <div className="flex flex-col md:col-span-2">
          <label className="mb-2 font-medium text-gray-700">Marketing Strategy</label>
          <textarea
            value={marketingStrategy}
            onChange={e => setMarketingStrategy(e.target.value)}
            required
            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
          />
        </div>
  
        {/* Submit Button */}
        <div className="md:col-span-2 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
          >
            {loading ? 'Submitting...' : 'Submit Donation'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateDonation;
