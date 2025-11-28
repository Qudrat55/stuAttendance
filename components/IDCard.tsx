import React from 'react';
import QRCode from 'react-qr-code';
import { Student } from '../types';

interface IDCardProps {
  student: Student;
}

export const IDCard: React.FC<IDCardProps> = ({ student }) => {
  return (
    <div className="w-[350px] h-[550px] bg-white border-2 border-primary rounded-xl overflow-hidden shadow-xl relative print:shadow-none print:border print:m-0 break-inside-avoid">
      {/* Header Pattern */}
      <div className="h-32 bg-primary relative">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent"></div>
        <div className="text-center pt-6 text-white">
          <h2 className="text-xl font-bold uppercase tracking-wider">EduScan High</h2>
          <p className="text-xs opacity-90">Excellence in Education</p>
        </div>
      </div>

      {/* Photo Placeholder */}
      <div className="absolute top-20 left-1/2 transform -translate-x-1/2">
        <div className="w-32 h-32 rounded-full border-4 border-white bg-gray-200 shadow-md flex items-center justify-center overflow-hidden">
           <img src={`https://picsum.photos/seed/${student.id}/200`} alt="Student" className="w-full h-full object-cover" />
        </div>
      </div>

      {/* Content */}
      <div className="pt-24 px-6 text-center space-y-4">
        <div>
          <h3 className="text-2xl font-bold text-gray-800">{student.name}</h3>
          <p className="text-sm text-gray-500 font-medium">{student.id}</p>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm text-left bg-gray-50 p-4 rounded-lg">
          <div>
            <span className="text-xs text-gray-400 block uppercase">Grade</span>
            <span className="font-semibold text-gray-700">{student.grade}</span>
          </div>
          <div>
            <span className="text-xs text-gray-400 block uppercase">Section</span>
            <span className="font-semibold text-gray-700">{student.section}</span>
          </div>
          <div>
            <span className="text-xs text-gray-400 block uppercase">Roll No</span>
            <span className="font-semibold text-gray-700">{student.rollNo}</span>
          </div>
          <div>
            <span className="text-xs text-gray-400 block uppercase">Emergency</span>
            <span className="font-semibold text-gray-700">{student.contact}</span>
          </div>
        </div>

        {/* QR Code */}
        <div className="flex flex-col items-center justify-center gap-2 pt-2">
            <div className="p-2 bg-white rounded border border-gray-200">
                <QRCode value={student.id} size={100} level="H" />
            </div>
            <p className="text-xs text-gray-400">Scan to mark attendance</p>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 w-full bg-primary/10 py-2 text-center">
        <p className="text-[10px] text-primary font-bold">Valid for Academic Year 2024-2025</p>
      </div>
    </div>
  );
};