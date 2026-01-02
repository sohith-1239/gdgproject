
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import StudentDashboard from './components/StudentDashboard';
import TeacherDashboard from './components/TeacherDashboard';
import Header from './components/Header';
import { User, UserRole, ExamAnalysis } from './types';

const MOCK_DATA: ExamAnalysis[] = [
  {
    subject: "Probability and Statistics",
    studentName: "Alex Johnson",
    studentId: "STU-1024",
    examDate: "2024-05-15",
    overallScore: 85,
    topics: [
      // Fix: Added missing segments array to satisfy TopicResult interface
      { topic: "Mean, Median, Mode", score: 9.5, maxScore: 10, feedback: "Perfect calculation of central tendencies.", segments: [] },
      // Fix: Added missing segments array to satisfy TopicResult interface
      { topic: "Measures of Variability", score: 7, maxScore: 10, feedback: "Standard deviation formula was used incorrectly in Q3.", segments: [] },
      // Fix: Added missing segments array to satisfy TopicResult interface
      { topic: "Probability Distributions", score: 9, maxScore: 10, feedback: "Excellent grasp of binomial theory.", segments: [] }
    ]
  },
  {
    subject: "Probability and Statistics",
    studentName: "Maria Garcia",
    studentId: "STU-1025",
    examDate: "2024-05-15",
    overallScore: 72,
    topics: [
      // Fix: Added missing segments array to satisfy TopicResult interface
      { topic: "Mean, Median, Mode", score: 6, maxScore: 10, feedback: "Struggled with weighted means.", segments: [] },
      // Fix: Added missing segments array to satisfy TopicResult interface
      { topic: "Measures of Variability", score: 8.5, maxScore: 10, feedback: "Strong understanding of variance.", segments: [] },
      // Fix: Added missing segments array to satisfy TopicResult interface
      { topic: "Probability Distributions", score: 7, maxScore: 10, feedback: "Needs more practice with Poisson distribution.", segments: [] }
    ]
  },
  {
    subject: "Applied Calculus",
    studentName: "Alex Johnson",
    studentId: "STU-1024",
    examDate: "2024-05-10",
    overallScore: 92,
    topics: [
      // Fix: Added missing segments array to satisfy TopicResult interface
      { topic: "Derivatives", score: 10, maxScore: 10, feedback: "Flawless chain rule application.", segments: [] },
      // Fix: Added missing segments array to satisfy TopicResult interface
      { topic: "Integration Techniques", score: 8.5, maxScore: 10, feedback: "Minor error in constant of integration.", segments: [] }
    ]
  }
];

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [analyses, setAnalyses] = useState<ExamAnalysis[]>(() => {
    const saved = localStorage.getItem('exam_analyses');
    return saved ? JSON.parse(saved) : MOCK_DATA;
  });

  useEffect(() => {
    localStorage.setItem('exam_analyses', JSON.stringify(analyses));
  }, [analyses]);

  const handleLogin = (u: User) => setUser(u);
  const handleLogout = () => setUser(null);

  const addAnalysis = (a: ExamAnalysis) => {
    setAnalyses(prev => {
      // Logic: If same student submits for the same subject, replace the existing one
      const existingIndex = prev.findIndex(item => 
        item.studentId === a.studentId && item.subject === a.subject
      );

      if (existingIndex !== -1) {
        const updated = [...prev];
        updated[existingIndex] = a;
        return updated;
      }
      return [a, ...prev];
    });
  };

  return (
    <HashRouter>
      <div className="min-h-screen bg-slate-50">
        {user && <Header user={user} onLogout={handleLogout} />}
        <main className="max-w-7xl mx-auto px-4 py-8">
          <Routes>
            <Route 
              path="/" 
              element={
                user ? (
                  user.role === UserRole.STUDENT ? 
                  <Navigate to="/student" /> : 
                  <Navigate to="/teacher" />
                ) : (
                  <LoginPage onLogin={handleLogin} />
                )
              } 
            />
            <Route 
              path="/student" 
              element={
                user?.role === UserRole.STUDENT ? 
                <StudentDashboard user={user} onNewAnalysis={addAnalysis} analyses={analyses} /> : 
                <Navigate to="/" />
              } 
            />
            <Route 
              path="/teacher" 
              element={
                user?.role === UserRole.TEACHER ? 
                <TeacherDashboard user={user} analyses={analyses} /> : 
                <Navigate to="/" />
              } 
            />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
};

export default App;
