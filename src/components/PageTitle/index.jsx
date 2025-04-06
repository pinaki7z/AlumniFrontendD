import './pageTitle.css'
const PageTitle = ({ title,icon }) => {
    return (
        <div className='bg-[#cef3df] p-4 rounded-lg mb-3'>
          <h2 className='text-[#136175] mb-2 text-3xl md:text-4xl font-bold'>Notifications</h2>
          <p className='text-base md:text-lg text-[#136175]' >
          Check your latest alerts and stay informed on community updates.
          </p>
        </div>
    )
}

export default PageTitle;