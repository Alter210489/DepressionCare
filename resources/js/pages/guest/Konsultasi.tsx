import React, { useState, useMemo } from 'react';
import { Head, useForm } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';

export default function GuestKonsultasi({ gejalaByKategori, kategoriOptions, fakultasList, totalGejala }) {
    const { data, setData, post, processing, errors } = useForm({
        jawaban: [],
        nama: '',
        email: '',
        nim: '',
        fakultas: '',
        program_studi: '',
        umur: '',
        jenis_kelamin: ''
    });

    // Calculate progress percentage
    const progressPercentage = useMemo(() => {
        return totalGejala > 0 ? Math.round((data.jawaban.length / totalGejala) * 100) : 0;
    }, [data.jawaban.length, totalGejala]);

    // Check if all required fields are filled
    const isPersonalDataComplete = useMemo(() => {
        return data.nama.trim() !== '' &&
               data.email.trim() !== '' &&
               data.nim.trim() !== '' &&
               data.fakultas !== '' &&
               data.program_studi.trim() !== '' &&
               data.umur !== '' &&
               data.jenis_kelamin !== '';
    }, [data.nama, data.email, data.nim, data.fakultas, data.program_studi, data.umur, data.jenis_kelamin]);

    const isAllSymptomsAnswered = useMemo(() => {
        return data.jawaban.length === totalGejala;
    }, [data.jawaban.length, totalGejala]);

    const canSubmit = useMemo(() => {
        return isPersonalDataComplete && isAllSymptomsAnswered && !processing;
    }, [isPersonalDataComplete, isAllSymptomsAnswered, processing]);

    const handleGejalaChange = (idGejala, opsiTerpilih) => {
        const updatedJawaban = data.jawaban.filter(j => j.id_gejala !== idGejala);
        if (opsiTerpilih !== null) {
            updatedJawaban.push({ id_gejala: idGejala, opsi_terpilih: opsiTerpilih });
        }
        setData('jawaban', updatedJawaban);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!canSubmit) {
            return;
        }

        post(route('guest.konsultasi.process'));
    };

    return (
        <GuestLayout>
            <Head title="Konsultasi Depresi - Guest" />

            <div className="max-w-5xl mx-auto py-8 px-4 space-y-8">
                {/* Hero Section */}
                <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl shadow-xl">
                    <div className="absolute inset-0 bg-black/10"></div>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-24 -translate-x-24"></div>
                    <div className="relative px-8 py-12 text-white">
                        <div className="max-w-3xl">
                            <h1 className="text-4xl font-bold mb-4 leading-tight">
                                Konsultasi Depresi
                            </h1>
                            <p className="text-xl opacity-90 mb-6">
                                Evaluasi kesehatan mental Anda dengan sistem diagnosa berbasis kecerdasan buatan
                            </p>
                            <div className="flex items-center space-x-6 text-sm">
                                <div className="flex items-center space-x-2">
                                    <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                                    <span>100% Konfidensial</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                                    <span>Hasil Instan</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                                    <span>{totalGejala} Gejala</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">Progress Konsultasi</h3>
                        <span className="text-2xl font-bold text-blue-600">{progressPercentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${progressPercentage}%` }}
                        ></div>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                        <p className="text-sm text-gray-600">
                            {data.jawaban.length} dari {totalGejala} gejala telah terjawab
                        </p>
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                                <div className={`w-3 h-3 rounded-full ${isPersonalDataComplete ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                <span className="text-xs font-medium text-gray-600">Data Personal</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <div className={`w-3 h-3 rounded-full ${isAllSymptomsAnswered ? 'bg-green-500' : 'bg-orange-500'}`}></div>
                                <span className="text-xs font-medium text-gray-600">Semua Gejala</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Required Info Banner */}
                <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-red-50 border-l-4 border-amber-400 rounded-2xl shadow-lg overflow-hidden">
                    <div className="p-6">
                        <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0 w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                                <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <h4 className="text-lg font-bold text-amber-800 mb-4 flex items-center space-x-2">
                                    <span>Persyaratan Konsultasi</span>
                                </h4>
                                <ul className="space-y-3 text-amber-700 text-sm">
                                    <li className="flex items-start space-x-3">
                                        <span className="text-red-500 font-bold">•</span>
                                        <span><strong>Data Personal harus diisi lengkap</strong> (Nama, Email, NIM, Fakultas, Program Studi, Usia, Jenis Kelamin)</span>
                                    </li>
                                    <li className="flex items-start space-x-3">
                                        <span className="text-orange-500 font-bold">•</span>
                                        <span><strong>Semua {totalGejala} gejala harus dijawab</strong> untuk mendapatkan diagnosis yang akurat</span>
                                    </li>
                                    <li className="flex items-start space-x-3">
                                        <span className="text-blue-500 font-bold">•</span>
                                        <span>Jawablah dengan jujur sesuai kondisi Anda saat ini</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Personal Info Section - EXPANDED WITH NEW FIELDS */}
                    <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 overflow-hidden">
                        <div className="bg-gradient-to-r from-red-50 to-pink-50 px-6 py-4 border-b border-red-200">
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg flex items-center justify-center">
                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-800">Data Personal Mahasiswa</h3>
                                {isPersonalDataComplete && (
                                    <span className="flex items-center space-x-1 text-green-600">
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        <span className="text-xs font-medium">Lengkap</span>
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Row 1: Nama dan Email */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700">
                                        Nama Lengkap <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.nama}
                                        onChange={e => setData('nama', e.target.value)}
                                        className={`w-full px-4 py-3 rounded-xl border ${errors.nama ? 'border-red-500 bg-red-50' : 'border-gray-300'} focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 bg-white/50`}
                                        placeholder="Masukkan nama lengkap Anda"
                                        required
                                    />
                                    {errors.nama && (
                                        <p className="text-red-500 text-xs mt-1 flex items-center space-x-1">
                                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                            <span>{errors.nama}</span>
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700">
                                        Email <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        value={data.email}
                                        onChange={e => setData('email', e.target.value)}
                                        className={`w-full px-4 py-3 rounded-xl border ${errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'} focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 bg-white/50`}
                                        placeholder="contoh@mahasiswa.ac.id"
                                        required
                                    />
                                    {errors.email && (
                                        <p className="text-red-500 text-xs mt-1 flex items-center space-x-1">
                                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                            <span>{errors.email}</span>
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Row 2: NIM dan Fakultas */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700">
                                        NIM <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.nim}
                                        onChange={e => setData('nim', e.target.value)}
                                        className={`w-full px-4 py-3 rounded-xl border ${errors.nim ? 'border-red-500 bg-red-50' : 'border-gray-300'} focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 bg-white/50`}
                                        placeholder="Masukkan NIM Anda"
                                        required
                                    />
                                    {errors.nim && (
                                        <p className="text-red-500 text-xs mt-1 flex items-center space-x-1">
                                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                            <span>{errors.nim}</span>
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700">
                                        Fakultas <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={data.fakultas}
                                        onChange={e => setData('fakultas', e.target.value)}
                                        className={`w-full px-4 py-3 rounded-xl border ${errors.fakultas ? 'border-red-500 bg-red-50' : 'border-gray-300'} focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 bg-white/50`}
                                        required
                                    >
                                        <option value="">Pilih Fakultas...</option>
                                        {fakultasList && fakultasList.map((fakultas, index) => (
                                            <option key={index} value={fakultas}>{fakultas}</option>
                                        ))}
                                    </select>
                                    {errors.fakultas && (
                                        <p className="text-red-500 text-xs mt-1 flex items-center space-x-1">
                                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                            <span>{errors.fakultas}</span>
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Row 3: Program Studi */}
                            <div className="grid grid-cols-1 gap-6">
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700">
                                        Program Studi <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.program_studi}
                                        onChange={e => setData('program_studi', e.target.value)}
                                        className={`w-full px-4 py-3 rounded-xl border ${errors.program_studi ? 'border-red-500 bg-red-50' : 'border-gray-300'} focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 bg-white/50`}
                                        placeholder="Contoh: Sistem Informasi, Teknik Informatika, dll."
                                        required
                                    />
                                    {errors.program_studi && (
                                        <p className="text-red-500 text-xs mt-1 flex items-center space-x-1">
                                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                            <span>{errors.program_studi}</span>
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Row 4: Usia dan Jenis Kelamin */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700">
                                        Usia <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        value={data.umur}
                                        onChange={e => setData('umur', e.target.value)}
                                        className={`w-full px-4 py-3 rounded-xl border ${errors.umur ? 'border-red-500 bg-red-50' : 'border-gray-300'} focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 bg-white/50`}
                                        min="16" max="100"
                                        placeholder="Usia Anda"
                                        required
                                    />
                                    {errors.umur && (
                                        <p className="text-red-500 text-xs mt-1 flex items-center space-x-1">
                                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                            <span>{errors.umur}</span>
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700">
                                        Jenis Kelamin <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={data.jenis_kelamin}
                                        onChange={e => setData('jenis_kelamin', e.target.value)}
                                        className={`w-full px-4 py-3 rounded-xl border ${errors.jenis_kelamin ? 'border-red-500 bg-red-50' : 'border-gray-300'} focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 bg-white/50`}
                                        required
                                    >
                                        <option value="">Pilih jenis kelamin...</option>
                                        <option value="L">Laki-laki</option>
                                        <option value="P">Perempuan</option>
                                    </select>
                                    {errors.jenis_kelamin && (
                                        <p className="text-red-500 text-xs mt-1 flex items-center space-x-1">
                                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                            <span>{errors.jenis_kelamin}</span>
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Symptoms Questions */}
                    <div className="space-y-8">
                        {Object.entries(gejalaByKategori).map(([kategori, gejalaList]) => {
                            return (
                                <div key={kategori} className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 overflow-hidden">
                                    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4">
                                        <h3 className="text-xl font-bold text-white capitalize flex items-center space-x-3">
                                            <span className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                                                <span className="text-sm">📊</span>
                                            </span>
                                            <span>{kategori.replace('_', ' ')}</span>
                                            <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
                                                {gejalaList.length} gejala
                                            </span>
                                        </h3>
                                    </div>

                                    <div className="p-6 space-y-6">
                                        {gejalaList.map((gejala, gejalaIndex) => {
                                            const jawabanSaatIni = data.jawaban.find(j => j.id_gejala === gejala.id);
                                            const isAnswered = jawabanSaatIni !== undefined;

                                            return (
                                                <div key={gejala.id} className={`bg-gradient-to-r from-gray-50 to-white rounded-xl p-6 border ${isAnswered ? 'border-green-300 shadow-md' : 'border-gray-200 shadow-sm'} hover:shadow-md transition-all duration-200`}>
                                                    <div className="flex items-start space-x-4 mb-4">
                                                        <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm ${isAnswered ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-gradient-to-r from-gray-500 to-slate-600'}`}>
                                                            {isAnswered ? '✓' : gejalaIndex + 1}
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="font-semibold text-gray-800 text-lg leading-relaxed flex items-center space-x-2">
                                                                <span className="text-blue-600 font-mono text-sm">{gejala.kode}</span>
                                                                <span>-</span>
                                                                <span>{gejala.nama}</span>
                                                            </p>
                                                            {gejala.deskripsi && (
                                                                <p className="text-gray-600 mt-2 leading-relaxed">{gejala.deskripsi}</p>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                                        {gejala.opsi_jawaban?.map((opsi, index) => {
                                                            const isSelected = jawabanSaatIni?.opsi_terpilih === index;
                                                            return (
                                                                <label
                                                                    key={index}
                                                                    className={`relative flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:scale-[1.02] ${
                                                                        isSelected
                                                                            ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md border-transparent'
                                                                            : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200 hover:border-gray-300'
                                                                    }`}
                                                                >
                                                                    <input
                                                                        type="radio"
                                                                        name={`gejala_${gejala.id}`}
                                                                        value={index}
                                                                        checked={isSelected}
                                                                        onChange={() => handleGejalaChange(gejala.id, index)}
                                                                        className="sr-only"
                                                                        required
                                                                    />
                                                                    <div className="flex items-center space-x-3 w-full">
                                                                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-current' : 'border-gray-400'}`}>
                                                                            {isSelected && (
                                                                                <div className="w-2 h-2 rounded-full bg-current"></div>
                                                                            )}
                                                                        </div>
                                                                        <span className="text-sm font-medium">{opsi.text}</span>
                                                                    </div>
                                                                    {isSelected && (
                                                                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-current rounded-full flex items-center justify-center">
                                                                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                            </svg>
                                                                        </div>
                                                                    )}
                                                                </label>
                                                            );
                                                        }) || (
                                                            <div className="col-span-full p-4 bg-red-50 border border-red-200 rounded-xl">
                                                                <p className="text-red-600 text-sm font-medium">Opsi jawaban tidak tersedia</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Submit Section */}
                    <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-8 text-center">
                        <div className="max-w-md mx-auto space-y-6">
                            <div className="space-y-2">
                                <h3 className="text-xl font-bold text-gray-800">Siap untuk Diagnosa?</h3>
                                <p className="text-gray-600">
                                    Anda telah menjawab {data.jawaban.length} dari {totalGejala} gejala yang tersedia
                                </p>
                                {!canSubmit && (
                                    <div className="space-y-2">
                                        {!isPersonalDataComplete && (
                                            <p className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg border border-red-200">
                                                Data personal belum lengkap
                                            </p>
                                        )}
                                        {!isAllSymptomsAnswered && (
                                            <p className="text-sm text-orange-600 bg-orange-50 px-4 py-2 rounded-lg border border-orange-200">
                                                Masih ada {totalGejala - data.jawaban.length} gejala yang belum dijawab
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={!canSubmit}
                                className={`group relative w-full py-4 px-8 rounded-xl font-semibold text-lg transition-all duration-300 transform ${
                                    !canSubmit
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 hover:scale-105 shadow-lg hover:shadow-xl'
                                }`}
                            >
                                {processing ? (
                                    <div className="flex items-center justify-center space-x-3">
                                        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span>Memproses Diagnosa...</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center space-x-3">
                                        <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                        </svg>
                                        <span>Mulai Diagnosa Sekarang</span>
                                    </div>
                                )}
                            </button>

                            {!canSubmit && (
                                <p className="text-sm text-amber-600 bg-amber-50 px-4 py-2 rounded-lg border border-amber-200">
                                    Lengkapi semua data personal dan jawab semua gejala untuk memulai diagnosa
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Error Messages */}
                    {Object.keys(errors).length > 0 && (
                        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 shadow-lg">
                            <div className="flex items-center space-x-3 mb-4">
                                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-red-800">Terjadi Kesalahan</h3>
                            </div>
                            <ul className="space-y-2">
                                {Object.entries(errors).map(([key, message]) => (
                                    <li key={key} className="flex items-center space-x-2 text-red-700">
                                        <span className="text-red-500">•</span>
                                        <span>{message}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </form>
            </div>
        </GuestLayout>
    );
}
