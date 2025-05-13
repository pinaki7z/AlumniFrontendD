import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import baseUrl from '../../config';

const CreatesSponsorship = ({ edit }) => {
    const {_id} = useParams();
  const profile = useSelector(state => state.profile);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    userId: profile._id,
    nameOfOrganiser: `${profile.firstName} ${profile.lastName}`,
    nameOfEvent: '',
    eventDescription: '',
    emailOfOrganiser: '',
    number: '',
    sponsorshipAmount: '',
    useOfFunds: '',
    eventDate: '',
    location: '',
    targetAudience: '',
    expectedAttendees: '',
    sponsorshipBenefits: '',
    additionalInfo: '',
    backgroundImage: ''
  });

  const fetchDonation = async()=>{
    const response = await axios.get(`${process.env.REACT_APP_API_URL}/sponsorships/${_id}`);
    const data = response.data;
    setForm({
      userId: data.userId,
      nameOfOrganiser: data.nameOfOrganiser,
      nameOfEvent: data.nameOfEvent,
      eventDescription: data.eventDescription,
      emailOfOrganiser: data.emailOfOrganiser,
      number: data.number,
      sponsorshipAmount: data.sponsorshipAmount,
      useOfFunds: data.useOfFunds,
      eventDate: data.eventDate,
      location: data.location,
      targetAudience: data.targetAudience,
      expectedAttendees: data.expectedAttendees,
      sponsorshipBenefits: data.sponsorshipBenefits,
      additionalInfo: data.additionalInfo,
      backgroundImage: data.backgroundImage
    });
  }


  useEffect(() => {
    if (edit) {
      fetchDonation();
    }
  }, [edit]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    setForm(prev => ({
      ...prev,
      [name]: ['number', 'sponsorshipAmount', 'expectedAttendees'].includes(name)
        ? parseFloat(val) || ''
        : val
    }));
  };

  const handleBackgroundImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const data = new FormData();
    data.append('image', file);
    axios.post(
      `${process.env.REACT_APP_API_URL}/uploadImage/singleImage`,
      data,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    )
    .then(res => {
      setForm(prev => ({ ...prev, backgroundImage: res.data?.imageUrl }));
    })
    .catch(err => {
      console.error('Image upload failed:', err);
      toast.error('Failed to upload background image');
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const endpoint = edit
        ? `${process.env.REACT_APP_API_URL}/sponsorships/${_id}`
        : `${process.env.REACT_APP_API_URL}/sponsorships/create`;
      const res = await fetch(endpoint, {
        method: edit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        toast.success(`Sponsorship request ${edit ? 'updated' : 'created'} successfully!`);
        navigate('/home/sponsorships');
        window.location.reload();
      } else {
        const err = await res.json();
        toast.error(err.error || `Failed to ${edit ? 'update' : 'create'} sponsorship request`);
      }
    } catch (err) {
      console.error(err);
      toast.error('Something went wrong. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-3 mt-10 p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">
        {edit ? 'Edit' : 'Create'} Sponsorship Request
      </h2>
      <form className="space-y-5" onSubmit={handleSubmit}>
        {Object.entries({
          nameOfOrganiser: 'Name of Organiser',
          nameOfEvent: 'Name of Event',
          eventDescription: 'Event Description',
          emailOfOrganiser: 'Email of Organiser',
          number: 'Contact Number',
          sponsorshipAmount: 'Total Amount Required (₹)',
          useOfFunds: 'Use of Funds',
          eventDate: 'Event Date',
          location: 'Event Location',
          targetAudience: 'Target Audience',
          expectedAttendees: 'Expected Attendees',
          sponsorshipBenefits: 'Sponsorship Benefits',
          additionalInfo: 'Additional Information'
        }).map(([key, label]) => (
          <div key={key} className="flex flex-col">
            <label htmlFor={key} className="text-sm font-medium text-gray-700 mb-1">
              {label}:
            </label>
            {['eventDescription', 'useOfFunds', 'sponsorshipBenefits', 'additionalInfo'].includes(key) ? (
              <textarea
                id={key}
                name={key}
                value={form[key]}
                onChange={handleChange}
                required={key !== 'additionalInfo'}
                className="mt-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none h-24"
              />
            ) : key === 'eventDate' ? (
              <input
                type="date"
                id={key}
                name={key}
                value={form[key]}
                onChange={handleChange}
                required
                className="mt-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            ) : (
              <input
                type={['number', 'sponsorshipAmount', 'expectedAttendees'].includes(key) ? 'number' : key === 'emailOfOrganiser' ? 'email' : 'text'}
                id={key}
                name={key}
                value={form[key]}
                onChange={handleChange}
                required={key !== 'additionalInfo'}
                className="mt-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            )}
          </div>
        ))}

        {/* Background Image Upload */}
        <div className="flex flex-col">
          <label htmlFor="backgroundImage" className="text-sm font-medium text-gray-700 mb-1">
            Background Image:
          </label>
          <input
            type="file"
            id="backgroundImage"
            accept="image/*"
            onChange={handleBackgroundImageChange}
            className="mt-1 block text-sm text-gray-600"
          />
          {form.backgroundImage && (
            <div className="mt-2 flex items-center">
              <img
                src={form.backgroundImage}
                alt="Background Preview"
                className="w-24 h-24 object-cover rounded"
              />
              <button
                type="button"
                onClick={() => setForm(prev => ({ ...prev, backgroundImage: '' }))}
                className="ml-4 text-red-500 hover:underline"
              >
                Remove
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <Link to="/home/sponsorships" className="text-indigo-600 hover:text-indigo-500 font-medium">
            Back
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center px-6 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg shadow hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {loading ? (edit ? 'Updating...' : 'Creating...') : (edit ? 'Update' : 'Create')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatesSponsorship;
