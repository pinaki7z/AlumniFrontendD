import DisplayPost from "../../DisplayPost";
import { useState,useEffect } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import axios from "axios";
import baseUrl from "../../../config";
const JoinedGroups = ({ groupType, searchQuery }) => {
  const title = 'JoinedGroups';
  const { id } = useParams();
  const [groups, setGroups] = useState([]);
  const [totalGroups, setTotalGroups] = useState(0);
  const [loading, setLoading] = useState(false)
  const LIMIT = 40;
  const profile = useSelector((state) => state.profile);
  let [page, setPage] = useState(1);
  let [previousPage, setPreviousPage] = useState(0);
  const getGroups = async () => {
    setLoading(true)
    console.log('page', page);
    console.log('previous page', previousPage)
    if (page === previousPage) {
      return;
    }
    try {
      // const api =   `${process.env.REACT_APP_API_URL}/groups/joined?page=${page}&size=${LIMIT}&userId=${id}`
      const api =   `${process.env.REACT_APP_API_URL}/groupMember/joined/${id}?page=${page}&size=${LIMIT}`
      
      const response = await axios.get(api);
      const postsData = response.data.records;
      setGroups((prevItems) => [...prevItems, ...postsData]);
      setTotalGroups(response.data.total);
      setPreviousPage(page);
      setLoading(false)
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
    console.log('Update Groups');
    setPage(page + 1);
  }
  return (
    <div style={{ paddingBottom: '3vh' }}>

      <DisplayPost title={title} groups={filteredGroups} loading={loading} joined={true}/>
      {page < totalGroups / LIMIT && (
        <div style={{ textAlign: 'center', marginTop: '3vh' }}>
          <button className="load-more-button" onClick={handleLoadMore}>
            Load More
          </button>
        </div>
      )}
    </div>
  )
}
export default JoinedGroups;