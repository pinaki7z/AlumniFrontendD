import Feed from '../../components/Feeed';
import { useSelector } from 'react-redux';
import { useNavigate } from "react-router-dom";


const News = () => {
  const profile = useSelector((state) => state.profile);
  let admin;
  if (profile.profileLevel === 0 || profile.profileLevel === 1) {
    admin = true;
  }

  const navigate = useNavigate();



  return (
    <div>
      


      <div className='w-full'>
            <div className="bg-[#cef3df] p-4 rounded-lg ">
            
            <h2 className='text-[#136175] mb-2 text-3xl md:text-4xl font-bold'>News</h2>
            <p className='text-base md:text-lg text-[#136175]'> Welcome to our dynamic Alumni Portal News Page, your source for the latest updates, inspiring stories, and exclusive opportunities tailored for our esteemed alumni community.</p>
            </div>
            
        </div>
      {/* {admin ?
        <Feed showCreatePost={true} showCreateButton={false} entityType="news" entityId="id" showDeleteButton={true} />
        :
        <Feed showCreatePost={false} entityType="news" entityId="id" showDeleteButton={true} />
      } */}
       {admin && (
        <button onClick={() => navigate("/home/news/createNews")}>Create News</button>
      )}
      {admin ?
        <Feed showCreatePost={false} showCreateButton={false} entityType="news" entityId="id" showDeleteButton={true} />
        :
        <Feed showCreatePost={false} entityType="news" entityId="id" showDeleteButton={true} />
      } 
    </div>
  )
}

export default News;