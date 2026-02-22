import { Routes, Route } from 'react-router-dom';
import LandingPage from '../pages/LandingPage.jsx';
import Login from '../pages/auth/Login.jsx';
import Register from '../pages/auth/Register';
import PrivateRoute from './PrivateRoute';
import AdminRoute from './AdminRoute';
import StudentLayout from '../components/layouts/StudentLayout.jsx';
import AvailableQuizzes from '../pages/student/AvailableQuizzes.jsx';
import TakeQuiz from '../pages/student/TakeQuiz.jsx';
import StudentDashboard from '../pages/student/Dashboard.jsx';
import AttemptHistory from '../pages/student/AttemptHistory.jsx';
import StudentCreateQuiz from '../pages/student/StudentCreateQuiz.jsx';
import StudentMyQuizzes from '../pages/student/StudentMyQuizzes.jsx';
import AdminLayout from '../components/layouts/AdminLayout';
import AdminDashboard from '../pages/admin/AdminDashboard';
import PDFLibrary from '../pages/admin/PDFLibrary';
import QuizManagement from '../pages/admin/QuizManagement';
import QuizEditor from '../pages/admin/QuizEditor';
import UserManagement from '../pages/admin/UserManagement';
import AdminLogin from '../pages/auth/AdminLogin.jsx';
import QuizResult from '../pages/student/QuizResult.jsx';
import ChangePassword from '../pages/auth/ChangePassword.jsx';
import CompleteProfile from '../pages/auth/CompleteProfile.jsx';
import MyProfile from '../pages/shared/MyProfile.jsx';
import SharedQuiz from '../pages/shared/SharedQuiz.jsx';
import MentorManagement from '../pages/admin/MentorManagement.jsx';
import AdminManagement from '../pages/admin/AdminManagement.jsx';
import Classrooms from '../pages/admin/Classrooms.jsx';
import ClassroomDetail from '../pages/admin/ClassroomDetail.jsx';
import ClassroomAnalytics from '../pages/admin/ClassroomAnalytics.jsx';
import StudentClassrooms from '../pages/student/StudentClassrooms.jsx';
import Leaderboard from '../pages/shared/Leaderboard.jsx';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/admin-login" element={<AdminLogin />} />
      <Route path="/shared/:shareCode" element={<SharedQuiz />} />

      {/* Protected Student/User Routes */}
      <Route element={<PrivateRoute />}>
        {/* Complete Profile (no layout wrapper - full screen) */}
        <Route path="/complete-profile" element={<CompleteProfile />} />
        <Route element={<StudentLayout />}>
          <Route path="/dashboard" element={<StudentDashboard />} />
          <Route path="/quizzes" element={<AvailableQuizzes />} />
          <Route path="/quiz/:quizId" element={<TakeQuiz />} />
          <Route path="/quiz/take/:quizId" element={<TakeQuiz />} />
          <Route path="/quiz/result/:attemptId" element={<QuizResult />} />
          <Route path="/history" element={<AttemptHistory />} />
          <Route path="/create-quiz" element={<StudentCreateQuiz />} />
          <Route path="/my-quizzes" element={<StudentMyQuizzes />} />
          <Route path="/quiz-editor/:id" element={<QuizEditor />} />
          <Route path="/profile" element={<MyProfile />} />
          <Route path="/change-password" element={<ChangePassword />} />
          <Route path="/classrooms" element={<StudentClassrooms />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
        </Route>
      </Route>

      {/* Protected Admin Routes */}
      <Route element={<AdminRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/pdfs" element={<PDFLibrary />} />
          <Route path="/admin/quizzes" element={<QuizManagement />} />
          <Route path="/admin/quiz-editor/:id" element={<QuizEditor />} />
          <Route path="/admin/users" element={<UserManagement />} />
          <Route path="/admin/mentors" element={<MentorManagement />} />
          <Route path="/admin/admins" element={<AdminManagement />} />
          <Route path="/admin/classrooms" element={<Classrooms />} />
          <Route path="/admin/classroom/:classroomId" element={<ClassroomDetail />} />
          <Route path="/admin/classroom/:classroomId/analytics" element={<ClassroomAnalytics />} />
          <Route path="/admin/create-quiz" element={<StudentCreateQuiz />} />
          <Route path="/admin/my-quizzes" element={<StudentMyQuizzes />} />
          <Route path="/admin/leaderboard" element={<Leaderboard />} />
          <Route path="/admin/profile" element={<MyProfile />} />
          <Route path="/admin/change-password" element={<ChangePassword />} />
        </Route>
      </Route>

      {/* 404 Catch-all */}
      <Route path="*" element={<div className="p-20 text-center">404 - Page Not Found</div>} />
    </Routes>
  );
};

export default AppRoutes;