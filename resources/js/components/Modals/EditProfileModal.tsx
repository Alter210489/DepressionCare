import React from 'react';
import { useForm } from '@inertiajs/react';

interface MahasiswaData {
  nama: string;
  nim: string;
  fakultas: string;
  program_studi: string;
  usia: number | null;
  jenis_kelamin: 'L' | 'P' | null;
}

interface UserEditData {
  id: number;
  email: string;
  nama: string;
  nim: string;
  fakultas: string;
  program_studi: string;
  usia: number | null;
  jenis_kelamin: 'L' | 'P' | null;
}

interface Props {
  user: UserEditData;
  onClose: () => void;
}

export default function EditProfileModal({ user, onClose }: Props) {
  const { data, setData, put, processing, errors, reset } = useForm({
    email: user.email,
    nama: user.nama,
    nim: user.nim,
    fakultas: user.fakultas,
    program_studi: user.program_studi,
    usia: user.usia ?? '',
    jenis_kelamin: user.jenis_kelamin ?? '',
    password: '',
    password_confirmation: '',
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    put(route('mahasiswa.profile.update'), {
      onSuccess: () => {
        reset();
        onClose();
      },
    });
  };

  const close = () => {
    reset();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={close}
    >
      <div
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Edit Profil</h2>
            <button
              onClick={close}
              className="text-white/80 hover:text-white text-xl font-bold"
              aria-label="Tutup"
            >
              &times;
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={submit} className="p-6 max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Nama */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nama Lengkap
              </label>
              <input
                type="text"
                value={data.nama}
                onChange={(e) => setData('nama', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              {errors.nama && <div className="text-red-500 text-xs mt-1">{errors.nama}</div>}
            </div>

            {/* NIM */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">NIM</label>
              <input
                type="text"
                value={data.nim}
                onChange={(e) => setData('nim', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              {errors.nim && <div className="text-red-500 text-xs mt-1">{errors.nim}</div>}
            </div>

            {/* Fakultas */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fakultas</label>
              <input
                type="text"
                value={data.fakultas}
                onChange={(e) => setData('fakultas', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              {errors.fakultas && <div className="text-red-500 text-xs mt-1">{errors.fakultas}</div>}
            </div>

            {/* Program Studi */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Program Studi
              </label>
              <input
                type="text"
                value={data.program_studi}
                onChange={(e) => setData('program_studi', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              {errors.program_studi && (
                <div className="text-red-500 text-xs mt-1">{errors.program_studi}</div>
              )}
            </div>

            {/* Usia */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Usia</label>
              <input
                type="number"
                min="1"
                max="100"
                value={data.usia}
                onChange={(e) =>
                  setData('usia', e.target.value ? Number(e.target.value) : '')
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              {errors.usia && <div className="text-red-500 text-xs mt-1">{errors.usia}</div>}
            </div>

            {/* Jenis Kelamin */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Jenis Kelamin
              </label>
              <select
                value={data.jenis_kelamin}
                onChange={(e) => setData('jenis_kelamin', e.target.value || '')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="">Pilih</option>
                <option value="L">Laki-laki</option>
                <option value="P">Perempuan</option>
              </select>
              {errors.jenis_kelamin && (
                <div className="text-red-500 text-xs mt-1">{errors.jenis_kelamin}</div>
              )}
            </div>

            {/* Email */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={data.email}
                onChange={(e) => setData('email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              {errors.email && <div className="text-red-500 text-xs mt-1">{errors.email}</div>}
            </div>

            {/* Password */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password Baru <span className="text-gray-500">(opsional)</span>
              </label>
              <input
                type="password"
                value={data.password}
                onChange={(e) => setData('password', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Kosongkan jika tidak ingin ganti"
              />
              {errors.password && (
                <div className="text-red-500 text-xs mt-1">{errors.password}</div>
              )}
            </div>

            {/* Konfirmasi Password */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Konfirmasi Password Baru
              </label>
              <input
                type="password"
                value={data.password_confirmation}
                onChange={(e) => setData('password_confirmation', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Ulangi password baru"
              />
              {errors.password_confirmation && (
                <div className="text-red-500 text-xs mt-1">
                  {errors.password_confirmation}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={close}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
              disabled={processing}
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={processing}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg hover:from-blue-700 hover:to-indigo-800 disabled:opacity-50 transition"
            >
              {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
