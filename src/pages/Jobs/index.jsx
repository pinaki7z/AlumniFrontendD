import React, { useState, useEffect } from 'react';
import { Link, NavLink, Route, Routes } from 'react-router-dom';
import axios from 'axios';
import { useSelector } from 'react-redux';
import IntJobs from "../../components/IntJobs";
import PageSubTitle from "../../components/PageSubTitle";
import JobPost from "../../components/JobPost";
import { Archive } from "./Archive";
import { StarredJobs } from "../../components/StarredJobs";
import { AppliedJobs } from "../../components/AppliedJobs";
import baseUrl from "../../config";

const Jobs = () => {
    const [title] = useState('Jobs');
    const titleS = 'job';
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('All');
    const profile = useSelector((state) => state.profile);

    const getData = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/internships`);
            setJobs(response.data);
            setLoading(false);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        getData();
    }, []);

    // Filter jobs by type
    const filteredJobs = jobs.filter(
        (job) => typeFilter === 'All' || job.type === typeFilter
    );

    // now just your own jobs
    const myJobs = filteredJobs.filter(job => job.userId === profile._id);

    return (
        <div className="flex flex-col w-full py-[2%] px-[5%]">


            {/* Intro section */}
            <div className='bg-[#cef3df] p-4 rounded-lg mb-3'>
                <h2 className='text-[#136175] mb-2 text-3xl md:text-4xl font-bold'>Jobs</h2>
                <p className='text-base md:text-lg text-[#136175]' >
                    Discover, explore, and submit applications for job openings on the Alumni Portal.
                </p>
            </div>

            {/* Tabs for navigation */}
            <div className="flex space-x-6 justify-center border-b font-semibold text-xl mt-6 pb-4 mb-6">
                <NavLink
                    to="/home/jobs"
                    end
                    className={({ isActive }) =>
                        isActive
                            ? 'text-blue-600 border-b-2 border-blue-600 pb-1'
                            : 'text-gray-600 pb-1'
                    }
                >
                    All Jobs
                </NavLink>

                {profile.profileLevel === 2 && <NavLink
                    to="/home/jobs/myJobs"
                    className={({ isActive }) =>
                        isActive
                            ? 'text-blue-600 border-b-2 border-blue-600 pb-1'
                            : 'text-gray-600 pb-1'
                    }
                >
                    My Jobs
                </NavLink>
                }
                {/* only for students */}
                {[2, 3].includes(profile.profileLevel) && <>
                    <NavLink
                        to="/home/jobs/starred"
                        className={({ isActive }) =>
                            isActive
                                ? 'text-blue-600 border-b-2 border-blue-600 pb-1'
                                : 'text-gray-600 pb-1'
                        }
                    >
                        Starred
                    </NavLink>

                    <NavLink
                        to="/home/jobs/applied"
                        className={({ isActive }) =>
                            isActive
                                ? 'text-blue-600 border-b-2 border-blue-600 pb-1'
                                : 'text-gray-600 pb-1'
                        }
                    >
                        Applied
                    </NavLink>
                </>}
            </div>

            <div className='flex justify-between'>
                {/* Filter dropdown */}
                <div className="flex items-center mb-6">
                    <label htmlFor="typeFilter" className="mr-4 font-medium text-gray-700">
                        Filter by Type:
                    </label>
                    <select
                        id="typeFilter"
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="border border-gray-300 rounded px-3 py-2"
                    >
                        <option>All</option>
                        <option>Job</option>
                        <option>Internship</option>
                        <option>Part time</option>
                        <option>Full time</option>
                    </select>
                </div>
            {[0,1,2].includes(profile.profileLevel) &&     <div>
                    <button className='bg-[#136175] text-white py-2 px-4 rounded'>
                        <Link to="/home/jobs/create">Create Job</Link>
                    </button>
                </div>}
            </div>
            {/* Route-based content */}
            <Routes>
                <Route
                    path="/"
                    element={
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {loading ? (
                                <div>Loading.....</div>
                            ) : filteredJobs.length ? (
                                filteredJobs.map((job) => (
                                    <div key={job._id} className="job-post">
                                        <JobPost
                                            userId={job.userId}
                                            job={job}
                                            id={job._id}
                                            jobTitle={job.title}
                                            employmentType={job.employmentType}
                                            description={job.description}
                                            salaryMin={job.salaryMin}
                                            salaryMax={job.salaryMax}
                                            picture={job.picture}
                                            duration={job.duration}
                                            jobType={job.jobType || job.internshipType}
                                            questions={job.questions}
                                            category={job.category}
                                            currency={job.currency}
                                            createdAt={job.createdAt}
                                            attachments={job.attachments}
                                            title={title}
                                            titleS={titleS}
                                            type={job.type}
                                            searchQuery={searchQuery}
                                            locationType={job.locationType}
                                            company={job.company}
                                            verified={job.verified}
                                        />
                                    </div>
                                ))
                            ) : (
                                <div>No jobs posted</div>
                            )}
                        </div>
                    }
                />
                <Route
                    path="/archive"
                    element={
                        <div className="flex flex-wrap gap-4">
                            {loading ? (
                                <div>Loading.....</div>
                            ) : filteredJobs.length ? (
                                filteredJobs.map((job) => (
                                    <Archive
                                        key={job._id}
                                        userId={job.userId}
                                        id={job._id}
                                        jobTitle={job.title}
                                        employmentType={job.employmentType}
                                        description={job.description}
                                        salaryMin={job.salaryMin}
                                        salaryMax={job.salaryMax}
                                        picture={job.picture}
                                        duration={job.duration}
                                        jobType={job.employmentType}
                                        questions={job.questions}
                                        category={job.category}
                                        currency={job.currency}
                                        createdAt={job.createdAt}
                                        attachments={job.attachments}
                                        type={job.type}
                                        title={title}
                                        titleS={titleS}
                                        searchQuery={searchQuery}
                                        locationType={job.locationType}
                                        company={job.company}
                                    />
                                ))
                            ) : (
                                <div>No archived jobs</div>
                            )}
                        </div>
                    }
                />
                <Route
                    path="/starred"
                    element={
                        <div className="flex flex-wrap gap-4">
                            <StarredJobs searchQuery={searchQuery} />
                        </div>
                    }
                />
                <Route
                    path="/myJobs"
                    element={
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {loading ? (
                                <div>Loading…</div>
                            ) : myJobs.length ? (
                                myJobs.map(job => (
                                    <JobPost
                                        key={job._id}
                                        userId={job.userId}
                                        job={job}
                                        id={job._id}
                                        jobTitle={job.title}
                                        employmentType={job.employmentType}
                                        description={job.description}
                                        salaryMin={job.salaryMin}
                                        salaryMax={job.salaryMax}
                                        picture={job.picture}
                                        duration={job.duration}
                                        jobType={job.jobType || job.internshipType}
                                        questions={job.questions}
                                        category={job.category}
                                        currency={job.currency}
                                        createdAt={job.createdAt}
                                        attachments={job.attachments}
                                        title={title}
                                        titleS={titleS}
                                        type={job.type}
                                        searchQuery={searchQuery}
                                        locationType={job.locationType}
                                        company={job.company}
                                    />
                                ))
                            ) : (
                                <div>No jobs posted</div>
                            )}
                        </div>
                    }
                />
                <Route
                    path="/applied"
                    element={
                        <div className="flex flex-wrap gap-4">
                            <AppliedJobs searchQuery={searchQuery} />
                        </div>
                    }
                />
            </Routes>
        </div>
    );
};

export default Jobs;
