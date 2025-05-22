import moment from 'moment';
import React from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import Slider from 'react-slick';
import axios from 'axios';
const NewsDetails = () => {
  const profile = useSelector((state) => state.profile);
  const navigate = useNavigate()
    const location = useLocation();
    const { userId, postId, description, title, createdAt, picturePath, videoPath, department, onDeletePost,author,picture } = location.state || {};

    const PrevButton = ({ onClick }) => {
        return <button className="slick-arrow slick-prev" style={{ background: 'black' }} onClick={onClick}>Previous</button>;
      };
    
      const NextButton = ({ onClick }) => {
        return <button className="slick-arrow slick-next" style={{ background: 'black' }} onClick={onClick}>Next</button>;
      };
      const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 2000,
        prevArrow: <PrevButton />,
        nextArrow: <NextButton />
      };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const dateParts = dateString.split(" ");
        const day = parseInt(dateParts[1], 10);
        const month = dateParts[2].substring(0, 3);
        const year = dateParts[3];

        const daySuffix = (day) => {
            if (day > 3 && day < 21) return 'th';
            switch (day % 10) {
                case 1: return 'st';
                case 2: return 'nd';
                case 3: return 'rd';
                default: return 'th';
            }
        };
        return `${day}${daySuffix(day)} ${month} ${year}`;
    };

    const handleDelete = async () => {
        const confirmDelete = window.confirm("Are you sure you want to delete this post?");
        if (confirmDelete) {
            try {
                const res = await axios.delete(`${process.env.REACT_APP_API_URL}/news/${postId}`);
                navigate('/home/news')
            } catch (error) {
                console.error('Error deleting post:', error);
            }
        }
    };

    const dummyImage = "https://via.placeholder.com/800x400.png?text=No+Image+Available";
    const dummyDescription = "No description provided. This is a placeholder description for the news content.";

    return (
        <div className=" mx-3 md:mx-8 bg-white shadow-md  rounded-lg overflow-hidden my-4 py-3 md:my-8  md:p-6">
          <div className='flex justify-end mb-4 gap-4'>
            {
             ( userId === profile._id || profile.profileLevel === 0)&&
              <>
          <button onClick={()=>navigate(`/home/news/${postId}/edit`)} className=" bg-[#0A3A4C] hover:bg-blue-900 font-semibold text-lg text-white py-2 px-4 rounded">Edit</button>
          <button onClick={()=>handleDelete()} className=" bg-red-700 hover:bg-red-900 font-semibold text-lg text-white py-2 px-4 rounded">Delete</button>
              </>
}
          </div>
            <div className="border-b pb-4 mb-4 px-3">
                <h1 className="text-2xl mb-4 md:text-4xl font-bold text-gray-800">{title || 'News Headline'}</h1>
                <p className="text-gray-600 text-sm md:text-base">Posted on {moment(createdAt).format('MMMM D, YYYY')}</p>
                <p className="text-gray-600 text-sm md:text-lg font-semibold">By {author}</p>
            </div>

            <div className="w-full flex justify-center px-3">
            {/* {picturePath && picturePath.length > 1 ? (
              <Slider {...settings}>
                {picturePath.map((img, index) => (
                  img ? (
                    <div key={index} className='image'>
                      <img src={img} alt={`Post Image ${index + 1}`} />
                    </div>
                  ) : null
                ))}
              </Slider>
            ) : picturePath && picturePath.length === 1 && picturePath[0] ? (
              <div>
                <img src={picturePath[0]} alt={`image`}  />
              </div>
            ) : null} */}
                {/* {videoPath ? (
                    <>
                        {videoPath && (
                            <video controls className="w-full max-h-[400px] mt-4 rounded-md">
                                <source src={videoPath} type="video/mp4" />
                                Your browser does not support the video tag.
                            </video>
                        )}
                    </>
                ) : null} */}
            </div>

           {/* Rich Content */}
      <div className="news-content mx-3 md:mx-8 bg-white …">
  {/* … */}
  <div className="px-3 news-content" dangerouslySetInnerHTML={{ __html: description }} />
</div>
            {/* {picture && (
                  <img
                    src={picture}
                    alt="Forum Image"
                    style={{ width: '300px', height: '300px', objectFit: 'cover', borderRadius: '10px', paddingBottom: '10px' }}
                  />
                )} */}
        </div>
    );
};

export default NewsDetails;