import React from 'react';
import { SchoolIdentity } from '../types';
import { ImageUpload } from './ImageUpload';

interface SchoolFormProps {
  identity: SchoolIdentity;
  onChange: (identity: SchoolIdentity) => void;
}

export function SchoolForm({ identity, onChange }: SchoolFormProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onChange({ ...identity, [name]: value });
  };

  const handleImageChange = (field: 'principalSignature' | 'schoolStamp', value: string | undefined) => {
    onChange({ ...identity, [field]: value });
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Identitas Sekolah</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Nama Sekolah</label>
          <input
            type="text"
            name="name"
            value={identity.name}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            placeholder="Contoh: SMAN 1 Bandung"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">NPSN</label>
          <input
            type="text"
            name="npsn"
            value={identity.npsn}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            placeholder="Contoh: 20212345"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-600 mb-1">Alamat Sekolah</label>
          <input
            type="text"
            name="address"
            value={identity.address}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            placeholder="Contoh: Jl. Ir. H. Juanda No. 93"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Nama Kepala Sekolah</label>
          <input
            type="text"
            name="principalName"
            value={identity.principalName}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
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
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            placeholder="NIP (Kosongkan jika tidak ada)"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Kota/Kabupaten</label>
          <input
            type="text"
            name="city"
            value={identity.city}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            placeholder="Contoh: Kota Bandung"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-100">
        <ImageUpload 
           label="Tanda Tangan Kepala Sekolah"
           value={identity.principalSignature}
           onChange={(val) => handleImageChange('principalSignature', val)}
           onRemove={() => handleImageChange('principalSignature', undefined)}
        />
        <ImageUpload 
           label="Stempel Sekolah"
           value={identity.schoolStamp}
           onChange={(val) => handleImageChange('schoolStamp', val)}
           onRemove={() => handleImageChange('schoolStamp', undefined)}
        />
      </div>
    </div>
  );
}
