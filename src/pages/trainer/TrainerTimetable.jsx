import { useState, useEffect } from "react";
import "./TrainerTimetable.css";

const demoClasses = [
  {
    id: 1,
    title: "Java Full Stack",
    subject: "Core Java",
    date: "2026-02-25",
    time: "10:00 AM",
    zoom: "https://zoom.us/java-class",
    recurring: "Mon, Wed, Fri",
    attendance: 28,
    totalStudents: 30,
    color: "#4CAF50",
  },
  {
    id: 2,
    title: "AIML Developer",
    subject: "Machine Learning",
    date: "2026-02-26",
    time: "2:00 PM",
    zoom: "https://zoom.us/aiml-class",
    recurring: "Tue, Thu",
    attendance: 24,
    totalStudents: 30,
    color: "#2196F3",
  },
];

function TrainerTimetable() {
  const [classes, setClasses] = useState(demoClasses);
  const [nextClass, setNextClass] = useState(null);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    const upcoming = classes.find((c) => c.date >= today);
    setNextClass(upcoming);
  }, [classes]);

  return (
    <div className="timetable-container">
      <h2>Trainer Timetable</h2>

      {nextClass && (
        <div className="next-class">
          <h3>⏳ Next Class</h3>
          <p>{nextClass.title} - {nextClass.subject}</p>
          <p>{nextClass.date} | {nextClass.time}</p>
        </div>
      )}

      <div className="calendar-grid">
        {classes.map((cls) => (
          <div
            key={cls.id}
            className="class-card"
            style={{ borderLeft: `6px solid ${cls.color}` }}
          >
            <h3>{cls.title}</h3>
            <p><strong>Subject:</strong> {cls.subject}</p>
            <p><strong>Date:</strong> {cls.date}</p>
            <p><strong>Time:</strong> {cls.time}</p>
            <p><strong>Recurring:</strong> {cls.recurring}</p>

            <p>
              <strong>Attendance:</strong> {cls.attendance}/{cls.totalStudents}
            </p>

            <a href={cls.zoom} target="_blank" rel="noreferrer">
              <button className="zoom-btn">Join Zoom</button>
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TrainerTimetable;