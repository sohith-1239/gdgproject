
import React, { useState, useMemo } from 'react';
import { User, ExamAnalysis } from '../types';
import { analyzeExamSheet } from '../services/geminiService';

interface StudentDashboardProps {
  user: User;
  onNewAnalysis: (a: ExamAnalysis) => void;
  analyses: ExamAnalysis[]; 
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ user, onNewAnalysis, analyses }) => {
  const [file, setFile] = useState<File | null>(null);
  const [accessCodeInput, setAccessCodeInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [lastSubject, setLastSubject] = useState('');
  const [error, setError] = useState('');

  const studentHistory = useMemo(() => {
    return analyses.filter(a => a.studentId === user.id);
  }, [analyses, user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setIsSuccess(false);
      setError('');
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    
    // Validate access code
    const savedCode = localStorage.getItem('staff_access_code');
    if (!savedCode) {
      setError('No active session. Please contact staff for a valid access code.');
      return;
    }
    const parsed = JSON.parse(savedCode);
    if (parsed.code !== accessCodeInput || parsed.expiry < Date.now()) {
      setError('Invalid or expired access code. Request a new one from your teacher.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.readAsDataURL(file);
      });
      const base64 = await base64Promise;
      
      const analysis = await analyzeExamSheet(base64, file.name, user.name, user.id);
      onNewAnalysis(analysis);
      setLastSubject(analysis.subject);
      setIsSuccess(true);
      setFile(null);
      setAccessCodeInput('');
    } catch (err: any) {
      setError('Backend processing failed. Ensure your script is clear and readable.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
        <div className="md:col-span-3 bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Submission Portal</h2>
            <p className="text-sm text-slate-500">Secure AI-Segmentation Pipeline: Upload PDF/Images for automated topic filing.</p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Verification Code</label>
              <input
                type="text"
                value={accessCodeInput}
                onChange={(e) => setAccessCodeInput(e.target.value)}
                placeholder="Enter code from Staff (PRP-XXXX-XXXX)"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-sm tracking-widest"
              />
            </div>

            <div className="relative group">
              <input type="file" accept="image/*,application/pdf" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
              <div className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all ${file ? 'border-indigo-400 bg-indigo-50/30' : 'border-slate-300 bg-slate-50 hover:border-indigo-400'}`}>
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm text-slate-400 group-hover:text-indigo-600">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                </div>
                <p className="text-xs font-bold text-slate-600">{file ? file.name : "Choose Script File"}</p>
              </div>
            </div>

            {error && <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 text-xs rounded-xl font-medium">{error}</div>}

            <button
              onClick={handleUpload}
              disabled={!file || !accessCodeInput || isLoading}
              className={`w-full py-4 rounded-xl font-black text-sm transition-all ${!file || !accessCodeInput || isLoading ? 'bg-slate-200 text-slate-400' : 'bg-indigo-600 text-white shadow-lg'}`}
            >
              {isLoading ? "PROCESING SEGMENTS..." : "SUBMIT TO BACKEND"}
            </button>
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
           <div className={`h-full p-8 rounded-3xl border text-center flex flex-col items-center justify-center ${isSuccess ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'}`}>
            {isSuccess ? (
              <>
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                </div>
                <h3 className="text-lg font-black text-emerald-900 mb-1">PROCESSED</h3>
                <p className="text-xs text-emerald-700">{lastSubject} has been segmented and filed into folders.</p>
              </>
            ) : (
              <div className="text-slate-400">
                 <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 border border-slate-100"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>
                 <h3 className="text-sm font-bold">Waiting for Upload</h3>
              </div>
            )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
