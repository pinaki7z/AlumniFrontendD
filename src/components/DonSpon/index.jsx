import './donSpon.css'

const DonSpon = ({title,icon}) => {
    // console.log('title' , title)
    return(
        <div className='w-full'>
            <div className="bg-[#cef3df] p-4 rounded-lg ">
            
            <h2 className='text-[#136175] mb-2 text-3xl md:text-4xl font-bold'>{title}</h2>
            <p className='text-base md:text-lg text-[#136175]'>Discover opportunities, network with fellow alumni entrepreneurs, and explore collaboration possibilities in our dynamic Business Connect hub within the alumni portal.</p>
            </div>
            
        </div>
    )
}

export default DonSpon;