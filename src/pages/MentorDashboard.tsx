import { useState, useEffect } from 'react';
import * as store from '../store';
import { Mentor, Student, Course, Assignment, Lesson } from '../types';

interface Props {
  mentorId: string;
  onLogout: () => void;
}

type Tab = 'courses' | 'assignments' | 'groups';

export default function MentorDashboard({ mentorId, onLogout }: Props) {
  const [tab, setTab] = useState<Tab>('courses');
  const [mentor, setMentor] = useState<Mentor | null>(null);
  const [codeCopied, setCodeCopied] = useState(false);

  useEffect(() => {
    const m = store.getMentors().find(m => m.id === mentorId);
    if (m) setMentor(m);
  }, [mentorId]);

  if (!mentor) return <div className="min-h-screen flex items-center justify-center text-white">Загрузка...</div>;

  const copyCode = () => {
    navigator.clipboard.writeText(mentor.classCode).catch(() => {});
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #0f0a2e 0%, #1a1145 50%, #0d1b3e 100%)' }}>
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">◆</span>
            <span className="text-white font-black text-lg">Voxel</span>
            <span className="text-purple-400 text-xs font-bold ml-1">MENTOR</span>
          </div>
          <div className="flex-1"></div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <div className="text-white text-sm font-bold">{mentor.fullName}</div>
              <div className="text-purple-300 text-xs">{mentor.organization}</div>
            </div>
            <button onClick={onLogout} className="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-300 text-xs font-bold hover:bg-red-500/30 transition">
              Выйти
            </button>
          </div>
        </div>
      </header>

      {/* Class Code Banner */}
      <div className="max-w-7xl mx-auto px-4 pt-4">
        <div className="rounded-2xl p-4 border border-cyan-500/20 flex items-center gap-4 flex-wrap" style={{ background: 'linear-gradient(135deg, rgba(6,182,212,0.1), rgba(124,58,237,0.1))' }}>
          <div className="text-3xl">🏫</div>
          <div className="flex-1">
            <div className="text-cyan-300 text-xs font-bold">КОД ВАШЕГО КЛАССА</div>
            <div className="text-white text-2xl font-mono font-black tracking-widest">{mentor.classCode}</div>
            <div className="text-purple-300 text-xs">Передайте этот код ученикам для присоединения</div>
          </div>
          <button onClick={copyCode} className="px-4 py-2 rounded-xl font-bold text-sm transition" style={{ background: codeCopied ? '#10b981' : 'linear-gradient(135deg, #06b6d4, #0891b2)', color: 'white' }}>
            {codeCopied ? '✅ Скопировано!' : '📋 Копировать'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 pt-4">
        <div className="flex gap-2">
          {([
            { id: 'courses' as Tab, icon: '📚', label: 'Курсы' },
            { id: 'assignments' as Tab, icon: '📝', label: 'Задания' },
            { id: 'groups' as Tab, icon: '👥', label: 'Группы' },
          ]).map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2.5 rounded-xl font-bold text-sm transition flex items-center gap-2 ${
                tab === t.id
                  ? 'text-white'
                  : 'text-purple-300 hover:text-white bg-white/5 hover:bg-white/10'
              }`}
              style={tab === t.id ? { background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' } : {}}
            >
              <span>{t.icon}</span> {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        {tab === 'courses' && <CoursesTab mentorId={mentorId} />}
        {tab === 'assignments' && <AssignmentsTab mentorId={mentorId} />}
        {tab === 'groups' && <GroupsTab mentor={mentor} />}
      </div>
    </div>
  );
}

// ===== COURSES TAB =====
function CoursesTab({ mentorId }: { mentorId: string }) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [editing, setEditing] = useState<Course | null>(null);
  const [isNew, setIsNew] = useState(false);

  useEffect(() => { setCourses(store.getCoursesByMentor(mentorId)); }, [mentorId]);

  const handleDelete = (id: string) => {
    if (confirm('Удалить курс?')) {
      store.deleteCourse(id);
      setCourses(store.getCoursesByMentor(mentorId));
    }
  };

  const handleSave = (course: Course) => {
    store.saveCourse(course);
    setCourses(store.getCoursesByMentor(mentorId));
    setEditing(null);
    setIsNew(false);
  };

  const handleNew = () => {
    const newCourse: Course = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2),
      mentorId,
      title: '',
      description: '',
      icon: '📖',
      category: 'programming',
      level: 'Начинающий',
      duration: '4 недели',
      color: '#7c3aed',
      lessons: [],
      createdAt: new Date().toISOString(),
    };
    setEditing(newCourse);
    setIsNew(true);
  };

  if (editing) {
    return <CourseEditor course={editing} isNew={isNew} onSave={handleSave} onCancel={() => { setEditing(null); setIsNew(false); }} />;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white font-black text-xl">📚 Мои курсы</h2>
        <button onClick={handleNew} className="px-4 py-2 rounded-xl font-bold text-sm text-white" style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}>
          ➕ Новый курс
        </button>
      </div>
      {courses.length === 0 ? (
        <div className="text-center py-16 text-purple-300">
          <div className="text-5xl mb-4">📚</div>
          <p>Пока нет курсов. Создайте первый!</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map(c => (
            <div key={c.id} className="rounded-2xl border border-white/10 overflow-hidden bg-white/5">
              <div className="h-24 flex items-center justify-center text-5xl" style={{ background: `linear-gradient(135deg, ${c.color}40, ${c.color}20)` }}>
                {c.icon}
              </div>
              <div className="p-4">
                <h3 className="text-white font-bold">{c.title}</h3>
                <p className="text-purple-300 text-xs mt-1 line-clamp-2">{c.description}</p>
                <div className="flex gap-2 mt-3 flex-wrap">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300">{c.level}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300">{c.lessons.length} уроков</span>
                </div>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => setEditing(c)} className="flex-1 py-1.5 rounded-lg bg-white/5 text-white text-xs font-bold hover:bg-white/10 transition">✏️ Редактировать</button>
                  <button onClick={() => handleDelete(c.id)} className="py-1.5 px-3 rounded-lg bg-red-500/20 text-red-300 text-xs font-bold hover:bg-red-500/30 transition">🗑️</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CourseEditor({ course, isNew, onSave, onCancel }: { course: Course; isNew: boolean; onSave: (c: Course) => void; onCancel: () => void }) {
  const [form, setForm] = useState(course);
  const colors = ['#7c3aed', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6'];

  const update = <K extends keyof Course>(key: K, val: Course[K]) => setForm(f => ({ ...f, [key]: val }));

  const addLesson = () => {
    const lesson: Lesson = {
      id: Date.now().toString(36),
      title: '',
      content: '',
      order: form.lessons.length + 1,
    };
    update('lessons', [...form.lessons, lesson]);
  };

  const updateLesson = (id: string, field: keyof Lesson, val: string) => {
    update('lessons', form.lessons.map(l => l.id === id ? { ...l, [field]: val } : l));
  };

  const removeLesson = (id: string) => {
    update('lessons', form.lessons.filter(l => l.id !== id));
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <button onClick={onCancel} className="text-purple-300 hover:text-white text-sm">← Назад</button>
        <h2 className="text-white font-black text-xl">{isNew ? '➕ Новый курс' : '✏️ Редактирование'}</h2>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-purple-300 font-semibold mb-1 block">Название</label>
            <input value={form.title} onChange={e => update('title', e.target.value)} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white outline-none focus:border-purple-500" placeholder="Введение в Python" />
          </div>
          <div>
            <label className="text-xs text-purple-300 font-semibold mb-1 block">Иконка</label>
            <input value={form.icon} onChange={e => update('icon', e.target.value)} maxLength={3} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-center text-xl outline-none focus:border-purple-500" />
          </div>
        </div>
        <div>
          <label className="text-xs text-purple-300 font-semibold mb-1 block">Описание</label>
          <textarea value={form.description} onChange={e => update('description', e.target.value)} rows={3} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white outline-none focus:border-purple-500 resize-none" placeholder="Описание курса..." />
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className="text-xs text-purple-300 font-semibold mb-1 block">Уровень</label>
            <select value={form.level} onChange={e => update('level', e.target.value)} className="w-full px-3 py-2 rounded-lg bg-[#1a1145] border border-white/10 text-white outline-none">
              <option>Начинающий</option><option>Средний</option><option>Продвинутый</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-purple-300 font-semibold mb-1 block">Длительность</label>
            <input value={form.duration} onChange={e => update('duration', e.target.value)} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white outline-none focus:border-purple-500" placeholder="4 недели" />
          </div>
          <div>
            <label className="text-xs text-purple-300 font-semibold mb-1 block">Цвет</label>
            <div className="flex gap-2">
              {colors.map(c => (
                <button key={c} onClick={() => update('color', c)} className={`w-8 h-8 rounded-full border-2 transition ${form.color === c ? 'border-white scale-110' : 'border-transparent'}`} style={{ background: c }} />
              ))}
            </div>
          </div>
        </div>

        {/* Lessons */}
        <div className="border-t border-white/10 pt-4 mt-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white font-bold">📖 Уроки ({form.lessons.length})</h3>
            <button onClick={addLesson} className="px-3 py-1.5 rounded-lg bg-white/5 text-white text-xs font-bold hover:bg-white/10">➕ Добавить</button>
          </div>
          {form.lessons.map((lesson, idx) => (
            <div key={lesson.id} className="rounded-xl border border-white/10 bg-white/5 p-3 mb-2">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-purple-400 text-xs font-bold w-6">#{idx + 1}</span>
                <input value={lesson.title} onChange={e => updateLesson(lesson.id, 'title', e.target.value)} className="flex-1 px-2 py-1 rounded bg-white/5 border border-white/10 text-white text-sm outline-none" placeholder="Название урока" />
                <button onClick={() => removeLesson(lesson.id)} className="text-red-400 hover:text-red-300 text-sm">✕</button>
              </div>
              <textarea value={lesson.content} onChange={e => updateLesson(lesson.id, 'content', e.target.value)} rows={2} className="w-full px-2 py-1 rounded bg-white/5 border border-white/10 text-white text-xs outline-none resize-none" placeholder="Содержание урока..." />
            </div>
          ))}
        </div>

        <div className="flex gap-3 pt-2">
          <button onClick={() => onSave(form)} className="flex-1 py-3 rounded-xl font-bold text-white" style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}>
            💾 Сохранить
          </button>
          <button onClick={onCancel} className="px-6 py-3 rounded-xl font-bold text-purple-300 bg-white/5 hover:bg-white/10 transition">
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
}

// ===== ASSIGNMENTS TAB =====
function AssignmentsTab({ mentorId }: { mentorId: string }) {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [creating, setCreating] = useState(false);
  const courses = store.getCoursesByMentor(mentorId);
  const students = store.getStudents().filter(s => {
    const mentor = store.getMentors().find(m => m.id === mentorId);
    return mentor && s.classCode === mentor.classCode;
  });

  useEffect(() => { setAssignments(store.getAssignmentsByMentor(mentorId)); }, [mentorId]);

  const handleDelete = (id: string) => {
    if (confirm('Удалить задание?')) {
      store.deleteAssignment(id);
      setAssignments(store.getAssignmentsByMentor(mentorId));
    }
  };

  const handleCreate = (assignment: Assignment) => {
    store.saveAssignment(assignment);
    setAssignments(store.getAssignmentsByMentor(mentorId));
    setCreating(false);
  };

  if (creating) {
    return <AssignmentCreator mentorId={mentorId} courses={courses} students={students} onSave={handleCreate} onCancel={() => setCreating(false)} />;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white font-black text-xl">📝 Задания</h2>
        <button onClick={() => setCreating(true)} className="px-4 py-2 rounded-xl font-bold text-sm text-white" style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}>
          ➕ Новое задание
        </button>
      </div>
      {assignments.length === 0 ? (
        <div className="text-center py-16 text-purple-300">
          <div className="text-5xl mb-4">📝</div>
          <p>Пока нет заданий. Создайте первое!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {assignments.map(a => (
            <div key={a.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-white font-bold">{a.title}</h3>
                  <p className="text-purple-300 text-xs mt-1">{a.description}</p>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300">{a.courseName}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300">
                      {a.targetType === 'group' ? '👥 Вся группа' : `👤 ${a.targetIds.length} ученик(ов)`}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-300">⏰ до {a.deadline}</span>
                  </div>
                </div>
                <button onClick={() => handleDelete(a.id)} className="text-red-400 hover:text-red-300 text-sm">🗑️</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AssignmentCreator({ mentorId, courses, students, onSave, onCancel }: {
  mentorId: string; courses: Course[]; students: Student[]; onSave: (a: Assignment) => void; onCancel: () => void;
}) {
  const [form, setForm] = useState({
    title: '', description: '', courseName: '', deadline: '', targetType: 'group' as 'student' | 'group', targetIds: [] as string[],
  });

  const toggleStudent = (id: string) => {
    setForm(f => ({
      ...f,
      targetIds: f.targetIds.includes(id) ? f.targetIds.filter(i => i !== id) : [...f.targetIds, id],
    }));
  };

  const handleSave = () => {
    if (!form.title || !form.deadline) { alert('Заполните название и дедлайн'); return; }
    const assignment: Assignment = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2),
      mentorId,
      title: form.title,
      description: form.description,
      courseName: form.courseName,
      targetIds: form.targetType === 'group' ? [] : form.targetIds,
      targetType: form.targetType,
      deadline: form.deadline,
      createdAt: new Date().toISOString(),
      submissions: [],
    };
    onSave(assignment);
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <button onClick={onCancel} className="text-purple-300 hover:text-white text-sm">← Назад</button>
        <h2 className="text-white font-black text-xl">➕ Новое задание</h2>
      </div>
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4">
        <div>
          <label className="text-xs text-purple-300 font-semibold mb-1 block">Название</label>
          <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white outline-none focus:border-purple-500" placeholder="Домашнее задание №1" />
        </div>
        <div>
          <label className="text-xs text-purple-300 font-semibold mb-1 block">Описание</label>
          <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white outline-none focus:border-purple-500 resize-none" placeholder="Что нужно сделать..." />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-purple-300 font-semibold mb-1 block">Курс</label>
            <select value={form.courseName} onChange={e => setForm(f => ({ ...f, courseName: e.target.value }))} className="w-full px-3 py-2 rounded-lg bg-[#1a1145] border border-white/10 text-white outline-none">
              <option value="">Выберите курс</option>
              {courses.map(c => <option key={c.id} value={c.title}>{c.icon} {c.title}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-purple-300 font-semibold mb-1 block">Дедлайн</label>
            <input type="date" value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white outline-none focus:border-purple-500" />
          </div>
        </div>
        <div>
          <label className="text-xs text-purple-300 font-semibold mb-2 block">Назначить</label>
          <div className="flex gap-2 mb-3">
            <button onClick={() => setForm(f => ({ ...f, targetType: 'group', targetIds: [] }))} className={`px-4 py-2 rounded-lg text-sm font-bold transition ${form.targetType === 'group' ? 'text-white' : 'text-purple-300 bg-white/5'}`} style={form.targetType === 'group' ? { background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' } : {}}>
              👥 Всей группе
            </button>
            <button onClick={() => setForm(f => ({ ...f, targetType: 'student' }))} className={`px-4 py-2 rounded-lg text-sm font-bold transition ${form.targetType === 'student' ? 'text-white' : 'text-purple-300 bg-white/5'}`} style={form.targetType === 'student' ? { background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' } : {}}>
              👤 Конкретным ученикам
            </button>
          </div>
          {form.targetType === 'student' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto">
              {students.length === 0 ? (
                <p className="text-purple-400 text-xs col-span-full">Нет учеников в классе</p>
              ) : students.map(s => (
                <button key={s.id} onClick={() => toggleStudent(s.id)} className={`px-3 py-2 rounded-lg text-xs font-bold transition text-left ${form.targetIds.includes(s.id) ? 'bg-purple-500/30 text-white border border-purple-500/50' : 'bg-white/5 text-purple-300 border border-white/10 hover:bg-white/10'}`}>
                  {form.targetIds.includes(s.id) ? '✅ ' : ''}{s.lastName}
                </button>
              ))}
            </div>
          )}
        </div>
        <button onClick={handleSave} className="w-full py-3 rounded-xl font-bold text-white" style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}>
          📤 Отправить задание
        </button>
      </div>
    </div>
  );
}

// ===== GROUPS TAB =====
function GroupsTab({ mentor }: { mentor: Mentor }) {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    setStudents(store.getStudentsByClass(mentor.classCode));
  }, [mentor.classCode]);

  const refreshStudents = () => setStudents(store.getStudentsByClass(mentor.classCode));

  const toggleAttendance = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;
    const existing = student.attendance.find(a => a.date === today);
    store.markAttendance(studentId, today, existing ? !existing.present : true);
    refreshStudents();
  };

  const giveGrade = (studentId: string) => {
    const gradeStr = prompt('Оценка (1-5):');
    if (!gradeStr) return;
    const grade = parseInt(gradeStr);
    if (grade < 1 || grade > 5) { alert('Оценка от 1 до 5'); return; }
    const comment = prompt('Комментарий (необязательно):') || undefined;
    const student = students.find(s => s.id === studentId);
    if (!student) return;
    store.addGrade(studentId, 'Общий', grade, comment);
    refreshStudents();
  };

  if (selectedStudent) {
    return <StudentProfile student={selectedStudent} goBack={() => setSelectedStudent(null)} />;
  }

  return (
    <div>
      <h2 className="text-white font-black text-xl mb-4">👥 Группа — {mentor.classCode}</h2>
      {students.length === 0 ? (
        <div className="text-center py-16 text-purple-300">
          <div className="text-5xl mb-4">👥</div>
          <p>Пока никто не присоединился к классу</p>
          <p className="text-sm mt-2">Передайте код <strong className="text-cyan-300">{mentor.classCode}</strong> ученикам</p>
        </div>
      ) : (
        <>
          {/* Attendance Table */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-bold text-sm">📋 Посещаемость на сегодня ({today})</h3>
            </div>
            <div className="space-y-2">
              {students.map(s => {
                const todayRecord = s.attendance.find(a => a.date === today);
                return (
                  <div key={s.id} className="flex items-center gap-3 p-2 rounded-lg bg-white/5">
                    <div className="text-2xl">🧑‍🎓</div>
                    <div className="flex-1">
                      <div className="text-white text-sm font-bold">{s.lastName}</div>
                      <div className="text-purple-400 text-xs">@{s.loginName}</div>
                    </div>
                    <div className={`text-xs font-bold px-2 py-1 rounded ${todayRecord?.present ? 'bg-green-500/20 text-green-300' : todayRecord ? 'bg-red-500/20 text-red-300' : 'bg-gray-500/20 text-gray-400'}`}>
                      {todayRecord?.present ? '✅ Здесь' : todayRecord ? '❌ Отсутствует' : '—'}
                    </div>
                    <button onClick={() => toggleAttendance(s.id)} className="px-2 py-1 rounded bg-white/5 text-white text-xs hover:bg-white/10">
                      {todayRecord?.present ? '✕' : '✓'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Students Grid */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {students.map(s => (
              <div key={s.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="text-3xl">🧑‍🎓</div>
                  <div>
                    <div className="text-white font-bold">{s.lastName}</div>
                    <div className="text-purple-400 text-xs">@{s.loginName}</div>
                  </div>
                  <div className="ml-auto text-right">
                    <div className="text-yellow-400 font-black text-lg">{s.rating > 0 ? s.rating : '—'}</div>
                    <div className="text-purple-400 text-[10px]">рейтинг</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setSelectedStudent(s)} className="flex-1 py-1.5 rounded-lg bg-white/5 text-white text-xs font-bold hover:bg-white/10 transition">👁 Профиль</button>
                  <button onClick={() => giveGrade(s.id)} className="py-1.5 px-3 rounded-lg bg-yellow-500/20 text-yellow-300 text-xs font-bold hover:bg-yellow-500/30">⭐</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function StudentProfile({ student, goBack }: { student: Student; goBack: () => void }) {
  const freshStudent = store.getStudents().find(s => s.id === student.id) || student;

  return (
    <div>
      <button onClick={goBack} className="text-purple-300 hover:text-white text-sm mb-4">← К группе</button>
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="text-5xl">🧑‍🎓</div>
          <div>
            <h2 className="text-white font-black text-xl">{freshStudent.lastName}</h2>
            <div className="text-purple-300 text-sm">@{freshStudent.loginName}</div>
            <div className="text-purple-400 text-xs">В классе с {new Date(freshStudent.createdAt).toLocaleDateString('ru')}</div>
          </div>
          <div className="ml-auto text-center">
            <div className="text-yellow-400 font-black text-3xl">{freshStudent.rating > 0 ? freshStudent.rating : '—'}</div>
            <div className="text-purple-400 text-xs font-bold">РЕЙТИНГ</div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {/* Parent Info */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <h3 className="text-white font-bold text-sm mb-3">👨‍👩‍👦 Информация о родителях</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-purple-400 text-xs">ФИО родителя</span>
                <span className="text-white text-xs font-bold">{freshStudent.parentFullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-400 text-xs">Телефон</span>
                <span className="text-white text-xs font-bold">{freshStudent.parentPhone}</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <h3 className="text-white font-bold text-sm mb-3">📊 Статистика</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-purple-400 text-xs">Посещений</span>
                <span className="text-white text-xs font-bold">{freshStudent.attendance.filter(a => a.present).length} / {freshStudent.attendance.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-400 text-xs">Оценок</span>
                <span className="text-white text-xs font-bold">{freshStudent.grades.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-400 text-xs">Средний балл</span>
                <span className="text-yellow-400 text-xs font-bold">{freshStudent.rating > 0 ? freshStudent.rating : '—'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Grades */}
        {freshStudent.grades.length > 0 && (
          <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4">
            <h3 className="text-white font-bold text-sm mb-3">⭐ Оценки</h3>
            <div className="space-y-2">
              {freshStudent.grades.map((g, i) => (
                <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-white/5">
                  <span className="text-yellow-400 font-black">{g.grade}</span>
                  <div className="flex-1">
                    <div className="text-white text-xs">{g.courseName}</div>
                    <div className="text-purple-400 text-[10px]">{g.date} {g.comment && `• ${g.comment}`}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Attendance History */}
        {freshStudent.attendance.length > 0 && (
          <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4">
            <h3 className="text-white font-bold text-sm mb-3">📋 История посещений</h3>
            <div className="flex flex-wrap gap-2">
              {freshStudent.attendance.slice(-14).map((a, i) => (
                <div key={i} className={`px-2 py-1 rounded text-[10px] font-bold ${a.present ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                  {a.date.slice(5)} {a.present ? '✓' : '✕'}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
