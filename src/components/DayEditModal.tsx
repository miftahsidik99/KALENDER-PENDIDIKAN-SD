import React, { useState, useEffect } from 'react';
import { Holiday } from '../types';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { defaultColors } from '../lib/defaultData';
import { X, Trash2, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DayEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date | null;
  existingHoliday?: Holiday;
  onSave: (holiday: Holiday) => void;
  onDelete: (holidayId: string) => void;
}

export function DayEditModal({ isOpen, onClose, selectedDate, existingHoliday, onSave, onDelete }: DayEditModalProps) {
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(defaultColors[0]);

  useEffect(() => {
    if (existingHoliday) {
      setDescription(existingHoliday.description);
      setColor(existingHoliday.color);
    } else {
      setDescription('');
      setColor(defaultColors[0]);
    }
  }, [existingHoliday, isOpen]);

  if (!isOpen || !selectedDate) return null;

  const handleSave = () => {
    if (!description.trim()) {
      alert("Keterangan tidak boleh kosong.");
      return;
    }

    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    
    // If editing an existing holiday that spans multiple days, we might want to just update it,
    // or if it's a single day, we update it. For simplicity, we update the existing one or create new.
    const holidayToSave: Holiday = {
      id: existingHoliday ? existingHoliday.id : Math.random().toString(36).substr(2, 9),
      date: existingHoliday ? existingHoliday.date : dateStr,
      endDate: existingHoliday ? existingHoliday.endDate : undefined,
      description,
      color
    };

    onSave(holidayToSave);
    onClose();
  };

  const handleDelete = () => {
    if (existingHoliday) {
      onDelete(existingHoliday.id);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden"
        >
          <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50">
            <h3 className="font-semibold text-gray-800">
              {existingHoliday ? 'Edit Keterangan' : 'Tambah Keterangan'}
            </h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
          </div>

          <div className="p-6 space-y-6">
            <div>
              <p className="text-sm text-gray-500 mb-1">Tanggal Terpilih</p>
              <p className="font-medium text-gray-900">
                {format(selectedDate, 'EEEE, d MMMM yyyy', { locale: id })}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Keterangan / Nama Libur</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Contoh: Libur Nasional"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Pilih Warna (100 Pilihan)</label>
              <div className="grid grid-cols-10 gap-1.5 max-h-48 overflow-y-auto p-1 border border-gray-100 rounded-lg bg-gray-50">
                {defaultColors.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className="w-6 h-6 rounded-full flex items-center justify-center transition-transform hover:scale-110 focus:outline-none"
                    style={{ backgroundColor: c, boxShadow: color === c ? `0 0 0 2px white, 0 0 0 4px ${c}` : 'none' }}
                    title={c}
                  >
                    {color === c && <Check size={12} className="text-white drop-shadow-md" />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 border-t border-gray-100 bg-gray-50">
            {existingHoliday ? (
              <button
                onClick={handleDelete}
                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
              >
                <Trash2 size={16} /> Hapus
              </button>
            ) : (
              <div></div>
            )}
            
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:bg-gray-200 bg-gray-100 rounded-lg transition-colors text-sm font-medium"
              >
                Batal
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
              >
                Simpan
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
