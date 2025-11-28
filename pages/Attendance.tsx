import React, { useState, useEffect, useRef } from 'react';
import { Camera, CheckCircle, Clock, StopCircle, List, QrCode, AlertTriangle } from 'lucide-react';
import { storage } from '../services/storage';
import { AttendanceStatus, Student, UserRole } from '../types';

declare global {
  interface Window {
    Html5QrcodeScanner: any;
    Html5Qrcode: any;
  }
}

const Attendance: React.FC = () => {
  const [mode, setMode] = useState<'scan' | 'list'>('scan');
  const [lastScanned, setLastScanned] = useState<{student: Student, status: AttendanceStatus, time: string} | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [manualId, setManualId] = useState('');
  
  // List Mode State
  const [selectedGrade, setSelectedGrade] = useState<string>('');
  const [studentsList, setStudentsList] = useState<Student[]>([]);
  const [attendanceState, setAttendanceState] = useState<Record<string, AttendanceStatus>>({});
  
  const scannerRef = useRef<any>(null);
  const user = storage.getCurrentUser();

  useEffect(() => {
    // Set default grade for teachers explicitly when user data is available
    if (user?.role === UserRole.TEACHER && user.gradeAssigned) {
        setSelectedGrade(user.gradeAssigned);
    }
    
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch((err: any) => console.error("Failed to clear scanner", err));
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, user?.gradeAssigned]); // Fix: Use primitives to prevent infinite loop

  useEffect(() => {
    if (selectedGrade) {
        const allStudents = storage.getStudents();
        const filtered = allStudents.filter(s => s.grade === selectedGrade);
        setStudentsList(filtered);
        
        // Load today's attendance for these students
        const today = new Date().toISOString().split('T')[0];
        const records = storage.getAttendance().filter(a => a.date === today);
        const newState: Record<string, AttendanceStatus> = {};
        
        filtered.forEach(s => {
            const record = records.find(r => r.studentId === s.id);
            if (record) newState[s.id] = record.status;
        });
        setAttendanceState(newState);
    }
  }, [selectedGrade]);

  const handleScanSuccess = (decodedText: string) => {
    if (lastScanned && lastScanned.student.id === decodedText && (Date.now() - new Date(lastScanned.time).getTime() < 3000)) {
        return;
    }
    processAttendance(decodedText);
  };

  const processAttendance = (studentId: string) => {
    const students = storage.getStudents();
    const student = students.find(s => s.id === studentId);

    if (!student) {
      setError(`Invalid Student ID: ${studentId}`);
      setTimeout(() => setError(null), 3000);
      return;
    }

    // STRICT RESTRICTION: Check if teacher is allowed to mark this student
    if (user?.role === UserRole.TEACHER && user.gradeAssigned) {
        if (student.grade !== user.gradeAssigned) {
            setError(`RESTRICTED: You are assigned to ${user.gradeAssigned}. This student is in ${student.grade}.`);
            setTimeout(() => setError(null), 4000);
            return;
        }
    }

    const now = new Date();
    const hour = now.getHours();
    let status = AttendanceStatus.PRESENT;
    if (hour >= 9) status = AttendanceStatus.LATE; 

    saveRecord(student, status, now);

    setLastScanned({
      student,
      status,
      time: now.toLocaleTimeString()
    });
    setError(null);
    setManualId('');
  };

  const saveRecord = (student: Student, status: AttendanceStatus, dateObj: Date) => {
    const record = {
      id: `ATT-${Date.now()}`,
      studentId: student.id,
      date: dateObj.toISOString().split('T')[0],
      timestamp: dateObj.toISOString(),
      status,
      markedBy: user?.id || 'system'
    };
    storage.markAttendance(record);
    // Update local state if in list mode
    setAttendanceState(prev => ({...prev, [student.id]: status}));
  };

  const startScanner = () => {
    setIsScanning(true);
    setTimeout(() => {
        try {
            const html5QrcodeScanner = new window.Html5QrcodeScanner(
                "reader",
                { fps: 10, qrbox: { width: 250, height: 250 } },
                false
            );
            scannerRef.current = html5QrcodeScanner;
            html5QrcodeScanner.render(handleScanSuccess, (err: any) => {});
        } catch (e) {
            console.error("Scanner init error", e);
            setError("Could not initialize camera.");
        }
    }, 100);
  };

  const stopScanner = () => {
      if (scannerRef.current) {
          scannerRef.current.clear()
            .then(() => {
                setIsScanning(false);
                scannerRef.current = null;
            })
            .catch((err: any) => console.error(err));
      } else {
          setIsScanning(false);
      }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(manualId.trim()) processAttendance(manualId.trim());
  };

  const handleListMark = (student: Student, status: AttendanceStatus) => {
      saveRecord(student, status, new Date());
  };

  return (
    <div className="space-y-6">
      {/* Mode Toggle */}
      <div className="flex justify-center mb-6">
        <div className="bg-white dark:bg-gray-800 p-1 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex">
            <button 
                onClick={() => setMode('scan')}
                className={`flex items-center gap-2 px-6 py-2 rounded-md transition-all ${mode === 'scan' ? 'bg-primary text-white shadow' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
            >
                <QrCode size={18} /> Scanner
            </button>
            <button 
                onClick={() => setMode('list')}
                className={`flex items-center gap-2 px-6 py-2 rounded-md transition-all ${mode === 'list' ? 'bg-primary text-white shadow' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
            >
                <List size={18} /> Manual List
            </button>
        </div>
      </div>

      {mode === 'scan' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    <Camera /> QR Scanner
                    </h2>
                    {isScanning ? (
                        <button onClick={stopScanner} className="text-red-500 hover:text-red-700 flex items-center gap-1 text-sm font-medium">
                            <StopCircle size={16} /> Stop Camera
                        </button>
                    ) : (
                        <button onClick={startScanner} className="text-primary hover:text-indigo-700 flex items-center gap-1 text-sm font-medium">
                            <Camera size={16} /> Start Camera
                        </button>
                    )}
                </div>

                <div className="bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden min-h-[300px] flex flex-col items-center justify-center relative">
                    {!isScanning && (
                        <div className="text-center text-gray-400">
                            <Camera size={48} className="mx-auto mb-2 opacity-50" />
                            <p>Camera is off</p>
                        </div>
                    )}
                    <div id="reader" className={isScanning ? "w-full" : "hidden"}></div>
                </div>

                <div className="mt-6">
                    <div className="flex items-center gap-4 my-4">
                        <div className="h-px bg-gray-200 dark:bg-gray-700 flex-1"></div>
                        <span className="text-sm text-gray-400">OR ENTER ID</span>
                        <div className="h-px bg-gray-200 dark:bg-gray-700 flex-1"></div>
                    </div>
                    <form onSubmit={handleManualSubmit} className="flex gap-2">
                        <input 
                            value={manualId}
                            onChange={(e) => setManualId(e.target.value)}
                            placeholder="Student ID (e.g., ST-2024-001)"
                            className="flex-1 p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                        <button type="submit" className="bg-primary text-white px-4 rounded hover:bg-indigo-700">Mark</button>
                    </form>
                </div>
                </div>
            </div>

            <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 h-full flex flex-col">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Live Status</h2>
                
                {error && (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded flex items-center gap-2" role="alert">
                        <AlertTriangle size={20} />
                        <p className="font-medium">{error}</p>
                    </div>
                )}

                {lastScanned ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center animate-pulse-once">
                    <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-4 ${
                        lastScanned.status === 'PRESENT' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'
                    }`}>
                        {lastScanned.status === 'PRESENT' ? <CheckCircle size={48} /> : <Clock size={48} />}
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{lastScanned.student.name}</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-2">{lastScanned.student.id}</p>
                    
                    <div className="inline-block px-4 py-1 rounded-full text-sm font-bold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                        Marked {lastScanned.status} at {lastScanned.time}
                    </div>

                    <div className="mt-8 w-full bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-left">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <span className="text-gray-500">Grade:</span>
                            <span className="font-medium dark:text-gray-300">{lastScanned.student.grade}</span>
                            <span className="text-gray-500">Roll No:</span>
                            <span className="font-medium dark:text-gray-300">{lastScanned.student.rollNo}</span>
                        </div>
                    </div>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-400">
                        <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                            <Camera size={32} />
                        </div>
                        <p>Waiting for scan...</p>
                    </div>
                )}
                </div>
            </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
             <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-4">
                    <label className="text-gray-700 dark:text-gray-300 font-medium">Select Class:</label>
                    <select 
                        className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white min-w-[200px]"
                        value={selectedGrade}
                        onChange={(e) => setSelectedGrade(e.target.value)}
                        disabled={user?.role === UserRole.TEACHER}
                    >
                        <option value="">-- Select Grade --</option>
                        {storage.getGrades().map(g => (
                            <option key={g.id} value={g.name}>{g.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 text-sm uppercase">
                        <tr>
                            <th className="px-6 py-3">Roll No</th>
                            <th className="px-6 py-3">Name</th>
                            <th className="px-6 py-3">Current Status</th>
                            <th className="px-6 py-3 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {studentsList.length > 0 ? studentsList.map(student => {
                            const status = attendanceState[student.id];
                            return (
                                <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                    <td className="px-6 py-4 font-medium dark:text-gray-300">{student.rollNo}</td>
                                    <td className="px-6 py-4 dark:text-white">{student.name}</td>
                                    <td className="px-6 py-4">
                                        {status ? (
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${
                                                status === 'PRESENT' ? 'bg-green-100 text-green-800' :
                                                status === 'LATE' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-red-100 text-red-800'
                                            }`}>
                                                {status}
                                            </span>
                                        ) : (
                                            <span className="text-gray-400 text-sm">Not Marked</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        <button 
                                            onClick={() => handleListMark(student, AttendanceStatus.PRESENT)}
                                            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${status === 'PRESENT' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-green-100'}`}
                                        >
                                            Present
                                        </button>
                                        <button 
                                            onClick={() => handleListMark(student, AttendanceStatus.ABSENT)}
                                            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${status === 'ABSENT' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-red-100'}`}
                                        >
                                            Absent
                                        </button>
                                        <button 
                                            onClick={() => handleListMark(student, AttendanceStatus.LATE)}
                                            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${status === 'LATE' ? 'bg-yellow-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-yellow-100'}`}
                                        >
                                            Late
                                        </button>
                                    </td>
                                </tr>
                            )
                        }) : (
                            <tr>
                                <td colSpan={4} className="p-8 text-center text-gray-500">
                                    {selectedGrade ? "No students in this grade." : "Please select a grade to view students."}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
      )}
    </div>
  );
};

export default Attendance;