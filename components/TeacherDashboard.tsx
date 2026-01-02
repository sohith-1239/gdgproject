
import React, { useMemo, useState, useEffect } from 'react';
import { ExamAnalysis, User, TopicResult } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Cell, Legend
} from 'recharts';

interface TeacherDashboardProps {
  user: User;
  analyses: ExamAnalysis[];
}

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ user, analyses }) => {
  const [accessCode, setAccessCode] = useState(() => {
    const saved = localStorage.getItem('staff_access_code');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.expiry > Date.now()) return parsed;
    }
    return null;
  });

  const [timeLeft, setTimeLeft] = useState('');
  const [selectedTopicFolder, setSelectedTopicFolder] = useState<string | null>(null);

  useEffect(() => {
    if (!accessCode) return;
    const tick = () => {
      const diff = accessCode.expiry - Date.now();
      if (diff <= 0) {
        setAccessCode(null);
        localStorage.removeItem('staff_access_code');
        return;
      }
      const mins = Math.floor(diff / 60000);
      setTimeLeft(`${mins}m remaining`);
    };
    tick();
    const inv = setInterval(tick, 30000);
    return () => clearInterval(inv);
  }, [accessCode]);

  const generateCode = () => {
    const code = 'PRP-' + Math.random().toString(36).substring(2, 6).toUpperCase() + '-' + Math.floor(1000 + Math.random() * 9000);
    const state = { code, expiry: Date.now() + 60 * 60 * 1000 };
    setAccessCode(state);
    localStorage.setItem('staff_access_code', JSON.stringify(state));
  };

  const subjects = useMemo(() => Array.from(new Set(analyses.map(a => a.subject))), [analyses]);
  const [selectedSubject, setSelectedSubject] = useState(subjects[0] || '');

  const filteredAnalyses = useMemo(() => 
    analyses.filter(a => a.subject === selectedSubject), 
    [analyses, selectedSubject]
  );

  const stats = useMemo(() => {
    if (filteredAnalyses.length === 0) return null;
    const bins = [
      { range: '0-20%', count: 0 }, { range: '21-40%', count: 0 },
      { range: '41-60%', count: 0 }, { range: '61-80%', count: 0 },
      { range: '81-100%', count: 0 }
    ];
    const topicAgg: Record<string, { total: number; count: number; mastered: number }> = {};

    filteredAnalyses.forEach(a => {
      const idx = Math.min(Math.floor(a.overallScore / 20), 4);
      bins[idx].count++;
      a.topics.forEach(t => {
        if (!topicAgg[t.topic]) topicAgg[t.topic] = { total: 0, count: 0, mastered: 0 };
        topicAgg[t.topic].total += (t.score / t.maxScore) * 100;
        topicAgg[t.topic].count++;
        if (t.score / t.maxScore >= 0.8) topicAgg[t.topic].mastered++;
      });
    });

    const topicStats = Object.entries(topicAgg).map(([name, d]) => ({
      name,
      average: Math.round(d.total / d.count),
      masteryCount: d.mastered
    }));

    return { bins, topicStats, avg: Math.round(filteredAnalyses.reduce((s, a) => s + a.overallScore, 0) / filteredAnalyses.length) };
  }, [filteredAnalyses]);

  return (
    <div className="space-y-8 pb-20">
      {/* 1. Staff Header */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-8 items-center justify-between">
        <div className="flex gap-6 items-center">
          <div className="w-20 h-20 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-100">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900">{user.name}</h2>
            <div className="flex gap-4 mt-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Dept: Engineering & Analysis</span>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Section: A, B, C</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl w-full md:w-80">
          <div className="flex justify-between items-center mb-3">
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Access Code</span>
             {accessCode && <span className="text-[10px] font-bold text-rose-500">{timeLeft}</span>}
          </div>
          {accessCode ? (
            <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-indigo-100">
              <span className="font-mono font-black text-xl text-indigo-600">{accessCode.code}</span>
              <button onClick={generateCode} className="text-[10px] text-slate-400 hover:text-indigo-600 font-bold">New</button>
            </div>
          ) : (
            <button onClick={generateCode} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm">Generate Code</button>
          )}
        </div>
      </div>

      {/* 2. Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Subject Average</p>
          <div className="text-3xl font-black text-indigo-600">{stats?.avg || 0}%</div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Scripts</p>
          <div className="text-3xl font-black text-slate-900">{filteredAnalyses.length}</div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Mastery Rate</p>
          <div className="text-3xl font-black text-emerald-500">
            {Math.round((stats?.bins[4].count || 0) / (filteredAnalyses.length || 1) * 100)}%
          </div>
        </div>
      </div>

      {/* 3. Subject Navigation */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 flex items-center gap-4 overflow-x-auto">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Subject Filters</span>
        {subjects.map(s => (
          <button
            key={s}
            onClick={() => setSelectedSubject(s)}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${selectedSubject === s ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-50 text-slate-400'}`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* 4. Analytics Histograms */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 h-[450px]">
          <h3 className="text-lg font-bold text-slate-900 mb-2">Score Distribution Histogram</h3>
          <p className="text-sm text-slate-500 mb-8">Number of students vs performance brackets.</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.bins}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="range" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} />
                <YAxis axisLine={false} tickLine={false} allowDecimals={false} tick={{ fontSize: 10 }} />
                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-200">
          <h3 className="text-lg font-bold text-slate-900 mb-2">Topic Mastery Overview</h3>
          <p className="text-sm text-slate-500 mb-6">Average understanding scores across all segmented units.</p>
          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
            {stats?.topicStats.map(t => (
              <div key={t.name} className="flex items-center gap-4">
                <span className="text-xs font-bold text-slate-600 w-32 truncate">{t.name}</span>
                <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${t.average}%` }} />
                </div>
                <span className="text-xs font-black text-indigo-600 w-8 text-right">{t.average}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. Topic Folder Explorer (Simulated Filesystem) */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Topic Storage Explorer</h3>
            <p className="text-sm text-slate-500 italic">Segmented answer data stored in topic-indexed subfolders.</p>
          </div>
          <div className="flex gap-2">
            {stats?.topicStats.map(t => (
              <button 
                key={t.name} 
                onClick={() => setSelectedTopicFolder(t.name)}
                className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase transition-all ${selectedTopicFolder === t.name ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-500'}`}
              >
                / {t.name}
              </button>
            ))}
          </div>
        </div>
        
        <div className="min-h-[300px] bg-slate-50/50 p-6">
          {!selectedTopicFolder ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              <p className="text-sm font-bold">Select a topic folder to browse student segments</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAnalyses.map(a => {
                const topicData = a.topics.find(t => t.topic === selectedTopicFolder);
                if (!topicData) return null;
                return (
                  <div key={a.studentId} className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Student ID</p>
                        <h4 className="font-mono text-sm font-bold text-indigo-600">{a.studentId}</h4>
                      </div>
                      <div className="px-2 py-1 bg-indigo-50 rounded text-indigo-600 text-[10px] font-black">{topicData.score}/10</div>
                    </div>
                    <div className="space-y-3">
                      {topicData.segments.map((seg, i) => (
                        <div key={i} className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                          <p className="text-[10px] font-bold text-slate-400 mb-1">Q: {seg.questionText || "Question Content"}</p>
                          <p className="text-xs text-slate-700 line-clamp-2">A: {seg.studentAnswer}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
