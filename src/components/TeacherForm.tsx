import React from 'react';
import { TeacherIdentity } from '../types';

interface TeacherFormProps {
  identity: TeacherIdentity;
  onChange: (identity: TeacherIdentity) => void;
}

export function TeacherForm({ identity, onChange }: TeacherFormProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onChange({ ...identity, [name]: value });
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Identitas Guru Kelas</h2>
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
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Nama Sekolah</label>
          <input
            type="text"
            name="schoolName"
            value={identity.schoolName}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            placeholder="Contoh: SDN 1 Bandung"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Kelas</label>
          <input
            type="text"
            name="className"
            value={identity.className}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-gray-50"
            readOnly
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Nama Kepala Sekolah</label>
          <input
            type="text"
            name="principalName"
            value={identity.principalName}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            placeholder="Nama Lengkap beserta Gelar"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">NIP Kepala Sekolah</label>
          <input
            type="text"
            name="principalNip"
            value={identity.principalNip}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            placeholder="NIP Kepala Sekolah"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-600 mb-1">Kota/Kabupaten</label>
          <input
            type="text"
            name="city"
            value={identity.city}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            placeholder="Contoh: Kota Bandung"
          />
        </div>
      </div>
    </div>
  );
}
