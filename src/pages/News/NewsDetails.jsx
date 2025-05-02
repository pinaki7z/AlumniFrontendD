import React from 'react';
import { useLocation } from 'react-router-dom';
import Slider from 'react-slick';

const NewsDetails = () => {
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

    const dummyImage = "https://via.placeholder.com/800x400.png?text=No+Image+Available";
    const dummyDescription = "No description provided. This is a placeholder description for the news content.";

    return (
        <div className=" mx-3 md:mx-8 bg-white shadow-md  rounded-lg overflow-hidden my-4 py-3 md:my-8  md:p-6">
            <div className="border-b pb-4 mb-4 px-3">
                <h1 className="text-2xl md:text-4xl font-bold text-gray-800">{title || 'News Headline'}</h1>
                <p className="text-gray-600 text-sm md:text-base">Posted on {createdAt}</p>
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
      <div className="prose prose-lg max-w-full px-3">
        {/*
          - Use Tailwind Typography plugin for `.prose` styles.
          - Ensures images (`<img>`), headings, lists, etc., render as in CKEditor.
        */}
        <div dangerouslySetInnerHTML={{ __html: description }} />
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