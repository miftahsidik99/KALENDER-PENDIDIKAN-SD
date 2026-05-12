import React from 'react';
import { SubjectTeacherIdentity } from '../types';
import { ImageUpload } from './ImageUpload';

interface SubjectTeacherFormProps {
  identity: SubjectTeacherIdentity;
  onChange: (identity: SubjectTeacherIdentity) => void;
  subject: string;
}

export function SubjectTeacherForm({ identity, onChange, subject }: SubjectTeacherFormProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onChange({ ...identity, [name]: value });
  };

  const handleImageChange = (field: 'teacherSignature', value: string | undefined) => {
    onChange({ ...identity, [field]: value });
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Identitas Guru {subject}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Nama Guru</label>
          <input
            type="text"
            name="name"
            value={identity.name}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            placeholder="Nama Lengkap beserta Gelar"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">NIP / NUPTK</label>
          <input
            type="text"
            name="nip"
            value={identity.nip}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            placeholder="NIP (Kosongkan jika tidak ada)"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 mt-6 pt-6 border-t border-gray-100">
        <ImageUpload 
           label="Tanda Tangan Guru"
           value={identity.teacherSignature}
           onChange={(val) => handleImageChange('teacherSignature', val)}
           onRemove={() => handleImageChange('teacherSignature', undefined)}
        />
      </div>
    </div>
  );
}
