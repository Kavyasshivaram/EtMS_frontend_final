import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import "./CourseDetails.css";

function CourseDetails() {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();

  const [course, setCourse] = useState(location.state || null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!course) {
      fetchCourseDetails();
    }
  }, []);

  const fetchCourseDetails = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        "http://localhost:8080/api/admin/courses/details"
      );

      const found = res.data.find((c) => c.id === parseInt(id));
      setCourse(found);
    } catch (err) {
      console.error("Error fetching course details", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !course) return <h2 className="loading">Loading...</h2>;

  return (
    <div className="course-details-wrapper">
      <button className="back-btn" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <div className="details-card">
        {/* Course Header */}
        <div className="course-header">
          <div>
            <h1>{course.courseName}</h1>
            <p className="description">{course.description}</p>
          </div>
          <span className="duration">{course.duration}</span>
        </div>

        <h2 className="batch-title">Batches</h2>

        {course.batches && course.batches.length > 0 ? (
          <div className="batch-grid">
            {course.batches.map((batch) => (
              <div key={batch.batchId} className="batch-card">
                <h3 className="batch-name">{batch.batchName}</h3>

                {/* Trainer Section */}
                <div className="trainer-section">
                  <h4>Trainer Details</h4>

                  {batch.trainerName ? (
                    <div className="trainer-card">
                      <div className="trainer-avatar">
                        {batch.trainerName.charAt(0)}
                      </div>

                      <div className="trainer-info">
                        <span className="trainer-name">
                          {batch.trainerName}
                        </span>
                        <span className="trainer-email">
                          {batch.trainerEmail}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="not-assigned">Trainer Not Assigned</p>
                  )}
                </div>

                {/* Students Section */}
                <div className="students-section">
                  <h4>Students</h4>

                  {batch.students && batch.students.length > 0 ? (
                    <div className="students-grid">
                      {batch.students.map((student, index) => (
                        <span key={index} className="student-badge">
                          {student}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="no-students">
                      No students enrolled in this batch
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-batch">No batches created for this course.</p>
        )}
      </div>
    </div>
  );
}

export default CourseDetails;