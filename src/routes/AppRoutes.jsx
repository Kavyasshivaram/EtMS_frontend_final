import { Routes, Route } from "react-router-dom";

import Home from "../pages/Home";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ForgotPassword from "../pages/auth/ForgotPassword";
import VerifyOtp from "../pages/auth/VerifyOtp";
import ResetPassword from "../pages/auth/ResetPassword";

import ProtectedRoute from "../components/ProtectedRoute";
import DashboardLayout from "../layouts/DashboardLayout";

/* ================= COURSES ================= */
import JavaCoursePage from "../pages/courses/JavaCoursePage";
import AboutUs from "../pages/AboutUs";

/* ================= SUPER ADMIN ================= */
import SuperAdminDashboard from "../pages/superadmin/SuperAdminDashboard";
import CreateAdmin from "../pages/superadmin/CreateAdmin";
import FinanceManagement from "../pages/superadmin/FinanceManagement";
import MessagingHub from "../pages/superadmin/MessagingHub";
import SuperAdminProfile from "../pages/superadmin/SuperAdminProfile";
import UserManagement from "../pages/superadmin/UserManagement";
import CreateUser from "../pages/superadmin/CreateUser";
import PerformanceDashboard from "../pages/superadmin/PerformanceDashboard";

/* ================= STUDENT ================= */
import StudentDashboard from "../pages/student/StudentDashboard";
import StudentCourses from "../pages/student/StudentCourses";
import StudentCourseDetails from "../pages/student/StudentCourseDetails";
import StudentAttendance from "../pages/student/StudentAttendance";
import StudentAssignment from "../pages/student/StudentAssignment";
import StudentResults from "../pages/student/StudentResults";
import StudentTimetable from "../pages/student/StudentTimetable";
import StudentMaterials from "../pages/student/StudentMaterials";
import StudentAnnouncements from "../pages/student/StudentAnnouncements";
import StudentPerformance from "../pages/student/StudentPerformance";
import StudentCertificates from "../pages/student/StudentCertificates";
import StudentProfile from "../pages/student/StudentProfile";

/* ================= TRAINER ================= */
import TrainerDashboard from "../pages/trainer/TrainerDashboard";
import TrainerProfile from "../pages/trainer/TrainerProfile";
import TrainerCourses from "../pages/trainer/TrainerCourses";
import TrainerStudents from "../pages/trainer/TrainerStudents";
import TrainerAttendance from "../pages/trainer/TrainerAttendance";
import TrainerAssignments from "../pages/trainer/TrainerAssignments";
import TrainerMaterials from "../pages/trainer/TrainerMaterials";
import TrainerTimetable from "../pages/trainer/TrainerTimetable";
import TrainerPerformance from "../pages/trainer/TrainerPerformance";
import TrainerAnnouncements from "../pages/trainer/TrainerAnnouncements";

/* ================= ADMIN ================= */
import AdminDashboard from "../pages/admin/AdminDashboard";
import CreateCourse from "../pages/admin/CreateCourse";
import AssignTrainer from "../pages/admin/AssignTrainer";
import AllCourses from "../pages/admin/AllCourses";
import CourseDetails from "../pages/admin/CourseDetails";
import CreateBatch from "../pages/admin/CreateBatch";
import ScheduleClass from "../pages/admin/AdminScheduleClass";
import ManageStudents from "../pages/admin/ManageStudents";
import AdminAttendance from "../pages/admin/AdminAttendance";

/* ================= MARKETER ================= */
import MarketerDashboard from "../pages/marketer/MarketerDashboard";
import Leads from "../pages/marketer/Leads";

export default function AppRoutes() {
  return (
    <Routes>

      {/* ================= PUBLIC ROUTES ================= */}
      <Route path="/" element={<Home />} />
      <Route path="/home" element={<Home />} />
      <Route path="/java-training-bangalore" element={<JavaCoursePage />} />
      <Route path="/about-us" element={<AboutUs />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/verify-otp" element={<VerifyOtp />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* ================= STUDENT ================= */}
      <Route
        path="/student/*"
        element={
          <ProtectedRoute allowedRoles={["STUDENT"]}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        {/* Default page */}
          <Route path="dashboard" element={<StudentDashboard />} />
        
          {/* Existing Routes */}
        <Route path="courses" element={<StudentCourses />} />
          <Route path="course/:id" element={<StudentCourseDetails />} />
          <Route path="attendance" element={<StudentAttendance />} />
          <Route path="assignments" element={<StudentAssignment />} />
        
          {/* ================= NEW MODULES ================= */}
        
          {/* Results / Grades */}
          <Route path="results" element={<StudentResults />} />
        
          {/* Timetable */}
          <Route path="timetable" element={<StudentTimetable />} />
        
          {/* Study Materials */}
          <Route path="materials" element={<StudentMaterials />} />
        
          {/* Announcements */}
          <Route path="announcements" element={<StudentAnnouncements />} />
        
          {/* Performance Analytics */}
          <Route path="performance" element={<StudentPerformance />} />
        
          {/* Certificates */}
          <Route path="certificates" element={<StudentCertificates />} />
        
          {/* Profile */}
          <Route path="profile" element={<StudentProfile />} />
      </Route>

      {/* ================= TRAINER ================= */}
      <Route
        path="/trainer/*"
        element={
          <ProtectedRoute allowedRoles={["TRAINER"]}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
         <Route path="dashboard" element={<TrainerDashboard />} />
                <Route path="profile" element={<TrainerProfile />} />
                <Route path="course" element={<TrainerCourses />} />
                <Route path="manage-students" element={<TrainerStudents />} />
                <Route path="attendance" element={<TrainerAttendance />} />
                <Route path="assignments" element={<TrainerAssignments />} />
                <Route path="materials" element={<TrainerMaterials />} />
                <Route path="timetable" element={<TrainerTimetable />} />
                <Route path="performance" element={<TrainerPerformance />} />
                <Route path="announcements" element={<TrainerAnnouncements />} />
      </Route>

      {/* ================= SUPER ADMIN ================= */}
      <Route
        path="/superadmin/*"
        element={
          <ProtectedRoute allowedRoles={["SUPERADMIN"]}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<SuperAdminDashboard />} />
        <Route path="create-admin" element={<CreateAdmin />} />
        <Route path="finance" element={<FinanceManagement />} />
        <Route path="messages" element={<MessagingHub />} />
          <Route path="profile" element={<SuperAdminProfile />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="create-user" element={<CreateUser />} />
          <Route path="performance" element={<PerformanceDashboard />} />
          <Route path="meetings" element={<MessagingHub />} /> {/* Combined for now */}
      </Route>

      {/* ================= ADMIN ================= */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="create-course" element={<CreateCourse />} />
        <Route path="assign-trainer" element={<AssignTrainer />} />
        <Route path="courses" element={<AllCourses />} />
        <Route path="course-details/:id" element={<CourseDetails />} />
         <Route path="create-batch" element={<CreateBatch />} />
         <Route path="schedule-class" element={<ScheduleClass />} />
         <Route path="students" element={<ManageStudents />} />
          <Route path="attendance" element={<AdminAttendance />} />
         
        
      </Route>

      {/* ================= MARKETER ================= */}
      <Route
        path="/marketer/*"
        element={
          <ProtectedRoute allowedRoles={["MARKETER"]}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<MarketerDashboard />} />
        <Route path="leads" element={<Leads />} />
      </Route>

      {/* ================= FALLBACK ================= */}
      <Route path="*" element={<h2>Page Not Found</h2>} />

    </Routes>
  );
}
