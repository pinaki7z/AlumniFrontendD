import '../../pages/Jobs/jobs.css';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Modal from 'react-bootstrap/Modal';
import React from 'react';
import { useState, useEffect } from 'react';
import Accordion from 'react-bootstrap/Accordion';
import { useAccordionButton } from 'react-bootstrap/AccordionButton';
import Card from 'react-bootstrap/Card';
import { Col, Row } from 'react-bootstrap';
import axios from 'axios';
import { toast } from 'react-toastify';
import JobPost from "../JobPost";
import { useSelector } from 'react-redux';
import PageSubTitle from '../PageSubTitle';
import { Route, Routes } from "react-router-dom";
import Donations from '../../pages/Donations';
import Sponsorships from '../../pages/Sponsorships';
import { useLocation } from 'react-router-dom';
import { Archive } from '../../pages/Jobs/Archive';
import baseUrl from '../../config';
import { FaSearch } from 'react-icons/fa'; // Import the search icon
import { Link } from 'react-router-dom';



const IntJobs = (props) => {
    const [modalShow, setModalShow] = React.useState(false);
    const [rangeValue, setRangeValue] = useState(0);
    const [questions, setQuestions] = useState(['']);
    const [loading, setLoading] = useState(true);
    const [jobs, setJobs] = useState([]);
    const [internships, setInternships] = useState([]);
    const [archivedJobs, setArchivedJobs] = useState([]);
    const [archivedInternships, setArchivedInternships] = useState([]);
    const title = props.title;
    const titleS = props.titleS;
    const handleDropdownSelect = props.handleDropdownSelect;
    const profile = useSelector((state) => state.profile);
    const buttontext1Link = "/jobs";
    const buttontext2Link = "/jobs/archive";
    const buttontext3Link = "/internships";
    const buttontext4Link = "/internships/archive";
    const [selectedEmploymentType, setSelectedEmploymentType] = useState('All');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [showSalaryFields, setShowSalaryFields] = useState(false);
    const [isPaid, setIsPaid] = useState(false);
    const [isUnpaid, setIsUnpaid] = useState(false);
    console.log('isUnpaid', isUnpaid)


    let admin;
    if (profile.profileLevel === 0 || profile.profileLevel === 1) {
        admin = true;
    }
    const pathname = useLocation().pathname;

    const handleSearchChange = (e, selectedOption, type) => {
        let updatedSearchQuery = { ...props.searchQuery };

        if (type === 'text') {
            updatedSearchQuery.title = e.target.value;
        } else if (type === 'employmentType') {
            if (selectedOption === "") {

                setSelectedEmploymentType("");
                updatedSearchQuery.employmentType = "";
                setSelectedEmploymentType('Employment-Type');

            } else {
                setSelectedEmploymentType(selectedOption);
                updatedSearchQuery.employmentType = selectedOption;
            }
        } else if (type === 'category') {
            if (selectedOption === "") {
                setSelectedCategory("");
                updatedSearchQuery.category = "";
                setSelectedCategory('Category');
            } else {
                setSelectedCategory(selectedOption);
                updatedSearchQuery.category = selectedOption;
            }
        }

        props.setSearchQuery(updatedSearchQuery);
        console.log('search', props.setSearchQuery);
    };







    function CustomToggle({ children, eventKey }) {
        const decoratedOnClick = useAccordionButton(eventKey, () =>
            console.log('totally custom!'),
        );
        return (
            <button
                type="button"
                style={{ backgroundColor: 'pink' }}
                onClick={decoratedOnClick}
            >
                {children}
            </button>
        );
    }

    const handleRangeChange = (event) => {
        setRangeValue(event.target.value);
    };


    function MyVerticallyCenteredModal(props) {
        const [formData, setFormData] = useState({
            userId: profile._id,
            title: '',
            location: '',
            salaryMin: '',
            salaryMax: '',
            currency: 'INR',
            duration: 'per hour',
            company: profile.workingAt,
            employmentType: 'Full-time',
            category: 'Other',
            type: '',
            verified: true,
            description: '',
            attachments: [],
            locationType: {
                onSite: false,
                remote: false,
                hybrid: false
            }
        });
        const [loading, setLoading] = useState(false);
        const [isJobChecked, setIsJobChecked] = useState(false);
        const [isInternshipChecked, setIsInternshipChecked] = useState(false);
        const [formError, setFormError] = useState('');
        const [isPaid, setIsPaid] = useState(false);
        const [isUnpaid, setIsUnpaid] = useState(false);
        const [isMyCompany, setIsMyCompany] = useState(true); // Controls company option
        const [verified, setVerified] = useState(true);
        const handleInputChange = (e) => {
            const { name, value } = e.target;
            setFormData(prevFormData => ({
                ...prevFormData,
                [name]: value,
            }));
        };

        const handleCoverImageChange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const imageFormData = new FormData();
                imageFormData.append('image', file);
                axios.post(`${process.env.REACT_APP_API_URL}/uploadImage/singleImage`, imageFormData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                })
                    .then(res => {
                        setFormData({ ...formData, coverImage: res.data });
                        //setPicLoading(false);
                    })
                    .catch(err => {
                        console.log(err);
                    });
            }
        };

        const handleImageChange = (e) => {
            const files = e.target.files;
            if (files && files.length > 0) {

                const data = new FormData();

                // Append each file to the FormData object with the key 'images[]'
                Array.from(files).forEach((file) => {
                    data.append('images', file);  // Use 'images' as the key for all files
                });

                // Send the FormData to the API
                axios.post(`${process.env.REACT_APP_API_URL}/uploadImage/image`, data, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                })
                    .then(res => {
                        // Assuming res.data contains the uploaded files' data (like URLs or IDs)
                        setFormData(prevState => ({
                            ...prevState,
                            attachments: res.data  // Update the attachments array in formData
                        }));
                    })
                    .catch(err => {
                        console.log(err);
                    });
            }
        };

        const handleCompanySelection = (e) => {
            const { value } = e.target;
            if (value === 'myCompany') {
                setIsMyCompany(true);
                setVerified(true); // My company is verified
                setFormData(prevFormData => ({
                    ...prevFormData,
                    company: profile.workingAt,
                    verified: true // Set profile working at by default
                }));
            } else if (value === 'otherCompany') {
                setIsMyCompany(false);
                setVerified(false); // Other company is not verified
                setFormData(prevFormData => ({
                    ...prevFormData,
                    company: '',
                    verified: false // Allow user to type the company name
                }));
            }
        };

        const handlePublish = async () => {
            if (!formData.type) {
                setFormError('Please select either Job or Internship.');
                return;
            }
            setLoading(true);

            try {
                //const formDataToSend = { ...formData };
                const formDataToSend = new FormData();
                console.log('job formdata before', formDataToSend)

                // for (const key in formData) {
                //     if (key === 'attachments') {
                //         formData.attachments.forEach(file => {
                //             formDataToSend.append('attachments', file);
                //         });
                //     } else if (key === 'locationType') {
                //         for (const locationKey in formData.locationType) {
                //             formDataToSend.append(`locationType[${locationKey}]`, formData.locationType[locationKey]);
                //         }
                //     } else {
                //         formDataToSend.append(key, formData[key]);
                //     }
                // }
                console.log('job formdata', formData)
                console.log('job formdata to send', formDataToSend)
                const response = await axios.post(`${process.env.REACT_APP_API_URL}/jobs/create`, formData);
                if (response) {
                    console.log('Data saved successfully');
                    const successMessage = formData.type === 'Internship' ? 'The internship post is being validated by the admin' : 'The job post is being validated by the admin';
                    toast.success(successMessage);
                    props.onHide();
                } else {
                    const errorData = await response.json();
                    console.error('Failed to save data', errorData);
                }
            } catch (error) {
                console.error('Error:', error);
            }
            setLoading(false);
        };


        const handleCheckboxChange = (e) => {
            const { name, checked } = e.target;
            if (name === 'isJob' && checked) {
                setIsUnpaid(false);
                setIsJobChecked(true);
                setIsInternshipChecked(false);
                setFormData(prevFormData => ({
                    ...prevFormData,
                    type: 'Job',
                }));
            } else if (name === 'isInternship' && checked) {
                setIsInternshipChecked(true);
                setIsJobChecked(false);
                setFormData(prevFormData => ({
                    ...prevFormData,
                    type: 'Internship',
                    employmentType: 'Internship'
                }));
            }
            setFormError('');
        };

        const handlePaidUnpaid = (e) => {
            const { name, checked } = e.target;
            if (name === 'isPaid') {
                setIsPaid(checked);
                setIsUnpaid(false);
            } else if (name === 'isUnpaid') {
                setIsUnpaid(checked);
                setIsPaid(false);
                setFormData(prevFormData => ({
                    ...prevFormData,
                    salaryMin: '',
                    salaryMax: ''
                }));
            }
        };

        const handleLocationTypeChange = (type) => {
            setFormData(prevFormData => ({
                ...prevFormData,
                locationType: {
                    onSite: type === 'onSite',
                    remote: type === 'remote',
                    hybrid: type === 'hybrid'
                }
            }));
        };

        return (
            <Modal
                {...props}
                size="lg"
                aria-labelledby="contained-modal-title-vcenter"
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title-vcenter">
                        Create a Job/Internship post
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form encType="multipart/form-data">
                        <Row>
                            <Col>
                                <Form.Group as={Col} >
                                    <Form.Label htmlFor="job">Title*</Form.Label>
                                    <Form.Control
                                        id="job"
                                        type="text"
                                        placeholder="Enter job/internship title"
                                        name='title'
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col>
                                <Form.Group as={Col} controlId="location">
                                    <Form.Label>Location*</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Enter location"
                                        name="location"
                                        value={formData.location}
                                        onChange={handleInputChange}
                                        disabled={formData.locationType.remote}
                                        required
                                    />
                                </Form.Group>

                            </Col>
                        </Row>

                        <Form.Group controlId="companyType">
                            <Form.Label>I am hiring for :-*</Form.Label>
                            <div>
                                <Form.Check
                                    type='radio'
                                    id='myCompany-radio'
                                    label='My company'
                                    value='myCompany'
                                    checked={isMyCompany}
                                    onChange={handleCompanySelection}
                                />
                                <Form.Check
                                    type='radio'
                                    id='otherCompany-radio'
                                    label='Other Company'
                                    value='otherCompany'
                                    checked={!isMyCompany}
                                    onChange={handleCompanySelection}
                                />
                            </div>
                        </Form.Group>

                        {/* Company name input */}
                        <Form.Group as={Col}>
                            <Form.Label htmlFor="company">Company Name</Form.Label>
                            <Form.Control
                                id="company"
                                type="text"
                                placeholder="Enter company name"
                                name="company"
                                value={formData.company}
                                onChange={handleInputChange}
                                disabled={isMyCompany} // Disable if "My company" is selected
                            />
                        </Form.Group>
                        <Row>
                            <Col>
                                <Form.Group controlId="salaryRange">
                                    <Form.Label>Salary Range</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Minimum"
                                        name="salaryMin"
                                        className='mb-2'
                                        value={formData.salaryMin}
                                        onChange={handleInputChange}
                                        disabled={isUnpaid}
                                    />
                                    To
                                    <Form.Control
                                        type="text"
                                        placeholder="Maximum"
                                        name="salaryMax"
                                        className='mt-2'
                                        value={formData.salaryMax}
                                        onChange={handleInputChange}
                                        disabled={isUnpaid}
                                    />
                                </Form.Group>
                            </Col>
                            <Col>
                                <Form.Group controlId="currency">
                                    <Form.Label>Currency</Form.Label>
                                    <DropdownButton
                                        id="createJob-currency-dropdown"
                                        title={formData.currency}
                                        style={{ marginTop: '0px' }}
                                        onSelect={(eventKey) => {
                                            setFormData(prevFormData => ({
                                                ...prevFormData,
                                                currency: eventKey,
                                            }));
                                        }}
                                    >
                                        <div className="scrollable-dropdown">
                                            <Dropdown.Item eventKey="INR">INR</Dropdown.Item>
                                            <Dropdown.Item eventKey="USD">USD</Dropdown.Item>
                                            <Dropdown.Item eventKey="JPY">JPY</Dropdown.Item>
                                            <Dropdown.Item eventKey="EUR">EUR</Dropdown.Item>
                                            <Dropdown.Item eventKey="GBP">GBP</Dropdown.Item>
                                        </div>
                                    </DropdownButton>
                                </Form.Group>
                                <Form.Group controlId="wages">
                                    <Form.Label style={{ marginBottom: '0px' }}>Wages</Form.Label>
                                    <DropdownButton
                                        id="createJob-timings-dropdown"
                                        title={formData.duration}
                                        style={{ marginTop: '0px' }}
                                        onSelect={(eventKey) => {
                                            setFormData(prevFormData => ({
                                                ...prevFormData,
                                                duration: eventKey,
                                            }));
                                        }}
                                    >
                                        <div className="scrollable-dropdown">
                                            <Dropdown.Item eventKey="per hour">per hour</Dropdown.Item>
                                            <Dropdown.Item eventKey="per week">per week</Dropdown.Item>
                                            <Dropdown.Item eventKey="per month">per month</Dropdown.Item>
                                            <Dropdown.Item eventKey="per year">per year</Dropdown.Item>
                                        </div>
                                    </DropdownButton>
                                </Form.Group>
                            </Col>
                        </Row>
                        <Form.Group controlId="job-internship">
                            <Form.Check
                                type='checkbox'
                                id='job-checkbox'
                                label='Job'
                                name='isJob'
                                checked={formData.type === 'Job'}
                                onChange={handleCheckboxChange}
                            />
                            <Form.Check
                                type='checkbox'
                                id='internship-checkbox'
                                label='Internship'
                                name='isInternship'
                                checked={formData.type === 'Internship'}
                                onChange={handleCheckboxChange}
                            />
                            {formError && <div className="text-danger">{formError}</div>}
                        </Form.Group>
                        <Form.Group controlId="employmentType">
                            <Form.Label>Employment Type</Form.Label>
                            <DropdownButton
                                id="createEmployment-type-dropdown"
                                title={formData.employmentType}
                                disabled={!isJobChecked}
                                onSelect={(eventKey) => {
                                    if (eventKey !== "Volunteer") {
                                        setIsUnpaid(false);
                                    }
                                    setFormData((prevFormData) => ({
                                        ...prevFormData,
                                        employmentType: eventKey,
                                    }));
                                }}
                            >
                                <div className="scrollable-dropdown">
                                    <Dropdown.Item eventKey="Full-time">Full-time</Dropdown.Item>
                                    <Dropdown.Item eventKey="Part-time">Part-time</Dropdown.Item>
                                    <Dropdown.Item eventKey="Volunteer">Volunteer</Dropdown.Item>
                                    <Dropdown.Item eventKey="Contract">Contract</Dropdown.Item>
                                </div>
                            </DropdownButton>
                        </Form.Group>
                        {(formData.type === 'Internship' || formData.employmentType === 'Volunteer') && (
                            <Form.Group controlId="internship-type">
                                <Form.Check
                                    type='checkbox'
                                    id='paid-checkbox'
                                    label='Paid'
                                    name='isPaid'
                                    checked={isPaid}
                                    onChange={handlePaidUnpaid}
                                />
                                <Form.Check
                                    type='checkbox'
                                    id='unpaid-checkbox'
                                    label='Unpaid'
                                    name='isUnpaid'
                                    checked={isUnpaid}
                                    onChange={handlePaidUnpaid}
                                />
                            </Form.Group>
                        )}
                        <Form.Group controlId="category">
                            <Form.Label>Category</Form.Label>
                            <DropdownButton
                                id="createJob-categories-dropdown"
                                title={formData.category}
                                onSelect={(eventKey) => {
                                    setFormData(prevFormData => ({
                                        ...prevFormData,
                                        category: eventKey,
                                    }));
                                }}
                            >
                                <div className="scrollable-dropdown">
                                    <Dropdown.Item eventKey="Other" >Other</Dropdown.Item>
                                    <Dropdown.Item eventKey="Admin & Office" >Admin & Office</Dropdown.Item>
                                    <Dropdown.Item eventKey="Art & Design" >Art & Design</Dropdown.Item>

                                </div>
                            </DropdownButton>
                        </Form.Group>
                        <Form.Group controlId="locationType">
                            <Form.Label>Location Type</Form.Label>
                            <div>
                                <Form.Check
                                    type='checkbox'
                                    id='onSite-checkbox'
                                    label='On-site'
                                    checked={formData.locationType.onSite}
                                    onChange={() => handleLocationTypeChange('onSite')}
                                />
                                <Form.Check
                                    type='checkbox'
                                    id='remote-checkbox'
                                    label='Remote'
                                    checked={formData.locationType.remote}
                                    onChange={() => handleLocationTypeChange('remote')}
                                />
                                <Form.Check
                                    type='checkbox'
                                    id='hybrid-checkbox'
                                    label='Hybrid'
                                    checked={formData.locationType.hybrid}
                                    onChange={() => handleLocationTypeChange('hybrid')}
                                />
                            </div>
                        </Form.Group>
                        <Accordion defaultActiveKey="0">
                            <Card>
                                <Card.Header>
                                    <CustomToggle eventKey="1" style={{ padding: '10px' }}>Add a question</CustomToggle>
                                </Card.Header>
                                <Accordion.Collapse eventKey="1">
                                    <Card.Body><Form.Control
                                        as="textarea"
                                        rows={3}
                                        placeholder="Enter question"
                                        name="questions"
                                        value={formData.questions}
                                        onChange={handleInputChange}
                                    /></Card.Body>
                                </Accordion.Collapse>
                            </Card>
                        </Accordion>
                        <Form.Group controlId="description">
                            <Form.Label>Description</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                placeholder={`Enter ${formData.type.toLowerCase()} description`}
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                            />
                        </Form.Group>
                        <Form.Group controlId="coverImage">
                            <Form.Label>Add cover image*</Form.Label>
                            <input className='form-control' type="file" onChange={handleCoverImageChange} accept=".jpg, .jpeg, .png, .pdf" required />
                        </Form.Group>
                        <Form.Group controlId="attachments">
                            <Form.Label>Add attachments*</Form.Label>
                            <input className='form-control' type="file" onChange={handleImageChange} multiple accept=".jpg, .jpeg, .png, .pdf" required />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={props.onHide}>Close</Button>
                    <Button onClick={handlePublish}>{loading ? 'Publishing...' : 'Publish'}</Button>
                </Modal.Footer>
            </Modal>
        );
    }


    const generateTitle = () => {
        let title = props.title;
        let categoryTitle = selectedCategory !== 'All' ? selectedCategory : 'Categories';
        let jobTypeTitle = selectedEmploymentType !== 'All' ? selectedEmploymentType : `Employment Type`;

        return { categoryTitle, jobTypeTitle };
    };

    const employmentTypes = ['Full-time', 'Part-time', 'Internship', 'Volunteer', 'Contract'];
    const categories = [
        'Other',
        'Admin & Office',
        'Art & Design',
        'Business Operations',
        'Healthcare',
        'Management',
        'Retail & Sales',
    ];


    return (
        <>

            <div style={{ width: '100%' }}>
                <div className='bg-[#cef3df] p-4 rounded-lg mb-3'>
                    <h2 className='text-[#136175] mb-2 text-3xl md:text-4xl font-bold'>Jobs</h2>
                    <p className='text-base md:text-lg text-[#136175]' >
                        Discover, explore, and submit applications for job openings on the Alumni Portal.
                    </p>
                </div>

                {/* Search Bar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', width: '100%' }}>
                    <div style={{ position: 'relative', flexGrow: 1 }}>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Search for jobs/internships"
                            onChange={(e) => handleSearchChange(e, e.target.value, 'text')}
                            style={{
                                width: '100%',
                                padding: '10px 40px 10px 10px',
                                fontSize: '16px',
                                borderRadius: '4px',
                                border: '1px solid #ced4da',
                            }}
                        />
                        <FaSearch
                            style={{
                                position: 'absolute',
                                right: '10px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                fontSize: '18px',
                                color: '#6c757d',
                            }}
                        />
                    </div>
                </div>

                {/* Dropdowns */}
                <div className="flex gap-3 mb-4 w-full">
            {/* Employment Type Dropdown */}
            <div className="relative w-[500px]">
                <select
                    value={selectedEmploymentType}
                    onChange={(e) => handleSearchChange('', e.target.value, 'employmentType')}
                    className="w-full p-3 border border-gray-300 rounded-md font-semibold text-white bg-[#0A3A4C] outline-none cursor-pointer"
                >
                    <option value="All" disabled>Employment Type</option>
                    {employmentTypes.map((type) => (
                        <option key={type} value={type}>
                            {type}
                        </option>
                    ))}
                </select>
            </div>

            {/* Category Dropdown */}
            <div className="relative w-[500px]">
                <select
                    value={selectedCategory}
                    onChange={(e) => handleSearchChange('', e.target.value, 'category')}
                    className="w-full p-3 border border-gray-300 rounded-md text-white font-semibold bg-[#0A3A4C] outline-none cursor-pointer"
                >
                    <option value="All" disabled>Category</option>
                    {categories.map((cat) => (
                        <option key={cat} value={cat}>
                            {cat}
                        </option>
                    ))}
                </select>
            </div>
        </div>

                {/* Buttons */}
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>

                    {profile.profileLevel === 2 ? (
                        <div>
                            <Link
                                to="/home/jobs/create"
                            >
                                <button
                                    style={{
                                        backgroundColor: '#71be95',
                                        color: 'black',
                                        border: 'none',
                                        padding: '10px 20px',
                                        color: 'white',
                                        cursor: 'pointer',
                                        borderRadius: '4px'
                                    }}>Create</button>
                            </Link>
                        </div>
                    ) : null}
                </div>
            </div >

            <MyVerticallyCenteredModal
                show={modalShow}
                onHide={() => setModalShow(false)}
            />



        </>
    );
}

export default IntJobs;