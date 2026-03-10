import "./StudentCertificates.css";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useRef, useState } from "react";

function StudentCertificates({ student }) {
  const certificateRef = useRef();
  const [showModal, setShowModal] = useState(false);

  const studentData = student || {
    name: "Vinayaka s h",
    course: "Java Full Stack Development",
    grade: "Distinction",
    completionDate: "20 Feb 2026",
    certificateId: "PCS-GLOBAL-2026-001",
  };

  const downloadPDF = async () => {
    const element = certificateRef.current;

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
    });

    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("landscape", "mm", "a4");
    const width = pdf.internal.pageSize.getWidth();
    const height = pdf.internal.pageSize.getHeight();

    pdf.addImage(imgData, "PNG", 0, 0, width, height);
    pdf.save(`${studentData.name}-Certificate.pdf`);
  };

  return (
    <div className="certificate-page">

      {/* Course Completion Card */}
      <div className="completion-card">
        <h2>🎓 Course Completed</h2>
        <p>
          Congratulations <strong>{studentData.name}</strong>!
        </p>
        <h3>{studentData.course}</h3>

        <button
          className="view-btn"
          onClick={() => setShowModal(true)}
        >
          View Certificate
        </button>
      </div>

      {/* Popup Modal */}
      {showModal && (
        <div className="certificate-modal">
          <div className="certificate-popup">

            <button
              className="close-btn"
              onClick={() => setShowModal(false)}
            >
              ✖
            </button>

            <div className="certificate-card" ref={certificateRef}>
              <div className="watermark">PCS GLOBAL</div>

              <div className="certificate-header">
                <h2>Certificate of Completion</h2>
                <p>ID: {studentData.certificateId}</p>
              </div>

              <div className="certificate-body">
                <p>This is to certify that</p>

                <h1>{studentData.name}</h1>

                <p>has successfully completed</p>

                <h3>{studentData.course}</h3>

                <div className="certificate-details">
                  <div>
                    <span>Completion Date</span>
                    <strong>{studentData.completionDate}</strong>
                  </div>

                  <div>
                    <span>Grade</span>
                    <strong>{studentData.grade}</strong>
                  </div>
                </div>
              </div>

              <div className="certificate-footer">
                <div className="signature">
                  <div className="line"></div>
                  <span>Instructor</span>
                </div>

                <div className="signature">
                  <div className="line"></div>
                  <span>Director</span>
                </div>
              </div>
            </div>

            <div className="download-section">
              <button
                className="download-btn"
                onClick={downloadPDF}
              >
                ⬇ Download PDF
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default StudentCertificates;