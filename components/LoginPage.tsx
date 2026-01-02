
import React, { useState } from 'react';
import { User, UserRole } from '../types';

interface LoginPageProps {
  onLogin: (user: User) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [role, setRole] = useState<UserRole>(UserRole.STUDENT);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please enter your registration number');
      return;
    }

    if (role === UserRole.STUDENT) {
      if (!code.trim()) {
        setError('Please enter the access code provided by staff');
        return;
      }
    } else {
      if (!password.trim()) {
        setError('Please enter your staff password');
        return;
      }
    }

    onLogin({
      id: role === UserRole.STUDENT ? (name.includes('STU') ? name : `STU-${name}`) : Math.random().toString(36).substr(2, 9),
      name: name,
      role: role,
      accessCode: role === UserRole.STUDENT ? code : undefined
    });
  };

  const loginAsDemoStaff = () => {
    onLogin({
      id: 'demo-staff-123',
      name: 'Professor Henderson',
      role: UserRole.TEACHER,
    });
  };

  const loginAsDemoStudent = () => {
    onLogin({
      id: 'STU-1024', // Matches Alex Johnson in mock data
      name: 'STU-1024',
      role: UserRole.STUDENT,
      accessCode: 'DEMO2025'
    });
  };

  return (
    <div className="max-w-md mx-auto mt-12 bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
      <div className="p-8">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-50 rounded-2xl mb-4">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
             </svg>
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Welcome Back</h2>
          <p className="text-slate-500">Intelligent performance analysis at your fingertips.</p>
        </div>

        <div className="flex p-1 bg-slate-100 rounded-xl mb-8">
          <button
            onClick={() => {
              setRole(UserRole.STUDENT);
              setError('');
            }}
            className={`flex-1 py-3 text-sm font-semibold rounded-lg transition-all ${
              role === UserRole.STUDENT ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Student
          </button>
          <button
            onClick={() => {
              setRole(UserRole.TEACHER);
              setError('');
            }}
            className={`flex-1 py-3 text-sm font-semibold rounded-lg transition-all ${
              role === UserRole.TEACHER ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Staff
          </button>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              {role === UserRole.STUDENT ? 'Registration Number' : 'Staff Name'}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder:text-slate-300"
              placeholder={role === UserRole.STUDENT ? 'e.g. Regd. No' : 'e.g. Prof. Name'}
            />
          </div>

          {role === UserRole.STUDENT ? (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Access Code</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder:text-slate-300"
                placeholder="Enter code from staff"
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Staff Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder:text-slate-300"
                placeholder="Enter your password"
              />
            </div>
          )}

          {error && <p className="text-sm text-rose-500 font-medium">{error}</p>}

          <div className="space-y-3 pt-2">
            <button
              type="submit"
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transform transition-all active:scale-[0.98]"
            >
              Login as {role === UserRole.STUDENT ? 'Student' : 'Staff Member'}
            </button>
            
            <button
              type="button"
              onClick={role === UserRole.STUDENT ? loginAsDemoStudent : loginAsDemoStaff}
              className="w-full py-3 bg-white border border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
            >
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
              Login with Demo {role === UserRole.STUDENT ? 'Student' : 'Staff'} Account
            </button>
          </div>
        </form>
      </div>
      
      <div className="bg-slate-50 p-6 text-center border-t border-slate-100">
        <p className="text-xs text-slate-400">
          Secure, AI-powered academic verification system.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
