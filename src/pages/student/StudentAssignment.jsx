import { useState, useEffect } from "react";
import "./StudentAssignment.css";

function StudentAssignment() {
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes

  const assignments = [
    {
      id: 1,
      title: "MCQ Assignment",
      type: "MCQ",
      dueDate: "25 Feb 2026",
      status: "Pending",
    },
    {
      id: 2,
      title: "Coding Assignment",
      type: "CODING",
      dueDate: "28 Feb 2026",
      status: "Submitted",
    },
  ];

  const mcqQuestions = [
    {
      id: 1,
      question: "What is the average of first five multiples of 12?",
      options: ["36", "38", "40", "42"],
      correct: "36",
    },
    {
      id: 2,
      question:
        "Average of five numbers is 20. If each number is multiplied by 2, what will be the new average?",
      options: ["30", "40", "50", "60"],
      correct: "40",
    },
  ];

  /* ================= TIMER ================= */
  useEffect(() => {
    if (selectedAssignment?.type === "MCQ" && !submitted) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [selectedAssignment, submitted]);

  const handleSelect = (qId, option) => {
    setAnswers({ ...answers, [qId]: option });
  };

  const handleSubmit = () => {
    let total = 0;
    mcqQuestions.forEach((q) => {
      if (answers[q.id] === q.correct) total++;
    });
    setScore(total);
    setSubmitted(true);

    // Auto close after 4 seconds
    setTimeout(() => {
      setSelectedAssignment(null);
      setSubmitted(false);
      setAnswers({});
      setTimeLeft(120);
    }, 4000);
  };

  return (
    <div className="assignment-page">
      <div className="assignment-header">
        <h2>Assignments</h2>
        <p>Complete your pending tasks before deadline</p>
      </div>

      {/* STATS */}
      <div className="assignment-stats">
        <div className="stat-card">
          <h3>{assignments.length}</h3>
          <p>Total</p>
        </div>
        <div className="stat-card pending">
          <h3>
            {assignments.filter((a) => a.status === "Pending").length}
          </h3>
          <p>Pending</p>
        </div>
        <div className="stat-card submitted">
          <h3>
            {assignments.filter((a) => a.status === "Submitted").length}
          </h3>
          <p>Submitted</p>
        </div>
      </div>

      {/* ASSIGNMENT CARDS */}
      <div className="assignment-grid">
        {assignments.map((item) => (
          <div key={item.id} className="assignment-card">
            <div className="card-header">
              <h3>{item.title}</h3>
              <span className={`status ${item.status.toLowerCase()}`}>
                {item.status}
              </span>
            </div>

            <p>Type: {item.type}</p>
            <p>Due Date: {item.dueDate}</p>

            <button
              className="view-btn"
              onClick={() => setSelectedAssignment(item)}
            >
              View Assignment
            </button>
          </div>
        ))}
      </div>

      {/* ================= MODAL ================= */}
      {selectedAssignment && (
        <div className="modal-overlay">
          <div className="modal">
            <button
              className="close-btn"
              onClick={() => setSelectedAssignment(null)}
            >
              ✕
            </button>

            <h3>{selectedAssignment.title}</h3>

            {/* MCQ SECTION */}
            {selectedAssignment.type === "MCQ" && (
              <>
                {!submitted && (
                  <div className="timer">
                    Time Left: {Math.floor(timeLeft / 60)}:
                    {(timeLeft % 60).toString().padStart(2, "0")}
                  </div>
                )}

                {mcqQuestions.map((q) => (
                  <div key={q.id} className="question-card">
                    <p>
                      <strong>Q{q.id}:</strong> {q.question}
                    </p>

                    {q.options.map((opt, index) => {
                      const isCorrect = opt === q.correct;
                      const isSelected = answers[q.id] === opt;

                      return (
                        <label
                          key={index}
                          className={`option-label ${
                            submitted
                              ? isCorrect
                                ? "correct"
                                : isSelected
                                ? "wrong"
                                : ""
                              : ""
                          }`}
                        >
                          <input
                            type="radio"
                            disabled={submitted}
                            checked={isSelected}
                            onChange={() => handleSelect(q.id, opt)}
                          />
                          {opt}
                        </label>
                      );
                    })}
                  </div>
                ))}

                {!submitted ? (
                  <button className="submit-btn" onClick={handleSubmit}>
                    Submit MCQ
                  </button>
                ) : (
                  <div className="result-box">
                    Your Score: {score} / {mcqQuestions.length}
                  </div>
                )}
              </>
            )}

            {/* CODING SECTION */}
            {selectedAssignment.type === "CODING" && (
              <>
                <p>
                  <strong>Problem:</strong> Write a program to find factorial of
                  a number.
                </p>

                <textarea
                  className="code-editor"
                  placeholder="Write your code here..."
                ></textarea>

                <button className="submit-btn">Submit Code</button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentAssignment;