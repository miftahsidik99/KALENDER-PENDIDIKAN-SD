import React from 'react';
import { motion } from 'motion/react';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface ScheduleSyncAlertProps {
  isOpen: boolean;
  type: 'loading' | 'results' | 'autofilled';
  discrepancies: string[];
  clashes: string[];
  onClose: () => void;
}

export function ScheduleSyncAlert({ isOpen, type, discrepancies, clashes, onClose }: ScheduleSyncAlertProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden"
      >
        <div className="p-6">
          {type === 'loading' ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
              <h3 className="text-lg font-semibold text-gray-800">Mengecek Sinkronisasi...</h3>
              <p className="text-gray-500 text-sm mt-2 text-center">
                Memindai jadwal pada kurikulum semester ini dan memverifikasi bentrok jam pelajaran dengan kelas lainnya...
              </p>
            </div>
          ) : type === 'autofilled' ? (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-emerald-100 p-2 rounded-full">
                  <CheckCircle className="text-emerald-600 w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">
                  Jadwal Berhasil Dibuat
                </h3>
              </div>
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
                <p className="text-emerald-700 font-medium">Pengisian Jadwal Otomatis Sukses!</p>
                <p className="text-emerald-600 text-sm mt-1">Kami telah membuat rekomendasi jadwal yang meminimalisir bentrokan pelajaran khusus (PJOK, PAIBP, Mengaji) antara setiap kelas.</p>
              </div>
              <div className="mt-8 flex justify-end">
                <button
                  onClick={onClose}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  Tutup
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-3 mb-6">
                {(discrepancies.length === 0 && clashes.length === 0) ? (
                  <div className="bg-emerald-100 p-2 rounded-full">
                    <CheckCircle className="text-emerald-600 w-6 h-6" />
                  </div>
                ) : (
                  <div className="bg-amber-100 p-2 rounded-full">
                    <AlertTriangle className="text-amber-600 w-6 h-6" />
                  </div>
                )}
                <h3 className="text-xl font-bold text-gray-800">
                  Hasil Cek Sinkronisasi
                </h3>
              </div>

              <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
                {/* Status Sukses Sempurna */}
                {(discrepancies.length === 0 && clashes.length === 0) && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
                    <p className="text-emerald-700 font-medium">Luar Biasa!</p>
                    <p className="text-emerald-600 text-sm mt-1">Jadwal Anda sudah tersinkron dengan baik dengan beban Struktur Kurikulum dan tidak ada bentrok pelajaran spesialis dengan kelas lain.</p>
                  </div>
                )}

                {/* Status Bentrok Antar Kelas */}
                {clashes.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <XCircle className="text-red-500 w-4 h-4" /> BENTROK JAM PELAJARAN:
                    </h4>
                    <div className="space-y-2">
                      {clashes.map((clash, i) => (
                        <div key={i} className="bg-red-50 text-red-700 text-sm p-3 rounded-lg border border-red-100">
                          {clash}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Status Kekurangan/Kelebihan Beban Jam Kurikulum */}
                {discrepancies.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <AlertTriangle className="text-amber-500 w-4 h-4" /> DISKREPANSI JAM KURIKULUM:
                    </h4>
                    <div className="space-y-2">
                      {discrepancies.map((msg, i) => (
                        <div key={i} className="bg-amber-50 text-amber-700 text-sm p-3 rounded-lg border border-amber-100">
                          {msg}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-8 flex justify-end">
                <button
                  onClick={onClose}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  Tutup
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
