import "./StudentModule.css";

function StudentPerformance() {
  return (
    <div className="module-container">
      <h2>Performance Overview</h2>

      <div className="progress-card">
        <p>Overall Progress</p>
        <div className="progress-bar-container">
          <div className="progress-bar" style={{ width: "74%" }} />
        </div>
        <span>74% Completed</span>
      </div>
    </div>
  );
}

export default StudentPerformance;