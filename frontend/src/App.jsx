import { useEffect } from 'react';
import { useAuthStore } from "./store/useAuthStore";
import { useWatchStore } from "./store/useWatchStore";
import { Brain, LogOut, Loader2 } from 'lucide-react';
import AgentForm from './components/AgentForm';
import LiveReport from './components/LiveReport';
import HistoryFeed from './components/HistoryFeed';
import AuthForm from './components/AuthForm';

export default function App() {
  // Global states from Zustand stores
  const { authUser, isCheckingAuth, checkAuth, logout } = useAuthStore();
  const { fetchHistory, launchWatch, history, currentReport, loading } = useWatchStore();

  // Initialize auth state and fetch user data
  useEffect(() => {
    checkAuth();
  }, [checkAuth]); 

  // Automatically fetch history once user is authenticated
  useEffect(() => {
    if (authUser) fetchHistory();
  }, [authUser, fetchHistory]);

  // 1. Loading screen during authentication validation
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  // 2. Authentication Gate: Enforce login if no user is authenticated
  if (!authUser) {
    return <AuthForm/>;
  }

  // 3. Authenticated Dashboard Layout
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12 font-sans">
      <header className="max-w-6xl mx-auto mb-10 flex items-center justify-between border-b border-slate-800 pb-6">
        <div className="flex items-center gap-3">
          <Brain className="w-10 h-10 text-indigo-500" />
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r select-none from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
              AI Watch Agent
            </h1>
            <p className="text-slate-400 text-sm">Welcome back, {authUser.fullName}</p>
          </div>
        </div>
        <button 
          onClick={logout}
          className="flex items-center gap-2 border border-slate-800 hover:border-rose-900/50 hover:bg-rose-950/20 px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-rose-400 transition"
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <AgentForm onLaunch={launchWatch} loading={loading} />
        </div>
        <div className="lg:col-span-2 space-y-6">
          <LiveReport currentReport={currentReport} />
          <HistoryFeed history={history} />
        </div>
      </main>
    </div>
  );
}
