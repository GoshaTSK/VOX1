import { useState, useEffect } from 'react';
import * as store from './store';
import LoginPage from './pages/LoginPage';
import MentorDashboard from './pages/MentorDashboard';
import StudentLobby from './pages/StudentLobby';

type AppState =
  | { screen: 'login' }
  | { screen: 'mentor'; id: string }
  | { screen: 'student'; id: string };

export default function App() {
  const [state, setState] = useState<AppState>({ screen: 'login' });

  useEffect(() => {
    const user = store.getCurrentUser();
    if (user) {
      if (user.role === 'mentor') setState({ screen: 'mentor', id: user.id });
      else setState({ screen: 'student', id: user.id });
    }
  }, []);

  const handleLogin = (role: 'mentor' | 'student', id: string) => {
    if (role === 'mentor') setState({ screen: 'mentor', id });
    else setState({ screen: 'student', id });
  };

  const handleLogout = () => {
    store.setCurrentUser(null);
    setState({ screen: 'login' });
  };

  if (state.screen === 'login') return <LoginPage onLogin={handleLogin} />;
  if (state.screen === 'mentor') return <MentorDashboard mentorId={state.id} onLogout={handleLogout} />;
  if (state.screen === 'student') return <StudentLobby studentId={state.id} onLogout={handleLogout} />;
  return null;
}
