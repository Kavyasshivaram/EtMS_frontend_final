import "./StudentModule.css";

function StudentAnnouncements() {
  return (
    <div className="module-container">
      <div className="module-header">
        <h2>📢 Announcements</h2>
        <span className="module-subtitle">Latest Updates & Notices</span>
      </div>

      {/* Job Posting */}
      <div className="announcement-card">
        <div className="announcement-badge job">New</div>
        <h3>💼 Job Opportunity Posted</h3>
        <p>
          A new Software Developer internship has been posted on the portal.
          Interested students can apply before <strong>28th March</strong>.
        </p>
        <span className="announcement-date">Posted Today</span>
      </div>

      {/* Tomorrow Holiday */}
      <div className="announcement-card">
        <div className="announcement-badge holiday">Holiday</div>
        <h3>🎉 Tomorrow is a Holiday</h3>
        <p>
          The institution will remain closed tomorrow due to a public holiday.
          Regular classes will resume the following day.
        </p>
        <span className="announcement-date">Effective: Tomorrow</span>
      </div>

      {/* Townhall Meeting */}
      <div className="announcement-card">
        <div className="announcement-badge meeting">Meeting</div>
        <h3>🌙 Saturday Night Townhall</h3>
        <p>
          A townhall meeting will be conducted this Saturday at 
          <strong> 11:00 PM </strong> in Zoom meeting.
          All students are encouraged to attend.
        </p>
        <span className="announcement-date">Saturday • 11:00 PM</span>
      </div>
    </div>
  );
}

export default StudentAnnouncements;