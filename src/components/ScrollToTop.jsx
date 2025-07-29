import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = ({ targetId = null }) => {
  const { pathname } = useLocation();

  useEffect(() => {
    const scrollElement = targetId
      ? document.getElementById(targetId)
      : window;

    if (scrollElement) {
      if (scrollElement === window) {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        scrollElement.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  }, [pathname]);

  return null;
};

export default ScrollToTop;
