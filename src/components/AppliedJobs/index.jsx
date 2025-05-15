import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import JobPost from '../JobPost';
import baseUrl from '../../config';

export const AppliedJobs = ({searchQuery}) => {
    const profile = useSelector((state) => state.profile);
    const [appliedJobs, setAppliedJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    

    useEffect(() => {
        const fetchAppliedJobs = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/jobs/${profile._id}/appliedJobs`);
                setAppliedJobs(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching applied jobs:', error);
                setLoading(false);
            }
        };

        fetchAppliedJobs();
    }, [profile._id]);
   

    const filteredJobs = appliedJobs.filter(job => {
        const { title, employmentType, category } = searchQuery;
        const lowerCaseJobTitle = title ? title.toLowerCase() : '';
        const lowerCaseJobType = employmentType ? employmentType.toLowerCase() : '';
        const lowerCaseCategory = category ? category.toLowerCase() : '';

        
        if (employmentType && category) {
            return job.title.toLowerCase().includes(lowerCaseJobTitle) &&
                job.employmentType.toLowerCase() === lowerCaseJobType &&
                job.category.toLowerCase() === lowerCaseCategory;
        }
       
        else if (employmentType) {
            return job.title.toLowerCase().includes(lowerCaseJobTitle) &&
                job.employmentType.toLowerCase() === lowerCaseJobType;
        }
        
        else if (category) {
            return job.title.toLowerCase().includes(lowerCaseJobTitle) &&
                job.category.toLowerCase() === lowerCaseCategory;
        }
        
        return job.title.toLowerCase().includes(lowerCaseJobTitle);
    });

    return (
        <div className="job-poztt" style={{width: '100%'}}>
            <div style={{ display: 'flex', flexDirection: 'row', gap: '5vw', flexWrap: 'wrap', paddingTop: '20px' }}>
                {loading ? (
                    <div>Loading...</div>
                ) : filteredJobs.length === 0 ? (
                    <div>No applied jobs found.</div>
                ) : (<div className="grid grid-cols-1 md:grid-cols-4 gap-4">

                    {filteredJobs.map((job) => (
                        <div key={job._id} className="job-post" >
                            <JobPost
                                userId={job.userId}
                                id={job._id}
                                job={job}
                                jobTitle={job.title}
                                employmentType={job.employmentType}
                                description={job.description}
                                salaryMin={job.salaryMin}
                                salaryMax={job.salaryMax}
                                picture={job.picture}
                                duration={job.duration}
                                jobType={job.jobType ? job.jobType : job.internshipType}
                                questions={job.questions}
                                category={job.category}
                                currency={job.currency}
                                createdAt={job.createdAt}
                                attachments={job.attachments}
                                type={job.type}
                                title='Jobs'
                                titleS='job'
                                appliedCandidates={job.appliedCandidates}
                            />
                        </div>
                    ))}
                </div>
                )}
            </div>
        </div>
    );
};
