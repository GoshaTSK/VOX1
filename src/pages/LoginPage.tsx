import { useState } from 'react';
import * as store from '../store';

interface Props {
  onLogin: (role: 'mentor' | 'student', id: string) => void;
}

type AuthMode = 'choice' | 'mentor-login' | 'mentor-register' | 'mentor-reset' | 'student-join';

export default function LoginPage({ onLogin }: Props) {
  const [mode, setMode] = useState<AuthMode>('choice');

  if (mode === 'choice') return <ChoiceScreen setMode={setMode} />;
  if (mode === 'mentor-login') return <MentorLogin onLogin={onLogin} goBack={() => setMode('choice')} goReset={() => setMode('mentor-reset')} />;
  if (mode === 'mentor-register') return <MentorRegister onLogin={onLogin} goBack={() => setMode('choice')} />;
  if (mode === 'mentor-reset') return <MentorReset goBack={() => setMode('mentor-login')} />;
  if (mode === 'student-join') return <StudentJoin onLogin={onLogin} goBack={() => setMode('choice')} />;
  return null;
}

function ChoiceScreen({ setMode }: { setMode: (m: AuthMode) => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #0f0a2e 0%, #1a1145 50%, #0d1b3e 100%)' }}>
      <div className="max-w-lg w-full">
        <div className="text-center mb-10">
          <div className="text-6xl mb-4">◆</div>
          <h1 className="text-4xl font-black text-white mb-2">Voxel Academy</h1>
          <p className="text-purple-300 text-sm">Legend Edition</p>
        </div>

        <div className="grid gap-4">
          <button
            onClick={() => setMode('mentor-login')}
            className="group relative overflow-hidden rounded-2xl p-6 text-left transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
          >
            <div className="flex items-center gap-4">
              <div className="text-4xl">👨‍🏫</div>
              <div>
                <div className="text-white font-bold text-lg">Войти как наставник</div>
                <div className="text-purple-200 text-sm">Управление курсами, группами и заданиями</div>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/5 -mr-10 -mt-10"></div>
          </button>

          <button
            onClick={() => setMode('mentor-register')}
            className="group relative overflow-hidden rounded-2xl p-6 text-left transition-all hover:scale-[1.02] active:scale-[0.98] border border-purple-500/30"
            style={{ background: 'rgba(124, 58, 237, 0.1)' }}
          >
            <div className="flex items-center gap-4">
              <div className="text-4xl">📝</div>
              <div>
                <div className="text-white font-bold text-lg">Регистрация наставника</div>
                <div className="text-purple-300 text-sm">Создать новый аккаунт преподавателя</div>
              </div>
            </div>
          </button>

          <button
            onClick={() => setMode('student-join')}
            className="group relative overflow-hidden rounded-2xl p-6 text-left transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{ background: 'linear-gradient(135deg, #06b6d4, #0891b2)' }}
          >
            <div className="flex items-center gap-4">
              <div className="text-4xl">🎓</div>
              <div>
                <div className="text-white font-bold text-lg">Присоединиться к классу</div>
                <div className="text-cyan-100 text-sm">Войти по коду класса от наставника</div>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/5 -mr-10 -mt-10"></div>
          </button>
        </div>
      </div>
    </div>
  );
}

function MentorLogin({ onLogin, goBack, goReset }: { onLogin: (role: 'mentor' | 'student', id: string) => void; goBack: () => void; goReset: () => void }) {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = () => {
    setError('');
    if (!phone || !password) { setError('Заполните все поля'); return; }
    const result = store.loginMentor(phone, password);
    if (!result.ok) { setError(result.error || 'Ошибка входа'); return; }
    store.setCurrentUser({ role: 'mentor', id: result.mentor!.id });
    onLogin('mentor', result.mentor!.id);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #0f0a2e 0%, #1a1145 50%, #0d1b3e 100%)' }}>
      <div className="max-w-md w-full bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
        <button onClick={goBack} className="text-purple-300 hover:text-white mb-6 text-sm flex items-center gap-1">← Назад</button>
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">👨‍🏫</div>
          <h2 className="text-2xl font-black text-white">Вход для наставника</h2>
          <p className="text-purple-300 text-sm mt-1">Введите телефон и пароль</p>
        </div>

        {error && <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-3 mb-4 text-red-300 text-sm text-center">{error}</div>}

        <div className="space-y-4">
          <div>
            <label className="text-xs text-purple-300 font-semibold mb-1 block">Телефон</label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+7 (999) 123-45-67"
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-purple-400/50 outline-none focus:border-purple-500 transition"
            />
          </div>
          <div>
            <label className="text-xs text-purple-300 font-semibold mb-1 block">Пароль</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-purple-400/50 outline-none focus:border-purple-500 transition"
            />
          </div>
          <button onClick={handleLogin} className="w-full py-3 rounded-xl font-bold text-white transition hover:opacity-90 active:scale-[0.98]" style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}>
            Войти
          </button>
          <button onClick={goReset} className="w-full text-center text-purple-300 hover:text-white text-sm">
            Забыли пароль? Сбросить по СМС
          </button>
        </div>
      </div>
    </div>
  );
}

function MentorRegister({ onLogin, goBack }: { onLogin: (role: 'mentor' | 'student', id: string) => void; goBack: () => void }) {
  const [form, setForm] = useState({ fullName: '', organization: '', position: '', city: '', phone: '', password: '' });
  const [error, setError] = useState('');

  const update = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }));

  const handleRegister = () => {
    setError('');
    if (!form.fullName || !form.organization || !form.position || !form.city || !form.phone || !form.password) {
      setError('Заполните все поля'); return;
    }
    if (form.password.length < 4) { setError('Пароль минимум 4 символа'); return; }
    const result = store.registerMentor(form);
    if (!result.ok) { setError(result.error || 'Ошибка'); return; }
    store.setCurrentUser({ role: 'mentor', id: result.mentor!.id });
    onLogin('mentor', result.mentor!.id);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #0f0a2e 0%, #1a1145 50%, #0d1b3e 100%)' }}>
      <div className="max-w-md w-full bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
        <button onClick={goBack} className="text-purple-300 hover:text-white mb-6 text-sm flex items-center gap-1">← Назад</button>
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">📝</div>
          <h2 className="text-2xl font-black text-white">Регистрация наставника</h2>
          <p className="text-purple-300 text-sm mt-1">Заполните данные для создания аккаунта</p>
        </div>

        {error && <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-3 mb-4 text-red-300 text-sm text-center">{error}</div>}

        <div className="space-y-3">
          <Input label="ФИО" value={form.fullName} onChange={v => update('fullName', v)} placeholder="Иванов Иван Иванович" />
          <Input label="Организация" value={form.organization} onChange={v => update('organization', v)} placeholder="Школа №1 / Центр обучения" />
          <Input label="Должность" value={form.position} onChange={v => update('position', v)} placeholder="Учитель информатики" />
          <Input label="Город" value={form.city} onChange={v => update('city', v)} placeholder="Москва" />
          <Input label="Телефон (логин)" value={form.phone} onChange={v => update('phone', v)} placeholder="+79991234567" />
          <Input label="Пароль" value={form.password} onChange={v => update('password', v)} placeholder="Минимум 4 символа" type="password" />

          <button onClick={handleRegister} className="w-full py-3 rounded-xl font-bold text-white transition hover:opacity-90 active:scale-[0.98] mt-4" style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}>
            Зарегистрироваться
          </button>
        </div>
      </div>
    </div>
  );
}

function MentorReset({ goBack }: { goBack: () => void }) {
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [sentCode, setSentCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSendCode = () => {
    setError('');
    if (!phone) { setError('Введите телефон'); return; }
    const c = store.sendSmsCode(phone);
    setSentCode(c);
    setStep('code');
  };

  const handleReset = () => {
    setError('');
    if (!store.verifySmsCode(phone, code)) { setError('Неверный или просроченный код'); return; }
    if (newPassword.length < 4) { setError('Пароль минимум 4 символа'); return; }
    const result = store.resetPassword(phone, newPassword);
    if (!result.ok) { setError(result.error || 'Ошибка'); return; }
    setSuccess('Пароль успешно изменён! Теперь войдите с новым паролем.');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #0f0a2e 0%, #1a1145 50%, #0d1b3e 100%)' }}>
      <div className="max-w-md w-full bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
        <button onClick={goBack} className="text-purple-300 hover:text-white mb-6 text-sm flex items-center gap-1">← Назад</button>
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">🔑</div>
          <h2 className="text-2xl font-black text-white">Сброс пароля</h2>
          <p className="text-purple-300 text-sm mt-1">Код будет отправлен по СМС</p>
        </div>

        {error && <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-3 mb-4 text-red-300 text-sm text-center">{error}</div>}
        {success && <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-3 mb-4 text-green-300 text-sm text-center">{success}</div>}

        {step === 'phone' ? (
          <div className="space-y-4">
            <Input label="Телефон" value={phone} onChange={setPhone} placeholder="+79991234567" />
            <button onClick={handleSendCode} className="w-full py-3 rounded-xl font-bold text-white" style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}>
              📱 Отправить код
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3 text-yellow-300 text-xs text-center">
              🔐 Демо-код: <strong>{sentCode}</strong> (в реальном приложении придёт по СМС)
            </div>
            <Input label="Код из СМС" value={code} onChange={setCode} placeholder="4 цифры" />
            <Input label="Новый пароль" value={newPassword} onChange={setNewPassword} placeholder="Минимум 4 символа" type="password" />
            <button onClick={handleReset} className="w-full py-3 rounded-xl font-bold text-white" style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}>
              ✅ Сменить пароль
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function StudentJoin({ onLogin, goBack }: { onLogin: (role: 'mentor' | 'student', id: string) => void; goBack: () => void }) {
  const [step, setStep] = useState<'code' | 'register' | 'login'>('code');
  const [classCode, setClassCode] = useState('');
  const [error, setError] = useState('');
  const [regForm, setRegForm] = useState({ lastName: '', password: '', parentFullName: '', parentPhone: '' });
  const [loginForm, setLoginForm] = useState({ loginName: '', password: '' });

  const handleCheckCode = () => {
    setError('');
    if (!classCode) { setError('Введите код класса'); return; }
    const mentor = store.findMentorByClassCode(classCode);
    if (!mentor) { setError('Класс не найден. Проверьте код.'); return; }
    setStep('register');
  };

  const handleRegister = () => {
    setError('');
    if (!regForm.lastName || !regForm.password || !regForm.parentFullName || !regForm.parentPhone) {
      setError('Заполните все поля'); return;
    }
    const result = store.registerStudent(classCode.toUpperCase(), regForm.lastName, regForm.password, regForm.parentFullName, regForm.parentPhone);
    if (!result.ok) { setError(result.error || 'Ошибка'); return; }
    store.setCurrentUser({ role: 'student', id: result.student!.id });
    onLogin('student', result.student!.id);
  };

  const handleLogin = () => {
    setError('');
    if (!loginForm.loginName || !loginForm.password) { setError('Заполните все поля'); return; }
    const result = store.loginStudent(loginForm.loginName, loginForm.password);
    if (!result.ok) { setError(result.error || 'Ошибка'); return; }
    store.setCurrentUser({ role: 'student', id: result.student!.id });
    onLogin('student', result.student!.id);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #0f0a2e 0%, #1a1145 50%, #0d1b3e 100%)' }}>
      <div className="max-w-md w-full bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
        <button onClick={goBack} className="text-purple-300 hover:text-white mb-6 text-sm flex items-center gap-1">← Назад</button>
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">🎓</div>
          <h2 className="text-2xl font-black text-white">Присоединиться к классу</h2>
        </div>

        {error && <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-3 mb-4 text-red-300 text-sm text-center">{error}</div>}

        {step === 'code' && (
          <div className="space-y-4">
            <p className="text-purple-300 text-sm text-center">Введите код класса от вашего наставника</p>
            <input
              value={classCode}
              onChange={e => setClassCode(e.target.value.toUpperCase())}
              placeholder="ABC123"
              className="w-full px-4 py-4 rounded-xl bg-white/5 border border-white/10 text-white text-center text-2xl font-mono tracking-widest placeholder-purple-400/30 outline-none focus:border-cyan-500 transition uppercase"
              maxLength={6}
            />
            <div className="flex gap-3">
              <button onClick={handleCheckCode} className="flex-1 py-3 rounded-xl font-bold text-white" style={{ background: 'linear-gradient(135deg, #06b6d4, #0891b2)' }}>
                Далее →
              </button>
            </div>
          </div>
        )}

        {step === 'register' && (
          <div className="space-y-3">
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-3 text-green-300 text-xs text-center mb-2">
              ✅ Класс найден! Код: <strong>{classCode.toUpperCase()}</strong>
            </div>
            <p className="text-purple-300 text-sm text-center mb-2">Вы здесь впервые? Зарегистрируйтесь</p>
            <Input label="Фамилия" value={regForm.lastName} onChange={v => setRegForm(f => ({ ...f, lastName: v }))} placeholder="Иванов" />
            <Input label="Пароль" value={regForm.password} onChange={v => setRegForm(f => ({ ...f, password: v }))} placeholder="Придумайте пароль" type="password" />
            <Input label="ФИО родителя" value={regForm.parentFullName} onChange={v => setRegForm(f => ({ ...f, parentFullName: v }))} placeholder="Иванова Мария Петровна" />
            <Input label="Телефон родителя" value={regForm.parentPhone} onChange={v => setRegForm(f => ({ ...f, parentPhone: v }))} placeholder="+79991234567" />
            <button onClick={handleRegister} className="w-full py-3 rounded-xl font-bold text-white" style={{ background: 'linear-gradient(135deg, #06b6d4, #0891b2)' }}>
              Зарегистрироваться
            </button>
            <button onClick={() => setStep('login')} className="w-full text-center text-purple-300 hover:text-white text-sm">
              Уже есть аккаунт? Войти
            </button>
          </div>
        )}

        {step === 'login' && (
          <div className="space-y-3">
            <p className="text-purple-300 text-sm text-center">Войдите в свой аккаунт ученика</p>
            <Input label="Логин (фамилия)" value={loginForm.loginName} onChange={v => setLoginForm(f => ({ ...f, loginName: v }))} placeholder="Иванов" />
            <Input label="Пароль" value={loginForm.password} onChange={v => setLoginForm(f => ({ ...f, password: v }))} placeholder="••••••••" type="password" />
            <button onClick={handleLogin} className="w-full py-3 rounded-xl font-bold text-white" style={{ background: 'linear-gradient(135deg, #06b6d4, #0891b2)' }}>
              Войти
            </button>
            <button onClick={() => setStep('register')} className="w-full text-center text-purple-300 hover:text-white text-sm">
              Нет аккаунта? Зарегистрироваться
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Input({ label, value, onChange, placeholder, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; placeholder: string; type?: string }) {
  return (
    <div>
      <label className="text-xs text-purple-300 font-semibold mb-1 block">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-purple-400/50 outline-none focus:border-purple-500 transition"
      />
    </div>
  );
}
