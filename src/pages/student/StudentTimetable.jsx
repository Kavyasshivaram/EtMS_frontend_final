import { useState, useEffect } from "react";
import "./StudentTimetable.css";

const demoClasses = [
  {
    id: 1,
    title: "Java Full Stack",
    subject: "Core Java",
    date: "2026-02-25",
    time: "10:00 AM",
    zoom: "https://zoom.us/java-class",
    color: "#4CAF50",
  },
  {
    id: 2,
    title: "AIML Developer",
    subject: "Machine Learning",
    date: "2026-02-26",
    time: "2:00 PM",
    zoom: "https://zoom.us/aiml-class",
    color: "#2196F3",
  },
];

function StudentTimetable() {
  const [nextClass, setNextClass] = useState(null);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    const upcoming = demoClasses.find((c) => c.date >= today);
    setNextClass(upcoming);
  }, []);

  return (
    <div className="timetable-container">
      <h2>Student Timetable</h2>

      {nextClass && (
        <div className="next-class student">
          <h3>🔔 Upcoming Class</h3>
          <p>{nextClass.title} - {nextClass.subject}</p>
          <p>{nextClass.date} | {nextClass.time}</p>
        </div>
      )}

      <div className="calendar-grid">
        {demoClasses.map((cls) => (
          <div
            key={cls.id}
            className="class-card"
            style={{ borderLeft: `6px solid ${cls.color}` }}
          >
            <h3>{cls.title}</h3>
            <p>{cls.subject}</p>
            <p>{cls.date} | {cls.time}</p>

            <a href={cls.zoom} target="_blank" rel="noreferrer">
              <button className="zoom-btn">Join Class</button>
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

export default StudentTimetable;