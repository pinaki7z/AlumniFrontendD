import './pageSubTitle.css';
import { FaPlus } from 'react-icons/fa';
import { Link, useLocation } from 'react-router-dom';

const PageSubTitle = ({ buttontext1, buttontext2, buttontext3,buttontext4,buttontext5, buttontext1Link, buttontext2Link, buttontext3Link,buttontext4Link, buttontext5Link, name, create }) => {
  const location = useLocation();
  // console.log('button2',buttontext2Link);
  // console.log('button1',buttontext1Link);

  const oldDesign =()=>{
    return (
      <div>
      <div className='mt-3'>
        <ul style={{ display: 'flex', width: '100%', fontSize: '15px', paddingLeft: '0rem', marginBottom: '0rem', alignItems: 'center', paddingRight: '15px',justifyContent: 'space-between' }}>
          <li style={{ listStyleType: 'none', padding: '10px',width: '30%', textAlign: 'center' }} className={location.pathname === buttontext1Link ? 'active-link1' : ''}><Link to={buttontext1Link} style={{ textDecoration: 'none', color: 'black',fontSize: '20px', fontFamily: 'Inter', fontWeight: '600' }}>{buttontext1}</Link></li>
          <li style={{ listStyleType: 'none', padding: '10px',width: '30%', textAlign: 'center' }} className={location.pathname === buttontext2Link ? 'active-link2' : ''}><Link to={buttontext2Link} style={{ textDecoration: 'none', color: 'black',fontSize: '20px', fontFamily: 'Inter', fontWeight: '600' }}>{buttontext2}</Link></li>
          <li className={location.pathname === buttontext3Link ? 'active-link3' : ''} style={{ listStyleType: 'none', padding: '10px',marginLeft: '0px',width: '30%', textAlign: 'center' }}><Link to={buttontext3Link} style={{ textDecoration: 'none', color: 'black',fontSize: '20px', fontFamily: 'Inter', fontWeight: '600' }}>{buttontext3}</Link></li>
          {/* <li style={{ listStyleType: 'none', padding: '10px',marginLeft: '0px' }}><Link to={buttontext4Link} className={location.pathname === buttontext4Link ? 'active-link3' : ''} style={{ textDecoration: 'none', color: 'black' }}>{buttontext4}</Link></li>
          <li style={{ listStyleType: 'none', padding: '10px',marginLeft: '0px' }}><Link to={buttontext5Link} className={location.pathname === buttontext5Link ? 'active-link3' : ''} style={{ textDecoration: 'none', color: 'black' }}>{buttontext5}</Link></li> */}
          {/* {create && <li style={{ listStyleType: 'none' }}><Link to={`/${name}/create`} style={{ textDecoration: 'none', color: 'black' }}><button><FaPlus />Create</button></Link></li>} */}
        </ul>
      </div>
    </div>
    )
  }

  return (
    <div className="mt-5   mb-3">
      <ul className="flex flex-wrap w-full text-sm md:text-lg font-semibold items-center sm:gap-2 md:gap-3  md:px-4">
        {[{ text: buttontext1, link: buttontext1Link }, { text: buttontext2, link: buttontext2Link }, { text: buttontext3, link: buttontext3Link }].map((tab, index) => (
          <li key={index} className=" text-center">
            <Link
              to={tab.link}
              className={`block py-2 px-3 md:py-3 md:px-4 rounded-lg transition-all duration-300 ${
                location.pathname === tab.link 
                  ? 'bg-[#0A3A4C] text-white shadow-md'  // Active tab styling
                  : 'text-gray-700 hover:text-[#0A3A4C] hover:bg-gray-200'
              }`}
            >
              {tab.text}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default PageSubTitle;


