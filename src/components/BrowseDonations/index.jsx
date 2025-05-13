import './browseDonations.css';
import DisplayDonSpon from '../DisplayDonSpon';

const BrowseDonations = ({donSpon,name,updateDonations,totalDonations,page,limit,loading,isLoading,getPosts}) => {
    console.log("browse Donation ", donSpon);
    return(
        <div className='w-full'>
           <DisplayDonSpon donations={donSpon} name={name} updateDonations={updateDonations} totalDonations={totalDonations} page={page} limit={limit} loading={loading} isLoading={isLoading} />
        </div>
    )
}
export default BrowseDonations;