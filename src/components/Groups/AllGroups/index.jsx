import DisplayPost from "../../DisplayPost";
import { useSelector } from "react-redux";
import { useState, useEffect } from "react";
import axios from "axios";
import baseUrl from "../../../config";
import { Loader2, Plus } from "lucide-react";

const AllGroups = ({ groupType, searchQuery }) => {
  const [groups, setGroups] = useState([]);
  const [totalGroups, setTotalGroups] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const LIMIT = 40;
  const profile = useSelector((state) => state.profile);
  const [page, setPage] = useState(1);
  const [previousPage, setPreviousPage] = useState(0);

  const getGroups = async (isLoadMore = false) => {
    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    
    if (page === previousPage) {
      return;
    }
    
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/groups?page=${page}&size=${LIMIT}`,
        { userId: profile._id }
      );
      const postsData = response.data.records;

      if (isLoadMore) {
        setGroups((prevItems) => [...prevItems, ...postsData]);
      } else {
        setGroups(postsData);
      }
      
      setTotalGroups(response.data.total);
      setPreviousPage(page);
    } catch (error) {
      console.error("Error fetching groups:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    getGroups();
  }, [page]);

  // Reset groups when filters change
  useEffect(() => {
    if (page > 1) {
      setPage(1);
      setPreviousPage(0);
    }
  }, [groupType, searchQuery]);

  const filteredGroups = groups.filter((group) => {
    return (
      (!groupType || group.groupType === groupType) &&
      (!searchQuery || group.groupName.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  const handleLoadMore = () => {
    setPage(page + 1);
  };

  const hasMore = page < Math.ceil(totalGroups / LIMIT);

  return (
    <div className="space-y-4">
      <DisplayPost 
        groups={filteredGroups} 
        loading={loading} 
        groupType={groupType}
        searchQuery={searchQuery}
      />
      
      {hasMore && !loading && (
        <div className="flex justify-center pt-4">
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 dynamic-site-bg text-white rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[#0A3A4C] focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium shadow-sm w-full sm:w-auto"
          >
            {loadingMore ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Plus size={16} />
            )}
            <span>{loadingMore ? 'Loading...' : 'Load More Groups'}</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default AllGroups;
