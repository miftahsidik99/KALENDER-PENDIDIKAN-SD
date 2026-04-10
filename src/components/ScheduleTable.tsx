import React from 'react';
import { ScheduleItem } from '../types';
import { Plus, Trash2 } from 'lucide-react';

interface ScheduleTableProps {
  schedule: ScheduleItem[];
  onChange: (schedule: ScheduleItem[]) => void;
  schoolDays: 5 | 6;
}

export function ScheduleTable({ schedule, onChange, schoolDays }: ScheduleTableProps) {
  const handleChange = (id: string, field: keyof ScheduleItem, value: string) => {
    onChange(schedule.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleAddRow = () => {
    const newItem: ScheduleItem = {
      id: Math.random().toString(36).substr(2, 9),
      time: '00:00 - 00:00',
      monday: '',
      tuesday: '',
      wednesday: '',
      thursday: '',
      friday: '',
      saturday: ''
    };
    onChange([...schedule, newItem]);
  };

  const handleRemoveRow = (id: string) => {
    onChange(schedule.filter(item => item.id !== id));
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 mb-8 overflow-hidden">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Jadwal Pelajaran</h2>
        <button
          onClick={handleAddRow}
          className="flex items-center gap-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus size={16} /> Tambah Baris
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-gray-800 text-white">
              <th className="px-3 py-3 font-semibold border border-gray-700 w-32 text-center">Waktu</th>
              <th className="px-3 py-3 font-semibold border border-gray-700 text-center">Senin</th>
              <th className="px-3 py-3 font-semibold border border-gray-700 text-center">Selasa</th>
              <th className="px-3 py-3 font-semibold border border-gray-700 text-center">Rabu</th>
              <th className="px-3 py-3 font-semibold border border-gray-700 text-center">Kamis</th>
              <th className="px-3 py-3 font-semibold border border-gray-700 text-center">Jumat</th>
              {schoolDays === 6 && <th className="px-3 py-3 font-semibold border border-gray-700 text-center">Sabtu</th>}
              <th className="px-2 py-3 font-semibold border border-gray-700 w-10 text-center"></th>
            </tr>
          </thead>
          <tbody>
            {schedule.map((item, index) => (
              <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50 group">
                <td className="p-1 border border-gray-200">
                  <input
                    type="text"
                    value={item.time}
                    onChange={(e) => handleChange(item.id, 'time', e.target.value)}
                    className="w-full px-2 py-1.5 text-center bg-transparent border-none focus:ring-2 focus:ring-blue-500 rounded outline-none font-medium text-gray-700"
                    placeholder="07:00 - 07:35"
                  />
                </td>
                {(schoolDays === 5 ? ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'] : ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']).map((day) => (
                  <td key={day} className="p-1 border border-gray-200">
                    <input
                      type="text"
                      value={item[day as keyof ScheduleItem]}
                      onChange={(e) => handleChange(item.id, day as keyof ScheduleItem, e.target.value)}
                      className="w-full px-2 py-1.5 text-center bg-transparent border-none focus:ring-2 focus:ring-blue-500 rounded outline-none text-gray-600"
                      placeholder="-"
                    />
                  </td>
                ))}
                <td className="p-1 border border-gray-200 text-center">
                  <button
                    onClick={() => handleRemoveRow(item.id)}
                    className="text-gray-300 hover:text-red-500 p-1.5 rounded-md hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                    title="Hapus Baris"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
