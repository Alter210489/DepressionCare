import React, { useState, FormEvent } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import {
  UserCircleIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  EyeIcon,
  EyeSlashIcon,
} from '@heroicons/react/24/outline';

interface User {
  id: number;
  name: string;
  email: string;
}

interface Mahasiswa {
  id_mahasiswa: number;
  nama: string;
  nim: string;
  fakultas: string;
  program_studi: string;
  usia: number;
  jenis_kelamin: 'L' | 'P';
}

interface Props {
  user: User;
  mahasiswa: Mahasiswa;
  fakultas_options: string[];
}

const Edit: React.FC<Props> = ({ user, mahasiswa, fakultas_options }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);

  // Form for profile update
  const profileForm = useForm({
    name: mahasiswa.nama,
    email: user.email,
    nim: mahasiswa.nim,
    fakultas: mahasiswa.fakultas,
    program_studi: mahasiswa.program_studi,
    usia: mahasiswa.usia,
    jenis_kelamin: mahasiswa.jenis_kelamin,
  });

  // Form for password update
  const passwordForm = useForm({
    current_password: '',
    password: '',
    password_confirmation: '',
  });

  const handleProfileSubmit = (e: FormEvent) => {
    e.preventDefault();
    profileForm.put(route('mahasiswa.profile.update'), {
      preserveScroll: true,
      onSuccess: () => {
        // Success handled by flash message
      },
    });
  };

  const handlePasswordSubmit = (e: FormEvent) => {
    e.preventDefault();
    passwordForm.put(route('mahasiswa.profile.password.update'), {
      preserveScroll: true,
      onSuccess: () => {
        passwordForm.reset();
      },
    });
  };

  return (
    <>
      <Head title="Edit Profil" />

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-700 to-purple-700 shadow-xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Edit Profil</h1>
                <p className="text-blue-100">Perbarui informasi profil dan keamanan akun</p>
              </div>
              <Link
                href={route('mahasiswa.profile.index')}
                className="flex items-center space-x-2 px-6 py-3 bg-white/10 text-white border-2 border-white/20 rounded-xl font-semibold hover:bg-white/20 transition-all duration-300 backdrop-blur-xl"
              >
                <ArrowLeftIcon className="h-5 w-5" />
                <span>Kembali</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Tab Navigation */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 mb-6">
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex-1 px-6 py-4 text-center font-semibold transition-all duration-200 ${
                  activeTab === 'profile'
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Informasi Profil
              </button>
              <button
                onClick={() => setActiveTab('password')}
                className={`flex-1 px-6 py-4 text-center font-semibold transition-all duration-200 ${
                  activeTab === 'password'
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Ubah Password
              </button>
            </div>
          </div>

          {/* Profile Form */}
          {activeTab === 'profile' && (
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-8">
              <form onSubmit={handleProfileSubmit} className="space-y-6">
                {/* Success Message */}
                {profileForm.recentlySuccessful && (
                  <div className="flex items-center space-x-3 p-4 bg-green-100 border border-green-200 rounded-xl">
                    <CheckCircleIcon className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span className="text-green-800 font-medium">Profil berhasil diperbarui!</span>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Nama Lengkap */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nama Lengkap <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={profileForm.data.name}
                      onChange={(e) => profileForm.setData('name', e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl border ${
                        profileForm.errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                      } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                      placeholder="Masukkan nama lengkap"
                    />
                    {profileForm.errors.name && (
                      <p className="mt-2 text-sm text-red-600 flex items-center space-x-1">
                        <ExclamationCircleIcon className="h-4 w-4" />
                        <span>{profileForm.errors.name}</span>
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={profileForm.data.email}
                      onChange={(e) => profileForm.setData('email', e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl border ${
                        profileForm.errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                      } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                      placeholder="Masukkan email"
                    />
                    {profileForm.errors.email && (
                      <p className="mt-2 text-sm text-red-600 flex items-center space-x-1">
                        <ExclamationCircleIcon className="h-4 w-4" />
                        <span>{profileForm.errors.email}</span>
                      </p>
                    )}
                  </div>

                  {/* NIM */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      NIM <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={profileForm.data.nim}
                      onChange={(e) => profileForm.setData('nim', e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl border ${
                        profileForm.errors.nim ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                      } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                      placeholder="Masukkan NIM"
                    />
                    {profileForm.errors.nim && (
                      <p className="mt-2 text-sm text-red-600 flex items-center space-x-1">
                        <ExclamationCircleIcon className="h-4 w-4" />
                        <span>{profileForm.errors.nim}</span>
                      </p>
                    )}
                  </div>

                  {/* Usia */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Usia <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="17"
                      max="100"
                      value={profileForm.data.usia}
                      onChange={(e) => profileForm.setData('usia', parseInt(e.target.value))}
                      className={`w-full px-4 py-3 rounded-xl border ${
                        profileForm.errors.usia ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                      } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                      placeholder="Masukkan usia"
                    />
                    {profileForm.errors.usia && (
                      <p className="mt-2 text-sm text-red-600 flex items-center space-x-1">
                        <ExclamationCircleIcon className="h-4 w-4" />
                        <span>{profileForm.errors.usia}</span>
                      </p>
                    )}
                  </div>

                  {/* Jenis Kelamin */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Jenis Kelamin <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={profileForm.data.jenis_kelamin}
                      onChange={(e) => profileForm.setData('jenis_kelamin', e.target.value as 'L' | 'P')}
                      className={`w-full px-4 py-3 rounded-xl border ${
                        profileForm.errors.jenis_kelamin ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                      } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                    >
                      <option value="L">Laki-laki</option>
                      <option value="P">Perempuan</option>
                    </select>
                    {profileForm.errors.jenis_kelamin && (
                      <p className="mt-2 text-sm text-red-600 flex items-center space-x-1">
                        <ExclamationCircleIcon className="h-4 w-4" />
                        <span>{profileForm.errors.jenis_kelamin}</span>
                      </p>
                    )}
                  </div>

                  {/* Fakultas */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Fakultas <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={profileForm.data.fakultas}
                      onChange={(e) => profileForm.setData('fakultas', e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl border ${
                        profileForm.errors.fakultas ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                      } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                    >
                      <option value="">Pilih Fakultas</option>
                      {fakultas_options.map((fak) => (
                        <option key={fak} value={fak}>{fak}</option>
                      ))}
                    </select>
                    {profileForm.errors.fakultas && (
                      <p className="mt-2 text-sm text-red-600 flex items-center space-x-1">
                        <ExclamationCircleIcon className="h-4 w-4" />
                        <span>{profileForm.errors.fakultas}</span>
                      </p>
                    )}
                  </div>

                  {/* Program Studi */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Program Studi <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={profileForm.data.program_studi}
                      onChange={(e) => profileForm.setData('program_studi', e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl border ${
                        profileForm.errors.program_studi ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                      } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                      placeholder="Masukkan program studi"
                    />
                    {profileForm.errors.program_studi && (
                      <p className="mt-2 text-sm text-red-600 flex items-center space-x-1">
                        <ExclamationCircleIcon className="h-4 w-4" />
                        <span>{profileForm.errors.program_studi}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
                  <Link
                    href={route('mahasiswa.profile.index')}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-all duration-200"
                  >
                    Batal
                  </Link>
                  <button
                    type="submit"
                    disabled={profileForm.processing}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    {profileForm.processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Password Form */}
          {activeTab === 'password' && (
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-8">
              <form onSubmit={handlePasswordSubmit} className="space-y-6">
                {/* Success Message */}
                {passwordForm.recentlySuccessful && (
                  <div className="flex items-center space-x-3 p-4 bg-green-100 border border-green-200 rounded-xl">
                    <CheckCircleIcon className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span className="text-green-800 font-medium">Password berhasil diperbarui!</span>
                  </div>
                )}

                {/* Current Password */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Password Saat Ini <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={passwordForm.data.current_password}
                      onChange={(e) => passwordForm.setData('current_password', e.target.value)}
                      className={`w-full px-4 py-3 pr-12 rounded-xl border ${
                        passwordForm.errors.current_password ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                      } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                      placeholder="Masukkan password saat ini"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showCurrentPassword ? (
                        <EyeSlashIcon className="h-5 w-5" />
                      ) : (
                        <EyeIcon className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {passwordForm.errors.current_password && (
                    <p className="mt-2 text-sm text-red-600 flex items-center space-x-1">
                      <ExclamationCircleIcon className="h-4 w-4" />
                      <span>{passwordForm.errors.current_password}</span>
                    </p>
                  )}
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Password Baru <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={passwordForm.data.password}
                      onChange={(e) => passwordForm.setData('password', e.target.value)}
                      className={`w-full px-4 py-3 pr-12 rounded-xl border ${
                        passwordForm.errors.password ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                      } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                      placeholder="Masukkan password baru"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="h-5 w-5" />
                      ) : (
                        <EyeIcon className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {passwordForm.errors.password && (
                    <p className="mt-2 text-sm text-red-600 flex items-center space-x-1">
                      <ExclamationCircleIcon className="h-4 w-4" />
                      <span>{passwordForm.errors.password}</span>
                    </p>
                  )}
                  <p className="mt-2 text-sm text-gray-600">
                    Password minimal 8 karakter
                  </p>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Konfirmasi Password Baru <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswordConfirmation ? 'text' : 'password'}
                      value={passwordForm.data.password_confirmation}
                      onChange={(e) => passwordForm.setData('password_confirmation', e.target.value)}
                      className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Konfirmasi password baru"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPasswordConfirmation ? (
                        <EyeSlashIcon className="h-5 w-5" />
                      ) : (
                        <EyeIcon className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Security Info */}
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <p className="text-sm text-blue-800">
                    <strong>Tips Keamanan:</strong> Gunakan kombinasi huruf besar, huruf kecil, angka, dan simbol untuk password yang kuat.
                  </p>
                </div>

                {/* Submit Button */}
                <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => passwordForm.reset()}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-all duration-200"
                  >
                    Reset
                  </button>
                  <button
                    type="submit"
                    disabled={passwordForm.processing}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    {passwordForm.processing ? 'Mengubah...' : 'Ubah Password'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Edit;
