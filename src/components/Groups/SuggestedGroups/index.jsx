import DisplayPost from "../../DisplayPost";
import { useSelector } from "react-redux";
import { useState,useEffect } from "react";
import axios from "axios";
import baseUrl from "../../../config";
const SuggestedGroups = ({ groupType, searchQuery }) => {
    const title = 'SuggestedGroups';
    const [groups, setGroups] = useState([]);
    const [totalGroups, setTotalGroups] = useState(0);
    const [loading, setLoading] = useState(false)
    const LIMIT = 40;
    const profile = useSelector((state) => state.profile);
    let [page, setPage] = useState(1);
    let [previousPage, setPreviousPage] = useState(0);
    const getGroups = async () => {
        setLoading(true);
        console.log('SuggestedGroups');
        console.log('page', page);
        console.log('previous page', previousPage);
        if (page === previousPage) {
            return;
        }
        try {
            const response = await axios.get(
                `${process.env.REACT_APP_API_URL}/groups?page=${page}&size=${LIMIT}&userId=${profile._id}`
            );
            const postsData = response.data.records.filter(group => !group.businessConnect);
            setGroups((prevItems) => [...prevItems, ...postsData]);
            setTotalGroups(response.data.total);
            setPreviousPage(page);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching posts:", error);
        }
    };
    

    useEffect(() => {
        getGroups();
      }, [page]);

      const filteredGroups = groups.filter((group) => {
        return (
          (!groupType || group.groupType === groupType) &&
          (!searchQuery || group.groupName.toLowerCase().includes(searchQuery.toLowerCase()))
        );
      })
      const handleLoadMore = () => {
        console.log('Update Donations');
        setPage(page + 1);
      }
      console.log('groups suggested ', groups);
      return (
        <div style={{ paddingBottom: '3vh' }}>
    
          <DisplayPost title={title} groups={filteredGroups} loading={loading}/>
          {console.log('page,totalgroups,LIMIT', page, totalGroups,LIMIT)}
          {page <= totalGroups / LIMIT && (
                <div style={{textAlign: 'center', marginTop: '3vh'}}>
                <button className="load-more-button" onClick={handleLoadMore}>
                    Load More
                </button>
                </div>
            )}
        </div>
      )
}
export default SuggestedGroups;