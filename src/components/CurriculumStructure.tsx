import React from 'react';
import { CurriculumSubject } from '../types';

interface Props {
  subjects: CurriculumSubject[];
  onChange: (subjects: CurriculumSubject[]) => void;
  grade: number;
}

export function CurriculumStructure({ subjects, onChange, grade }: Props) {
  const handleEdit = (id: string, field: keyof CurriculumSubject, value: string) => {
    onChange(subjects.map(sub => 
      sub.id === id ? { ...sub, [field]: value } : sub
    ));
  };

  const totalHours = subjects.reduce((sum, sub) => {
    const hours = Number(sub.hoursPerWeek);
    return sum + (isNaN(hours) ? 0 : hours);
  }, 0);

  return (
    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 mb-8 print:shadow-none print:border-none print:p-0">
      <div className="text-center mb-8">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 uppercase tracking-wide mb-1">
          STRUKTUR KURIKULUM KELAS {grade}
        </h2>
        <p className="text-sm text-blue-600 italic print:hidden">
          * Klik pada teks atau angka di dalam tabel untuk mengedit data (termasuk beban JP).
        </p>
      </div>

      <div className="overflow-x-auto flex justify-center">
        <table className="w-full max-w-4xl text-sm md:text-base border-collapse border-2 border-black">
          <thead>
            <tr className="bg-gray-200">
              <th className="border-2 border-black py-2 px-4 w-16 text-center">NO</th>
              <th className="border-2 border-black py-2 px-4 text-left">Muatan Pelajaran</th>
              <th className="border-2 border-black py-2 px-4 w-48 text-center">Jampel / per minggu</th>
            </tr>
          </thead>
          <tbody>
            {subjects.map((sub) => (
              <tr key={sub.id} className="bg-white">
                <td className="border-2 border-black py-2 px-4 text-center">
                  <input 
                    type="text" 
                    value={sub.no} 
                    onChange={(e) => handleEdit(sub.id, 'no', e.target.value)}
                    className="w-full text-center outline-none bg-transparent hover:bg-gray-100 focus:bg-white focus:ring-2 focus:ring-emerald-500 rounded transition-all"
                    title="Klik untuk mengedit"
                  />
                </td>
                <td className={`border-2 border-black py-2 px-4 ${sub.isSubItem ? 'pl-8' : ''}`}>
                  <input 
                    type="text" 
                    value={sub.name} 
                    onChange={(e) => handleEdit(sub.id, 'name', e.target.value)}
                    className="w-full outline-none bg-transparent hover:bg-gray-100 focus:bg-white focus:ring-2 focus:ring-emerald-500 rounded px-1 transition-all"
                    title="Klik untuk mengedit"
                  />
                </td>
                <td className="border-2 border-black py-2 px-4 text-center">
                  <input 
                    type="text" 
                    value={sub.hoursPerWeek} 
                    onChange={(e) => handleEdit(sub.id, 'hoursPerWeek', e.target.value)}
                    className="w-full text-center outline-none bg-transparent hover:bg-gray-100 focus:bg-white focus:ring-2 focus:ring-emerald-500 rounded transition-all font-semibold text-blue-700"
                    title="Klik untuk mengedit beban JP"
                  />
                </td>
              </tr>
            ))}
            <tr className="bg-gray-200 font-bold">
              <td colSpan={2} className="border-2 border-black py-3 px-4 text-center italic">Jumlah</td>
              <td className="border-2 border-black py-3 px-4 text-center bg-gray-300">{totalHours}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
