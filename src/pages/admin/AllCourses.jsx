import { useEffect, useState, useRef } from "react";
import api from "../../api/axiosConfig";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { 
  FaSearch, FaBell, FaBookOpen, FaClock, 
  FaArrowRight, FaTimes, FaGraduationCap 
} from "react-icons/fa";
import "react-toastify/dist/ReactToastify.css";
import "./AllCourses.css";

function AllCourses() {
  const [courses, setCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [hasNewNotification, setHasNewNotification] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const lastCourseCount = useRef(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCourses(true);
    const interval = setInterval(() => fetchCourses(false), 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchCourses = async (isFirstLoad) => {
    try {
      const response = await api.get("admin/courses/details");
      const newCourses = response.data;

      if (!isFirstLoad && newCourses.length > lastCourseCount.current) {
        setHasNewNotification(true);
        toast.info("📚 New curriculum tracks added!", {
          position: "top-right",
          theme: "colored",
        });
      }

      setCourses(newCourses);
      lastCourseCount.current = newCourses.length;
    } catch (error) {
      console.error("Error fetching courses", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = () => {
    if (hasNewNotification) {
      setHasNewNotification(false);
      toast.success("Catalog updated!");
    }
  };

  const filteredCourses = courses.filter((course) =>
    course.courseName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="all-courses-module">
      <ToastContainer />

      {/* HEADER SECTION */}
      <header className="ac-main-header">
        <div className="ac-header-inner">
          <div className="ac-title-section">
            <div className="ac-title-icon">
              <FaGraduationCap />
            </div>
            <div className="ac-title-text">
              <h1>Academic Catalog</h1>
              <p>Displaying {filteredCourses.length} Learning Tracks</p>
            </div>
          </div>
          
          <div className="ac-header-controls">
            {/* STRUCTURED SEARCH BAR */}
            <div className={`ac-search-container ${searchTerm ? 'ac-active' : ''}`}>
              <div className="ac-search-input-group">
                <FaSearch className="ac-search-icon" />
                <input
                  type="text"
                  placeholder="Search by course name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button className="ac-search-clear" onClick={() => setSearchTerm("")}>
                    <FaTimes />
                  </button>
                )}
              </div>
            </div>

            <button className="ac-notif-btn" onClick={handleNotificationClick}>
              <FaBell className={`ac-bell ${hasNewNotification ? 'ac-swing' : ''}`} />
              {hasNewNotification && <span className="ac-notif-dot"></span>}
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="ac-content-wrapper">
        {loading ? (
          <div className="ac-state-view">
            <div className="ac-spinner"></div>
            <p>Syncing catalog data...</p>
          </div>
        ) : filteredCourses.length > 0 ? (
          <div className="ac-card-grid">
            {filteredCourses.map((course) => (
              <div key={course.id} className="ac-course-card">
                <div className="ac-card-glow"></div>
                
                <div className="ac-card-top">
                  <div className="ac-icon-box">
                    <FaBookOpen />
                  </div>
                  <div className="ac-duration">
                    <FaClock className="ac-clock-icon" /> {course.duration}
                  </div>
                </div>

                <div className="ac-card-body">
                  <h2 className="ac-course-title">{course.courseName}</h2>
                  <p className="ac-course-desc">
                    {course.description || "Comprehensive learning module covering industry-standard practices and fundamental concepts."}
                  </p>
                </div>

                <div className="ac-card-footer">
                  <button
                    className="ac-manage-btn"
                    onClick={() => navigate(`/admin/course-details/${course.id}`, { state: course })}
                  >
                    <span>View Details</span>
                    <FaArrowRight className="ac-arrow" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="ac-empty-state">
            <div className="ac-empty-icon">📂</div>
            <h3>No Courses Found</h3>
            <p>We couldn't find matches for "{searchTerm}".</p>
            <button className="ac-reset-btn" onClick={() => setSearchTerm("")}>Clear Filters</button>
          </div>
        )}
      </main>
    </div>
  );
}

export default AllCourses;