import React from 'react';
import { SchoolIdentity, TeacherIdentity, SubjectTeacherIdentity } from '../types';

interface WebSignatureBoxProps {
  schoolIdentity: SchoolIdentity;
  teacherIdentity?: TeacherIdentity;
  subjectIdentity?: SubjectTeacherIdentity;
  subject?: string;
  grade?: number;
  startYear: number;
}

export function WebSignatureBox({ schoolIdentity, teacherIdentity, subjectIdentity, subject, grade, startYear }: WebSignatureBoxProps) {
  // Determine if it's school, homeroom teacher, or subject teacher
  const isSchoolCalendar = !teacherIdentity && !subjectIdentity;
  const isSubject = !!subjectIdentity;
  
  const teacherOrSubjectName = subjectIdentity ? subjectIdentity.name : (teacherIdentity ? teacherIdentity.name : '');
  const teacherOrSubjectNip = subjectIdentity ? subjectIdentity.nip : (teacherIdentity ? teacherIdentity.nip : '');
  const teacherSig = subjectIdentity ? subjectIdentity.teacherSignature : (teacherIdentity ? teacherIdentity.teacherSignature : undefined);

  return (
    <div className="mt-12 pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center text-center gap-8 print:mt-16 print:break-inside-avoid print:flex-row print:justify-between">
      <div className="flex-1 flex flex-col items-center">
        <p className="mb-0">Mengetahui,</p>
        <p className="mb-0">Kepala Sekolah</p>
        
        <div className="relative w-64 h-32 my-1 flex items-center justify-center mx-auto">
          {schoolIdentity.schoolStamp && (
            <img 
              src={schoolIdentity.schoolStamp} 
              alt="Stempel Sekolah" 
              className="absolute h-32 w-32 object-contain z-0 -translate-x-10 mix-blend-multiply"
            />
          )}
          {schoolIdentity.principalSignature && (
            <img 
              src={schoolIdentity.principalSignature} 
              alt="Tanda Tangan Kepala Sekolah" 
              className="absolute h-28 w-40 object-contain z-10 translate-x-4 mix-blend-multiply"
            />
          )}
          {!schoolIdentity.principalSignature && !schoolIdentity.schoolStamp && (
            <div className="text-gray-300 italic text-sm absolute">Belum ada tanda tangan</div>
          )}
        </div>
        
        <p className="font-bold relative z-20">{schoolIdentity.principalName}</p>
        <p className="relative z-20">NIP. {schoolIdentity.principalNip || '-'}</p>
      </div>

      {!isSchoolCalendar && (
        <div className="flex-1 flex flex-col items-center">
          <p className="mb-0">{schoolIdentity.city || 'Kota'}, 15 Juli {startYear}</p>
          <p className="mb-0">
            {isSubject ? `Guru Mata Pelajaran ${subject}` : `Guru Kelas ${grade}`}
          </p>
          
          <div className="relative w-48 h-32 my-1 flex items-center justify-center mx-auto">
            {teacherSig ? (
              <img 
                src={teacherSig} 
                alt="Tanda Tangan Guru" 
                className="absolute h-28 w-40 object-contain z-10 mix-blend-multiply"
              />
            ) : (
              <div className="text-gray-300 italic text-sm absolute">Belum ada tanda tangan</div>
            )}
          </div>
          
          <p className="font-bold relative z-20">{teacherOrSubjectName || '..............................'}</p>
          <p className="relative z-20">NIP. {teacherOrSubjectNip || '-'}</p>
        </div>
      )}
    </div>
  );
}
