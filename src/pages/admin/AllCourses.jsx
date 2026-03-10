import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify"; // Import Toast
import "react-toastify/dist/ReactToastify.css"; // Import Toast Styles
import "./AllCourses.css";

function AllCourses() {
  const [courses, setCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [hasNewNotification, setHasNewNotification] = useState(false);
  
  const lastCourseCount = useRef(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCourses(true);

    const interval = setInterval(() => {
      fetchCourses(false);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchCourses = async (isFirstLoad) => {
    try {
      const response = await axios.get("http://localhost:8080/api/admin/courses/details");
      const newCourses = response.data;

      if (!isFirstLoad && newCourses.length > lastCourseCount.current) {
        setHasNewNotification(true);
        // Professional Toast implementation
        toast.info("📚 New courses have been added!", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "colored",
        });
      }

      setCourses(newCourses);
      lastCourseCount.current = newCourses.length;
    } catch (error) {
      console.error("Error fetching courses", error);
    }
  };

  const handleNotificationClick = () => {
    setHasNewNotification(false);
    if (hasNewNotification) {
      toast.success("List updated with latest courses!");
    }
  };

  const filteredCourses = courses.filter((course) =>
    course.courseName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="courses-wrapper">
      {/* Container for Toast Notifications */}
      <ToastContainer />

      <div className="page-header-card">
        <div className="header-left">
          <h1>All Courses</h1>
          <span>Manage and view available learning tracks</span>
        </div>

        <div className="header-right">
          <div className="search-container">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search by course name..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="notification-bell" onClick={handleNotificationClick}>
            🔔
            {hasNewNotification && <span className="notification-badge"></span>}
          </div>
        </div>
      </div>

      <div className="courses-grid">
        {filteredCourses.length > 0 ? (
          filteredCourses.map((course) => (
            <div key={course.id} className="course-card">
              <div className="card-top-row">
                <div className="course-icon">📘</div>
                <h2 className="course-title">{course.courseName}</h2>
              </div>
              <div className="card-body">
                <div className="duration-tag">{course.duration}</div>
                <p className="description">{course.description?.substring(0, 90)}...</p>
              </div>
              <button
                className="view-btn"
                onClick={() => navigate(`/admin/course-details/${course.id}`, { state: course })}
              >
                View Details
              </button>
            </div>
          ))
        ) : (
          <div className="no-results-msg">
            {searchTerm ? `No courses match "${searchTerm}"` : "Loading courses..."}
          </div>
        )}
      </div>
    </div>
  );
}

export default AllCourses;