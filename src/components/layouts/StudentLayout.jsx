import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { LayoutDashboard, BookOpen, History, LogOut, User, KeyRound, FilePlus, ClipboardList, School, Trophy } from 'lucide-react';
import Logo from '../common/Logo';
import { useContext, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import ConfirmModal from '../common/ConfirmModal';

export default function StudentLayout() {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Available Quizzes', path: '/quizzes', icon: BookOpen },
    { name: 'My History', path: '/history', icon: History },
    { name: 'Create Quiz', path: '/create-quiz', icon: FilePlus },
    { name: 'My Quizzes', path: '/my-quizzes', icon: ClipboardList },
    { name: 'Classrooms', path: '/classrooms', icon: School },
    { name: 'Leaderboard', path: '/leaderboard', icon: Trophy },
  ];

  const handleLogout = () => {
    setShowLogoutConfirm(false);
    logout();
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-950/80 border-r border-slate-800 flex flex-col sticky top-0 h-screen backdrop-blur-md">
        <div className="p-6 border-b border-slate-800">
          <Link to="/dashboard"><Logo size="md" /></Link>
        </div>

        <nav className="flex-1 p-4 space-y-1 mt-4">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
                location.pathname === item.path 
                  ? 'bg-teal-500 text-slate-900 shadow-lg shadow-teal-900/40' 
                  : 'text-slate-300 hover:bg-slate-900/60 hover:text-white'
              }`}
            >
              <item.icon className={`w-5 h-5 ${location.pathname === item.path ? 'text-slate-900' : 'text-slate-400'}`} />
              {item.name}
            </Link>
          ))}
        </nav>

        {/* User Profile & Logout Section */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-3 px-4 py-3 mb-2 bg-slate-900 rounded-xl border border-slate-800 shadow-sm">
            <div className="w-9 h-9 rounded-full bg-teal-500/20 flex items-center justify-center border border-teal-500/30">
              <User className="w-5 h-5 text-teal-300"/>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold truncate text-slate-100">{user?.full_name || 'Student'}</div>
              <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Student Account</div>
            </div>
          </div>
          
          <Link
            to="/profile"
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-teal-300 hover:bg-teal-500/10 rounded-xl transition-all duration-200 font-bold text-sm group"
          >
            <User className="w-5 h-5 text-slate-400 group-hover:text-teal-300 transition-colors" />
            My Profile
          </Link>

          <Link
            to="/change-password"
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-teal-300 hover:bg-teal-500/10 rounded-xl transition-all duration-200 font-bold text-sm group"
          >
            <KeyRound className="w-5 h-5 text-slate-400 group-hover:text-teal-300 transition-colors" />
            Change Password
          </Link>

          <button 
            onClick={() => setShowLogoutConfirm(true)} 
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-all duration-200 font-bold text-sm group"
          >
            <LogOut className="w-5 h-5 text-slate-400 group-hover:text-rose-300 transition-colors" /> 
            Logout Session
          </button>
        </div>
      </aside>

      {/* Content Area */}
      <main className="flex-1 overflow-y-auto p-10">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>

      <ConfirmModal
        open={showLogoutConfirm}
        title="Log Out"
        message="Are you sure you want to log out of your session?"
        confirmText="Log Out"
        danger
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </div>
  );
}