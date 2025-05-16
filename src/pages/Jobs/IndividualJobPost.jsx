import { useParams } from "react-router-dom";
import { useCookies } from "react-cookie";
import axios from "axios";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { GiMoneyStack } from 'react-icons/gi';
import { FaCalendarAlt } from "react-icons/fa";
import { FcBriefcase } from "react-icons/fc";
import { FaMapMarkerAlt } from "react-icons/fa";
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import React from "react";
import Form from 'react-bootstrap/Form';
import { toast } from "react-toastify";
import { lineSpinner } from 'ldrs';
import './individualJobPost.css';
import coverImage from '../../images/cultural-1.jpg'
import { fontSize } from "@mui/system";
import { Link } from 'react-router-dom';
import { CiLocationArrow1 } from "react-icons/ci";
import { RiHomeSmileLine } from "react-icons/ri";
import baseUrl from "../../config";
import { Spinner } from "react-bootstrap";
import moment from 'moment'
lineSpinner.register()




const IndividualJobPost = () => {
    const { _id, title } = useParams();
    const [cookie] = useCookies(['access_token']);
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [starLoading, setStarLoading] = useState(false);
    const [applyLoading, setApplyLoading] = useState(false);
    const [statusLoading, setStatusLoading] = useState(null);
    const [showShareOptions, setShowShareOptions] = useState(false);
    const [modalShow, setModalShow] = React.useState(false);
    const [candidateModalShow, setCandidateModalShow] = React.useState(false);
    const [appliedCandidates, setAppliedCandidates] = useState([]);
    const [appliedCandidatesDetails, setAppliedCandidatesDetails] = useState([]);
    const [showImagesModal, setShowImagesModal] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [loader, setLoader] = useState(true);



    const toggleShareOptions = () => {
        setShowShareOptions(!showShareOptions);
    };
    const profile = useSelector((state) => state.profile);

    const fetchDonationPost = async () => {
        setLoader(true)
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/${title}/${_id}`)
            const data = response.data;
            setJobs(data);
            setLoading(false)
            setLoader(false)
        } catch (error) {
            console.error(error);

        }
    }

    let admin;
    if (profile.profileLevel === 0) {
        admin = true;
    }


    const fetchAppliedUserIds = async () => {
        console.log('id', _id)
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/${title}/appliedCandidates/${_id}`)
        const data = response.data;
        setAppliedCandidates(data.userIds);
        setAppliedCandidatesDetails(data.appliedCandidates);
    }




    useEffect(() => {
        fetchDonationPost();
        // if (title === 'Jobs') {
        fetchAppliedUserIds();
        // }
        // if (title === 'Internships') {
        //     fetchAppliedUserIds();
        // }
    }, [_id])
    const isApplied = appliedCandidates.includes(profile._id);

    function MyVerticallyCenteredModal(props) {
        const [name, setName] = useState('');
        const [resume, setResume] = useState(null);
        const [questions, setQuestions] = useState([]);
        const [answers, setAnswers] = useState([]);
        const [applyLoading, setApplyLoading] = useState(false);

        useEffect(() => {
            if (jobs.questions && Array.isArray(jobs.questions)) {
                setQuestions(jobs.questions);
                setAnswers(jobs.questions.map(question => ({ question: question, answer: '' })));
            }
        }, [props.jobs]);


        const handleNameChange = (e) => {
            setName(e.target.value);
        };

        const handleResumeChange = (e) => {
            setResume(e.target.files[0]);
        };

        const handleAnswerChange = (index, e) => {
            const newAnswers = [...answers];
            newAnswers[index].answer = e.target.value;
            setAnswers(newAnswers);
        };

        const handleSubmit = () => {
            setApplyLoading(true);
            const apiUrl = `${process.env.REACT_APP_API_URL}/jobs/apply/${_id}`;
            const formData = new FormData();
            formData.append('userId', profile._id);
            formData.append('name', name);
            formData.append('resume', resume);


            answers.forEach((ans, index) => {
                formData.append(`answers[${index}][question]`, ans.question);
                formData.append(`answers[${index}][answer]`, ans.answer);
            });

            fetch(apiUrl, {
                method: 'POST',
                body: formData
            })
                .then(response => {
                    if (response.ok) {
                        console.log('Application submitted successfully!');
                        toast.success("Applied");
                        window.location.reload();
                        setApplyLoading(false);
                        props.onHide();
                    } else {
                        console.error('Failed to submit application');
                        setApplyLoading(false);
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    setApplyLoading(false);
                });
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
                        Apply
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                            <Form.Label>Name</Form.Label>
                            <Form.Control type="text" placeholder="Name" value={name} onChange={handleNameChange} />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="exampleForm.ControlInput2">
                            <Form.Label>Upload Resume</Form.Label>
                            <input
                                type="file"
                                //className="form-control"
                                accept=".pdf" onChange={handleResumeChange}  // Adding black border
                            />
                        </Form.Group>
                        {questions && questions.length > 0 && questions[0] !== "" && questions.map((question, index) => (
                            <Form.Group key={index} className="mb-3" controlId={`question-${index}`}>
                                <Form.Label>{question}</Form.Label>
                                <Form.Control type="text" value={answers[index].answer} onChange={(e) => handleAnswerChange(index, e)} />
                            </Form.Group>
                        ))}

                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={props.onHide}>Close</Button>
                    <Button onClick={handleSubmit}>{applyLoading ? 'Applying...' : 'Apply'}</Button>
                </Modal.Footer>
            </Modal>
        );
    }



    const formatCreatedAt = (createdAt) => {
        const options = { hour: 'numeric', minute: 'numeric', hour12: true };
        const timeString = new Date(createdAt).toLocaleTimeString(undefined, options);
        const dateString = new Date(createdAt).toLocaleDateString();

        return `${dateString} ${timeString} `;
    };

    const handleStatusUpdate = (status, comment, userId) => {
        console.log('job id', status, comment, userId)
        setStatusLoading(status);

        axios.put(`${process.env.REACT_APP_API_URL}/jobs/${_id}/updateJobStatus`, { userId, status, comment })
            .then(response => {
                console.log("Job status updated successfully:", response.data.message);
                fetchAppliedUserIds();
                setStatusLoading(false);
            })
            .catch(error => {
                console.error("Error updating job status:", error.response.data.message);
            });
    };


    const RenderCandidateDetails = () => {
        const [comments, setComments] = useState({});
        const [showCommentBox, setShowCommentBox] = useState(false);
        const [status, setStatus] = useState('')
        if (appliedCandidatesDetails.length === 0) {
            return <p>No interested Candidates</p>;
        }


        const handleApprove = (status, userId) => {
            setComments(prevComments => ({
                ...prevComments,
                [userId]: { showCommentBox: true, comment: '' }
            }));
            setStatus(status);
        };

        const handleReject = (status, userId) => {
            setComments(prevComments => ({
                ...prevComments,
                [userId]: { showCommentBox: true, comment: '' }
            }));
            setStatus(status);
        };

        const handleClose = (userId) => {
            setComments(prevComments => ({
                ...prevComments,
                [userId]: { ...prevComments[userId], showCommentBox: false, comment: '' }
            }));
        };

        const handleSend = (userId) => {
            if (comments[userId].comment.trim() !== '') {
                setShowCommentBox(false);
                handleStatusUpdate(status, comments[userId].comment, userId);
                setComments(prevComments => ({
                    ...prevComments,
                    [userId]: { ...prevComments[userId], showCommentBox: false, comment: '' }
                }));
            }
        };

        return appliedCandidatesDetails.map((candidate, index) => (
            <div key={index}>
                <div style={{ display: 'flex', gap: '1vw' }}>
                    <p style={{ fontWeight: '500' }}>Name: </p><p>
                        <Link to={`/members/${candidate.userId}`} style={{ textDecoration: 'underline', color: 'inherit' }}>{candidate.name}</Link></p>
                </div>
                <div style={{ display: 'flex', gap: '1vw' }}>
                    <p style={{ fontWeight: '500' }}>Resume: </p><a href={`${process.env.REACT_APP_API_URL}/uploads/${candidate.resume}`} target="_blank" rel="noopener noreferrer">{candidate.resume}</a>
                </div>
                <div style={{ display: 'flex', gap: '1vw' }}>
                    <p style={{ fontWeight: '500' }}>Applied At: </p> <p>{formatCreatedAt(candidate.appliedAt)}</p>
                </div>
                {candidate.answers.map((answer, index) => (
                    <div key={index} style={{ display: 'flex', gap: '1vw' }}>
                        <p style={{ fontWeight: '500' }}>Question: </p>
                        <p>{answer.question}</p>
                        <div style={{ display: 'flex', gap: '1vw' }}>
                            <p style={{ fontWeight: '500' }}>Answer: </p>
                            <p>{answer.answer}</p>
                        </div>
                    </div>
                ))}

                {candidate.status ? (
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <p style={{ fontWeight: '600' }}>Status: </p>
                        <p>{candidate.status}</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', gap: '20px', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', gap: '20px' }}>
                            <button
                                onClick={() => handleApprove('Approved', candidate.userId)}
                                style={{
                                    border: 'none',
                                    padding: '5px 15px',
                                    backgroundColor: 'green',
                                    color: 'white',
                                    borderRadius: '6px'
                                }}
                            >
                                {statusLoading === 'Approved' ? (
                                    <l-line-spinner
                                        size="20"
                                        stroke="3"
                                        speed="1"
                                        color="black"
                                    ></l-line-spinner>
                                ) : (
                                    'Approve'
                                )}
                            </button>

                            <button
                                onClick={() => handleReject('Rejected', candidate.userId)}
                                style={{
                                    border: 'none',
                                    padding: '5px 15px',
                                    backgroundColor: 'red',
                                    color: 'white',
                                    borderRadius: '6px'
                                }}
                            >
                                {statusLoading === 'Rejected' ? (
                                    <l-line-spinner
                                        size="20"
                                        stroke="3"
                                        speed="1"
                                        color="black"
                                    ></l-line-spinner>
                                ) : (
                                    'Reject'
                                )}
                            </button>

                            <button
                                onClick={() => handleStatusUpdate('In Review', '', candidate.userId)}
                                style={{
                                    border: 'none',
                                    padding: '5px 15px',
                                    backgroundColor: '#c4c400',
                                    color: 'white',
                                    borderRadius: '6px'
                                }}
                            >
                                {statusLoading === 'In Review' ? (
                                    <l-line-spinner
                                        size="20"
                                        stroke="3"
                                        speed="1"
                                        color="black"
                                    ></l-line-spinner>
                                ) : (
                                    'In Review'
                                )}
                            </button>
                        </div>
                        <div>
                            {comments[candidate.userId]?.showCommentBox && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    <textarea
                                        value={comments[candidate.userId].comment}
                                        onChange={(e) => setComments(prevComments => ({
                                            ...prevComments,
                                            [candidate.userId]: { ...prevComments[candidate.userId], comment: e.target.value }
                                        }))}
                                        placeholder="Enter your message"
                                    />
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <button onClick={() => handleSend(candidate.userId)}>Send</button>
                                        <button onClick={() => handleClose(candidate.userId)}>Close</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
                <hr />
            </div>
        ));
    };

    const CandidatesModal = () => (
        <Modal
            show={candidateModalShow}
            onHide={() => setCandidateModalShow(false)}
            size="lg"
            aria-labelledby="contained-modal-title-vcenter"
            centered
        >
            <Modal.Header closeButton>
                <Modal.Title id="contained-modal-title-vcenter">
                    Interested Candidates
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <RenderCandidateDetails />
            </Modal.Body>
        </Modal>
    );

    const viewCandidatesButton = (
        <button onClick={() => setCandidateModalShow(true)}>View Interested Candidates (<span>{appliedCandidatesDetails.length}</span>)</button>
    );

    const renderImages = () => {
        return jobs.attachments.map((attachment, index) => {
            if (attachment.endsWith('.pdf')) {
                return null; // Skip rendering PDFs
            } else if (attachment.endsWith('.jpg') || attachment.endsWith('.jpeg') || attachment.endsWith('.png')) {
                return (
                    <div key={index} className="image-link">
                        <button style={{ border: 'none', borderBottom: 'solid 1px' }} onClick={() => handleImageClick(`${process.env.REACT_APP_API_URL}/uploads/${attachment}`)}>
                            {attachment}
                        </button>
                    </div>
                );
            } else {
                return null;
            }
        });
    };
    const handleImageClick = (image) => {
        setSelectedImage(image);
        setShowImagesModal(true);
    };

    const handleStarred = (jobId) => {
        setStarLoading(true);
        axios.put(`${process.env.REACT_APP_API_URL}/${title}/${jobId}`, {
            starred: true,
            userId: profile._id
        })
            .then(response => {
                console.log('Job starred successfully:', response.data);
                fetchDonationPost();
                setStarLoading(false);
            })
            .catch(error => {
                console.error('Error starring job:', error);
                // Handle error if needed
            });

    };

    const ImagesModal = () => (
        <Modal
            show={showImagesModal}
            onHide={() => setShowImagesModal(false)}
            size="lg"
            aria-labelledby="contained-modal-title-vcenter"
            centered
        >
            <Modal.Header closeButton>
                <Modal.Title id="contained-modal-title-vcenter">
                    View Image
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <img
                    src={selectedImage}
                    alt="Selected Image"
                    style={{ width: '100%', height: '100%' }}
                />
            </Modal.Body>
        </Modal>
    );
    let starButtonText
    if (jobs.starred) {
        starButtonText = jobs.starred.includes(profile._id) ? 'Starred' : 'Star';
    }
    else starButtonText = 'Star'

    const dummyContent = {
        responsibility: `Collaborate with cross-functional teams to achieve organizational goals.
Ensure timely completion of assigned tasks and deliverables.
Maintain clear and effective communication with internal and external stakeholders.
Contribute to process improvement initiatives and recommend best practices.
Maintain accurate records and documentation as required.
Support team operations through administrative or technical assistance.
Adhere to company policies, procedures, and standards.
Assist in problem-solving and offer creative solutions to challenges.
Participate in meetings, training sessions, and workshops.
Manage workload efficiently in a fast-paced environment.`,
        qualification: `Bachelor's degree in Computer Science or related field.
Proficiency in programming languages such as Java, Python, or C++.
Experience with data structures and algorithms.
Strong problem-solving and analytical skills.
Good communication and interpersonal skills.
Ability to work independently and as part of a team.
Experience with version control systems such as Git.`
    }

    if (loader) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-[90px] w-[90px] border-b-2 border-gray-900"></div>

            </div>
        )
    }

    return (
        <div className="mx-5 ">
            <div className="border border-gray-600 mt-4 shadow-md rounded-lg mb-5 ">
                <img
                    src={jobs.coverImage || coverImage}
                    alt="Job Cover"
                    className="w-full h-[350px] object-cover rounded-lg "
                />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3">
                <div className="md:col-span-2">
                    <h1 className="job-title">{jobs.title || "Job Title"}</h1>
                    <p className="company-name">{jobs.company || "Company Name"}</p>
                    <div className="job-description">
                        <h2>Job Description</h2>
                        <p>{jobs.description}</p>
                    </div>
                    <div className="">
                        <h2 className="text-xl mb-1  font-bold ">Responsibilities</h2>
                        <p>
                            {(jobs.responsibility || dummyContent.responsibility).split('\n').map((line, index) => (
                                <span key={index}>
                                    {line}
                                    <br />
                                </span>
                            ))}
                        </p>
                    </div>
                    <div className="mb-7">
                        <h2 className="text-xl mb-1  font-bold ">Qualifications</h2>
                        <p>
                            {(jobs.qualification || dummyContent.qualification).split('\n').map((line, index) => (
                                <span key={index}>
                                    {line}
                                    <br />
                                </span>
                            ))}
                        </p>
                    </div>
                   
                </div>
                <div className=" md:col-span-1 p-4">
                    <div className="bg-gray-100 rounded-xl w-full shadow-md p-6">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Job Overview</h2>

                        <ul className="space-y-4">
                            <li className="flex items-start space-x-4">
                                <FaCalendarAlt className="text-blue-500 text-xl mt-1" />
                                <div>
                                    <span className="block text-gray-600 font-medium">Date Posted</span>
                                    <span className="text-gray-800">{moment(jobs.createdAt).format('Do MMMM YYYY') || "N/A"}</span>
                                </div>
                            </li>

                            <li className="flex items-start space-x-4">
                                <FaCalendarAlt className="text-green-500 text-xl mt-1" />
                                <div>
                                    <span className="block text-gray-600 font-medium">Apply By</span>
                                    <span className="text-gray-800">{moment(jobs.applyBy).format('Do MMMM YYYY')|| "N/A"}</span>
                                </div>
                            </li>

                            <li className="flex items-start space-x-4">
                                <FaMapMarkerAlt className="text-red-500 text-xl mt-1" />
                                <div>
                                    <span className="block text-gray-600 font-medium">Location</span>
                                    <span className="text-gray-800">{jobs.location || "N/A"}</span>
                                </div>
                            </li>

                           

                            <li className="flex items-start space-x-4">
                                <GiMoneyStack className="text-yellow-500 text-xl mt-1" />
                                <div>
                                    <span className="block text-gray-600 font-medium">Salary</span>
                                    <span className="text-gray-800">{jobs.salaryMin} - {jobs.salaryMax}</span>
                                </div>
                            </li>
                        </ul>

                        <div className="mt-6 flex flex-wrap gap-4">
                            {jobs.userId === profile._id ? (
                                <>
                                    {viewCandidatesButton}
                                </>
                            ) : isApplied ? (
                                <>
                                    <button className="bg-blue-200 text-blue-800 px-5 py-2 rounded font-medium" disabled>
                                        Applied
                                    </button>
                                </>
                            ) : profile.profileLevel === 0 || profile.profileLevel === 1 ? (
                                <></>
                            ) : (
                                <>
                                    <button
                                        onClick={() => setModalShow(true)}
                                        className="bg-blue-900 hover:bg-blue-800 text-white px-5 py-2 rounded transition duration-200"
                                    >
                                        Apply
                                    </button>
                                    <button
                                        onClick={() => handleStarred(jobs._id)}
                                        className="bg-red-700 hover:bg-red-600 text-white px-5 py-2 rounded transition duration-200"
                                    >
                                        {starLoading ? 'Loading...' : starButtonText}
                                    </button>

                                    <MyVerticallyCenteredModal show={modalShow} onHide={() => setModalShow(false)} />
                                </>
                            )}
                        </div>

                        <CandidatesModal />
                    </div>

                    <div className="mb-10 w-full">
                        <h2 className="text-xl mb-1  font-bold ">Attachments</h2>
                        {(jobs.attachments || []).map(attachment => (
                            <a key={attachment} href={attachment} target="_blank" rel="noopener noreferrer" className="block text-blue-500 hover:text-blue-700 underline">
                                {attachment}
                            </a>
                        ))}
                    </div>
                </div>

            </div>
            {/* <ApplyModal show={modalShow} onHide={() => setModalShow(false)} /> */}
        </div >
    )


}

export default IndividualJobPost;