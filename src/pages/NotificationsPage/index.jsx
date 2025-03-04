import PageTitle from "../../components/PageTitle";
import PageSubTitle from "../../components/PageSubTitle";
import { Route, Routes, useLocation } from "react-router-dom";
import { IoIosNotifications } from "react-icons/io";
import {NotificationsP} from "../../components/NotificationsP";
import { NotificationsDeclined } from "../../components/NotificationsDeclined";
import { useSelector } from "react-redux";
import { useState } from "react";

const NotificationsPage=()=>{
    const title = "Notifications";
    const icon = <IoIosNotifications style={{ color: '#174873' }} />;
    const location = useLocation(); // Get the current location
    const [notificationCount, setNotificationCount] = useState(0);

    // Determine if the current tab is active
    const isAllNotificationsActive = location.pathname === '/notifications';
    const updateNotificationCount = (count) => {
      setNotificationCount(count); // Update the count from the child component
    };

    const buttontext1 = (<>
    All Notifications <span  className="notification-count" style={{backgroundColor: isAllNotificationsActive ? 'black' : 'gray',
    color: 'white',
    borderRadius: '20%',
    padding: '1px 6px',
    fontSize: '12px',
    marginLeft: '5px',
    display: 'inline-block',}}>{notificationCount}</span>
    </>);
    let buttontext2 = '';
    const buttontext1Link = "/home/notifications";
    const buttontext2Link = "/home/notifications/declined";
    const profile = useSelector((state)=> state.profile);
    if (profile.profileLevel === 0 || profile.profileLevel === 1) {
      buttontext2 = 'Declined';
    }
    return(
        <>
        <div style={{ width: '100%', padding: '2% 5%'}}>
      <Routes>
        <Route path="/" element={<div >
        <PageTitle title={title}  />
        </div>} />
        <Route path="/declined" element={<div><PageTitle title={title}/> </div>} />
      </Routes>
      <Routes>
          <Route path="/" element={<PageSubTitle buttontext1={buttontext1} buttontext2={buttontext2} buttontext1Link={buttontext1Link} buttontext2Link={buttontext2Link} name='notifications' create={false}/>} />
          <Route path="/declined" element={<PageSubTitle buttontext1={buttontext1} buttontext2={buttontext2} buttontext1Link={buttontext1Link} buttontext2Link={buttontext2Link} name='notifications' create={false}/>} />
       
      </Routes>
      <Routes>
       
          <Route path="/" element={<NotificationsP sendNotificationCount={updateNotificationCount} />}/>
          {/* <Route path="/declined" element={<NotificationsDeclined />}/> */}
          {(profile.profileLevel === 0 || profile.profileLevel === 1) && (
            <Route path="/declined" element={<NotificationsDeclined />}/>
          )}
          {!(profile.profileLevel === 0 || profile.profileLevel === 1) && (
            <Route path="/declined" element={<div>Wrong Route. Please Go Back</div>} />
          )}
      </Routes>
      </div>
      </>

    )
}


export default NotificationsPage;