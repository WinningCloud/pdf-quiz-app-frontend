import { Link, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileUp, ClipboardList, BarChart3, LogOut, KeyRound, Users, User, GraduationCap, School, FilePlus, Trophy, ShieldCheck } from 'lucide-react';
import Logo from '../common/Logo';
import { useContext, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import ConfirmModal from '../common/ConfirmModal';

export default function AdminLayout() {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const isAdmin = user?.is_admin;

  const menu = [
    { name: 'Overview', path: '/admin', icon: LayoutDashboard },
    ...(isAdmin ? [
      { name: 'PDF Library', path: '/admin/pdfs', icon: FileUp },
      { name: 'Quiz Management', path: '/admin/quizzes', icon: ClipboardList },
      { name: 'User Management', path: '/admin/users', icon: Users },
      { name: 'Mentors', path: '/admin/mentors', icon: GraduationCap },
      { name: 'Admins', path: '/admin/admins', icon: ShieldCheck },
    ] : [
      { name: 'Create Quiz', path: '/admin/create-quiz', icon: FilePlus },
      { name: 'My Quizzes', path: '/admin/my-quizzes', icon: ClipboardList },
    ]),
    { name: 'Classrooms', path: '/admin/classrooms', icon: School },
    { name: 'Leaderboard', path: '/admin/leaderboard', icon: Trophy },
  ];

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-slate-950 text-slate-300 flex flex-col fixed h-full border-r border-slate-900">
        <div className="p-5 text-white font-bold text-2xl flex items-center gap-2">
          <Link to="/admin"><Logo size="sm" /></Link>
        </div>
        <nav className="flex-1 px-4 space-y-1 mt-4">
          {menu.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium ${
                location.pathname === item.path ? 'bg-teal-500 text-slate-900' : 'hover:bg-slate-800'
              }`}
            >
              <item.icon className="w-5 h-5" /> {item.name}
            </Link>
          ))}
        </nav>
        <div className="m-4 space-y-1">
          <Link
            to="/admin/profile"
            className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-teal-300 hover:bg-teal-500/10 rounded-xl transition font-medium"
          >
            <User className="w-5 h-5" /> My Profile
          </Link>
          <Link
            to="/admin/change-password"
            className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-teal-300 hover:bg-teal-500/10 rounded-xl transition font-medium"
          >
            <KeyRound className="w-5 h-5" /> Change Password
          </Link>
          <button onClick={() => setShowLogoutConfirm(true)} className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition">
            <LogOut className="w-5 h-5" /> Logout
          </button>
        </div>
      </aside>
      <main className="flex-1 ml-64 p-6 h-screen overflow-y-auto">
        <Outlet />
      </main>

      <ConfirmModal
        open={showLogoutConfirm}
        title="Log Out"
        message="Are you sure you want to log out of the admin panel?"
        confirmText="Log Out"
        danger
        onConfirm={() => { setShowLogoutConfirm(false); logout(); }}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </div>
  );
}