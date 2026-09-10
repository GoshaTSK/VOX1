import { useState, useEffect } from 'react';
import * as store from '../store';
import { Student, Assignment, Mentor } from '../types';

interface Props {
  studentId: string;
  onLogout: () => void;
}

type Tab = 'dashboard' | 'assignments' | 'profile';

export default function StudentLobby({ studentId, onLogout }: Props) {
  const [tab, setTab] = useState<Tab>('dashboard');
  const [student, setStudent] = useState<Student | null>(null);
  const [mentor, setMentor] = useState<Mentor | null>(null);

  useEffect(() => {
    const s = store.getStudents().find(s => s.id === studentId);
    if (s) {
      setStudent(s);
      const m = store.findMentorByClassCode(s.classCode);
      if (m) setMentor(m);
    }
  }, [studentId]);

  if (!student) return <div className="min-h-screen flex items-center justify-center text-white">Загрузка...</div>;

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #0f0a2e 0%, #1a1145 50%, #0d1b3e 100%)' }}>
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">◆</span>
            <span className="text-white font-black text-lg">Voxel</span>
          </div>
          <div className="flex-1"></div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <div className="text-white text-sm font-bold">{student.lastName}</div>
              <div className="text-cyan-300 text-xs">Класс: {student.classCode}</div>
            </div>
            <div className="text-yellow-400 font-black text-sm">{student.rating > 0 ? `⭐ ${student.rating}` : ''}</div>
            <button onClick={onLogout} className="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-300 text-xs font-bold hover:bg-red-500/30 transition">
              Выйти
            </button>
          </div>
        </div>
      </header>

      {/* Class Info */}
      {mentor && (
        <div className="max-w-5xl mx-auto px-4 pt-4">
          <div className="rounded-2xl p-4 border border-cyan-500/20 flex items-center gap-4 flex-wrap" style={{ background: 'linear-gradient(135deg, rgba(6,182,212,0.1), rgba(124,58,237,0.1))' }}>
            <div className="text-3xl">👨‍🏫</div>
            <div>
              <div className="text-white font-bold">{mentor.fullName}</div>
              <div className="text-purple-300 text-xs">{mentor.position} • {mentor.organization}</div>
              <div className="text-cyan-400 text-xs">{mentor.city}</div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="max-w-5xl mx-auto px-4 pt-4">
        <div className="flex gap-2">
          {([
            { id: 'dashboard' as Tab, icon: '🏠', label: 'Главная' },
            { id: 'assignments' as Tab, icon: '📝', label: 'Задания' },
            { id: 'profile' as Tab, icon: '👤', label: 'Профиль' },
          ]).map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2.5 rounded-xl font-bold text-sm transition flex items-center gap-2 ${
                tab === t.id
                  ? 'text-white'
                  : 'text-purple-300 hover:text-white bg-white/5 hover:bg-white/10'
              }`}
              style={tab === t.id ? { background: 'linear-gradient(135deg, #06b6d4, #0891b2)' } : {}}
            >
              <span>{t.icon}</span> {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-4">
        {tab === 'dashboard' && <DashboardTab student={student} />}
        {tab === 'assignments' && <AssignmentsTab student={student} />}
        {tab === 'profile' && <ProfileTab student={student} />}
      </div>
    </div>
  );
}

function DashboardTab({ student }: { student: Student }) {
  const assignments = store.getAssignmentsForStudent(student.id, student.classCode);
  const courses = store.getCourses();
  const mentorCourses = courses.filter(c => {
    const mentor = store.getMentors().find(m => m.id === c.mentorId);
    return mentor && mentor.classCode === student.classCode;
  });

  const today = new Date().toISOString().split('T')[0];
  const todayAttendance = student.attendance.find(a => a.date === today);

  return (
    <div className="space-y-4">
      {/* Welcome */}
      <div className="rounded-2xl p-6 text-center" style={{ background: 'linear-gradient(135deg, rgba(6,182,212,0.15), rgba(124,58,237,0.15))', border: '1px solid rgba(6,182,212,0.2)' }}>
        <div className="text-5xl mb-3">🧑‍🎓</div>
        <h1 className="text-white font-black text-2xl">Привет, {student.lastName}!</h1>
        <p className="text-purple-300 text-sm mt-1">Добро пожаловать в Voxel Academy</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        {/* Stats */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-center">
          <div className="text-3xl mb-1">⭐</div>
          <div className="text-yellow-400 font-black text-2xl">{student.rating > 0 ? student.rating : '—'}</div>
          <div className="text-purple-400 text-xs font-bold">РЕЙТИНГ</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-center">
          <div className="text-3xl mb-1">📝</div>
          <div className="text-cyan-400 font-black text-2xl">{assignments.length}</div>
          <div className="text-purple-400 text-xs font-bold">ЗАДАНИЙ</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-center">
          <div className="text-3xl mb-1">📚</div>
          <div className="text-green-400 font-black text-2xl">{mentorCourses.length}</div>
          <div className="text-purple-400 text-xs font-bold">КУРСОВ</div>
        </div>
      </div>

      {/* Today Attendance */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <h3 className="text-white font-bold text-sm mb-2">📋 Сегодня</h3>
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold ${todayAttendance?.present ? 'bg-green-500/20 text-green-300' : 'bg-gray-500/20 text-gray-400'}`}>
          {todayAttendance?.present ? '✅ Вы отмечены как присутствующий' : '⏳ Посещаемость ещё не отмечена'}
        </div>
      </div>

      {/* Recent Assignments */}
      {assignments.length > 0 && (
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <h3 className="text-white font-bold text-sm mb-3">📝 Активные задания</h3>
          <div className="space-y-2">
            {assignments.slice(0, 3).map(a => (
              <div key={a.id} className="flex items-center gap-3 p-2 rounded-lg bg-white/5">
                <div className="text-xl">📝</div>
                <div className="flex-1">
                  <div className="text-white text-sm font-bold">{a.title}</div>
                  <div className="text-purple-400 text-xs">до {a.deadline}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Available Courses */}
      {mentorCourses.length > 0 && (
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <h3 className="text-white font-bold text-sm mb-3">📚 Доступные курсы</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {mentorCourses.map(c => (
              <div key={c.id} className="rounded-lg border border-white/10 bg-white/5 p-3 flex items-center gap-3">
                <div className="text-2xl">{c.icon}</div>
                <div>
                  <div className="text-white text-sm font-bold">{c.title}</div>
                  <div className="text-purple-400 text-xs">{c.level} • {c.lessons.length} уроков</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function AssignmentsTab({ student }: { student: Student }) {
  const assignments = store.getAssignmentsForStudent(student.id, student.classCode);

  return (
    <div>
      <h2 className="text-white font-black text-xl mb-4">📝 Мои задания</h2>
      {assignments.length === 0 ? (
        <div className="text-center py-16 text-purple-300">
          <div className="text-5xl mb-4">📝</div>
          <p>Пока нет заданий</p>
          <p className="text-sm mt-1">Наставник скоро назначит задания</p>
        </div>
      ) : (
        <div className="space-y-3">
          {assignments.map(a => {
            const isOverdue = new Date(a.deadline) < new Date();
            return (
              <div key={a.id} className={`rounded-xl border bg-white/5 p-4 ${isOverdue ? 'border-red-500/30' : 'border-white/10'}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-white font-bold">{a.title}</h3>
                    <p className="text-purple-300 text-xs mt-1">{a.description}</p>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300">{a.courseName}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${isOverdue ? 'bg-red-500/20 text-red-300' : 'bg-yellow-500/20 text-yellow-300'}`}>
                        ⏰ до {a.deadline} {isOverdue ? '(ПРОСРОЧЕНО)' : ''}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ProfileTab({ student }: { student: Student }) {
  const mentor = store.findMentorByClassCode(student.classCode);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="text-5xl">🧑‍🎓</div>
          <div>
            <h2 className="text-white font-black text-xl">{student.lastName}</h2>
            <div className="text-purple-300 text-sm">Логин: @{student.loginName}</div>
            <div className="text-purple-400 text-xs">В классе с {new Date(student.createdAt).toLocaleDateString('ru')}</div>
          </div>
          <div className="ml-auto text-center">
            <div className="text-yellow-400 font-black text-3xl">{student.rating > 0 ? student.rating : '—'}</div>
            <div className="text-purple-400 text-xs font-bold">РЕЙТИНГ</div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <h3 className="text-white font-bold text-sm mb-3">👨‍👩‍👦 Родители</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-purple-400 text-xs">ФИО</span>
                <span className="text-white text-xs font-bold text-right">{student.parentFullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-400 text-xs">Телефон</span>
                <span className="text-white text-xs font-bold">{student.parentPhone}</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <h3 className="text-white font-bold text-sm mb-3">📊 Успеваемость</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-purple-400 text-xs">Посещений</span>
                <span className="text-white text-xs font-bold">{student.attendance.filter(a => a.present).length} / {student.attendance.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-400 text-xs">Оценок получено</span>
                <span className="text-white text-xs font-bold">{student.grades.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-400 text-xs">Средний балл</span>
                <span className="text-yellow-400 text-xs font-bold">{student.rating > 0 ? student.rating : '—'}</span>
              </div>
            </div>
          </div>
        </div>

        {mentor && (
          <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4">
            <h3 className="text-white font-bold text-sm mb-3">👨‍🏫 Наставник</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-purple-400 text-xs">ФИО</span>
                <span className="text-white text-xs font-bold">{mentor.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-400 text-xs">Организация</span>
                <span className="text-white text-xs font-bold">{mentor.organization}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-400 text-xs">Город</span>
                <span className="text-white text-xs font-bold">{mentor.city}</span>
              </div>
            </div>
          </div>
        )}

        {/* Grades */}
        {student.grades.length > 0 && (
          <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4">
            <h3 className="text-white font-bold text-sm mb-3">⭐ Мои оценки</h3>
            <div className="space-y-2">
              {student.grades.map((g, i) => (
                <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-white/5">
                  <span className="text-yellow-400 font-black text-lg">{g.grade}</span>
                  <div className="flex-1">
                    <div className="text-white text-xs">{g.courseName}</div>
                    <div className="text-purple-400 text-[10px]">{g.date} {g.comment && `• ${g.comment}`}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
