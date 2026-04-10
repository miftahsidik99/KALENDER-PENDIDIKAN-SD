import React, { useState } from 'react';
import { Holiday } from '../types';
import { defaultColors } from '../lib/defaultData';
import { Plus, Trash2, Pencil, Check, X } from 'lucide-react';

interface HolidayManagerProps {
  holidays: Holiday[];
  onChange: (holidays: Holiday[]) => void;
}

export function HolidayManager({ holidays, onChange }: HolidayManagerProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newHoliday, setNewHoliday] = useState<Partial<Holiday>>({
    date: '',
    endDate: '',
    description: '',
    color: defaultColors[0]
  });

  const handleSave = () => {
    if (!newHoliday.date || !newHoliday.description) return;
    
    if (editingId) {
      // Update existing
      const updatedHolidays = holidays.map(h => 
        h.id === editingId 
          ? { ...h, ...newHoliday, endDate: newHoliday.endDate || undefined } as Holiday 
          : h
      );
      onChange(updatedHolidays.sort((a, b) => a.date.localeCompare(b.date)));
      setEditingId(null);
    } else {
      // Add new
      const holiday: Holiday = {
        id: Math.random().toString(36).substr(2, 9),
        date: newHoliday.date,
        endDate: newHoliday.endDate || undefined,
        description: newHoliday.description,
        color: newHoliday.color || defaultColors[0]
      };
      onChange([...holidays, holiday].sort((a, b) => a.date.localeCompare(b.date)));
    }
    
    setNewHoliday({ date: '', endDate: '', description: '', color: defaultColors[0] });
  };

  const handleEdit = (holiday: Holiday) => {
    setEditingId(holiday.id);
    setNewHoliday({
      date: holiday.date,
      endDate: holiday.endDate || '',
      description: holiday.description,
      color: holiday.color
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setNewHoliday({ date: '', endDate: '', description: '', color: defaultColors[0] });
  };

  const handleRemove = (id: string) => {
    onChange(holidays.filter(h => h.id !== id));
    if (editingId === id) cancelEdit();
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Agenda & Hari Libur</h2>
      
      {/* Add/Edit Holiday Form */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6 items-end bg-gray-50 p-4 rounded-lg border border-gray-200">
        <div className="md:col-span-3">
          <label className="block text-xs font-medium text-gray-500 mb-1">Tanggal Mulai</label>
          <input
            type="date"
            value={newHoliday.date}
            onChange={e => setNewHoliday({ ...newHoliday, date: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        <div className="md:col-span-3">
          <label className="block text-xs font-medium text-gray-500 mb-1">Tanggal Selesai (Opsional)</label>
          <input
            type="date"
            value={newHoliday.endDate}
            onChange={e => setNewHoliday({ ...newHoliday, endDate: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        <div className="md:col-span-3">
          <label className="block text-xs font-medium text-gray-500 mb-1">Keterangan</label>
          <input
            type="text"
            value={newHoliday.description}
            onChange={e => setNewHoliday({ ...newHoliday, description: e.target.value })}
            placeholder="Contoh: Libur Nasional"
            className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        <div className="md:col-span-1">
          <label className="block text-xs font-medium text-gray-500 mb-1">Warna</label>
          <input
            type="color"
            value={newHoliday.color}
            onChange={e => setNewHoliday({ ...newHoliday, color: e.target.value })}
            className="w-full h-9 p-1 border border-gray-200 rounded-md cursor-pointer"
          />
        </div>
        <div className="md:col-span-2 flex gap-2">
          {editingId && (
            <button
              onClick={cancelEdit}
              className="w-full h-9 flex items-center justify-center bg-gray-200 text-gray-600 rounded-md hover:bg-gray-300 transition-colors"
              title="Batal Edit"
            >
              <X size={18} />
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={!newHoliday.date || !newHoliday.description}
            className={`w-full h-9 flex items-center justify-center text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              editingId ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'
            }`}
            title={editingId ? "Simpan Perubahan" : "Tambahkan"}
          >
            {editingId ? <Check size={18} /> : <Plus size={18} />}
          </button>
        </div>
      </div>

      {/* List of Holidays */}
      <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
        {holidays.map(holiday => (
          <div 
            key={holiday.id} 
            className={`flex items-center justify-between p-3 border rounded-lg transition-colors ${
              editingId === holiday.id ? 'border-blue-300 bg-blue-50' : 'border-gray-100 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: holiday.color }} />
              <div>
                <p className="text-sm font-medium text-gray-800">{holiday.description}</p>
                <p className="text-xs text-gray-500">
                  {new Date(holiday.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  {holiday.endDate && ` - ${new Date(holiday.endDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleEdit(holiday)}
                className="text-gray-400 hover:text-blue-600 p-2 rounded-md hover:bg-blue-100 transition-colors"
                title="Edit"
              >
                <Pencil size={16} />
              </button>
              <button
                onClick={() => handleRemove(holiday.id)}
                className="text-gray-400 hover:text-red-500 p-2 rounded-md hover:bg-red-50 transition-colors"
                title="Hapus"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
        {holidays.length === 0 && (
          <div className="text-center py-8 text-gray-500 text-sm">
            Belum ada agenda atau hari libur yang ditambahkan.
          </div>
        )}
      </div>
    </div>
  );
}
