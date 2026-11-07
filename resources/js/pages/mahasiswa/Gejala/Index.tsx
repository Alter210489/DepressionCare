import React, { useState, useEffect } from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import {
  MagnifyingGlassIcon,
  EyeIcon,
  FunnelIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
  TagIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Bars3Icon,
  ListBulletIcon,
  ClockIcon,
  ArrowLeftIcon,
  HomeIcon,
  AdjustmentsHorizontalIcon,
} from '@heroicons/react/24/outline';

interface Gejala {
  id_gejala: number;
  kode_gejala: string;
  nama_gejala: string;
  deskripsi: string;
  kategori_gejala: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
  formatted_kode?: string;
  formatted_kategori?: string;
}

interface PaginationData {
  data: Gejala[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

interface Filters {
  search?: string;
  kategori?: string;
}

interface Statistics {
  total: number;
  per_kategori: Record<string, number>;
  kategori_terbanyak?: string;
}

interface KategoriOption {
  value: string;
  label: string;
}

interface Props {
  gejala: PaginationData;
  filters: Filters;
  kategoriOptions: KategoriOption[];
  statistics: Statistics;
}

const Index: React.FC<Props> = ({ gejala, filters, kategoriOptions, statistics }) => {
  const [search, setSearch] = useState(filters.search || '');
  const [kategori, setKategori] = useState(filters.kategori || '');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [loading, setLoading] = useState(false);

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    router.get(route('mahasiswa.gejala.index'), {
      search,
      kategori,
      per_page: gejala.per_page
    }, {
      preserveState: true,
      replace: true,
      onFinish: () => setLoading(false),
    });
  };

  // Handle filter change
  const handleFilterChange = (newKategori: string) => {
    setKategori(newKategori);
    setLoading(true);
    router.get(route('mahasiswa.gejala.index'), {
      search,
      kategori: newKategori,
      per_page: gejala.per_page
    }, {
      preserveState: true,
      replace: true,
      onFinish: () => setLoading(false),
    });
  };

  // Handle per page change
  const handlePerPageChange = (perPage: number) => {
    setLoading(true);
    router.get(route('mahasiswa.gejala.index'), {
      search,
      kategori,
      per_page: perPage
    }, {
      preserveState: true,
      replace: true,
      onFinish: () => setLoading(false),
    });
  };

  // Clear filters
  const clearFilters = () => {
    setSearch('');
    setKategori('');
    setLoading(true);
    router.get(route('mahasiswa.gejala.index'), {}, {
      preserveState: true,
      replace: true,
      onFinish: () => setLoading(false),
    });
  };

  // Get kategori color
  const getKategoriColor = (kategoriValue: string) => {
    const colors: Record<string, string> = {
      'fisik': 'bg-blue-100 text-blue-800',
      'psikologis': 'bg-purple-100 text-purple-800',
      'sosial': 'bg-green-100 text-green-800',
      'akademik': 'bg-yellow-100 text-yellow-800',
      'emosional': 'bg-red-100 text-red-800',
      'kognitif': 'bg-indigo-100 text-indigo-800',
    };
    return colors[kategoriValue.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  // Pagination component
  const Pagination = () => {
    const { current_page, last_page, from, to, total } = gejala;

    const getPageNumbers = () => {
      const pages = [];
      const maxVisiblePages = 5;

      let startPage = Math.max(1, current_page - Math.floor(maxVisiblePages / 2));
      let endPage = Math.min(last_page, startPage + maxVisiblePages - 1);

      if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      return pages;
    };

    const goToPage = (page: number) => {
      if (page === current_page) return;
      setLoading(true);
      router.get(route('mahasiswa.gejala.index'), {
        search,
        kategori,
        per_page: gejala.per_page,
        page
      }, {
        preserveState: true,
        replace: true,
        onFinish: () => setLoading(false),
      });
    };

    return (
      <div className="flex items-center justify-between bg-white/80 backdrop-blur-xl px-4 py-4 sm:px-6 rounded-b-2xl">
        <div className="flex flex-1 justify-between sm:hidden">
          <button
            onClick={() => goToPage(current_page - 1)}
            disabled={current_page === 1}
            className="relative inline-flex items-center rounded-xl border border-gray-300 bg-white/80 backdrop-blur-xl px-4 py-2 text-sm font-medium text-gray-700 hover:bg-white hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            Previous
          </button>
          <button
            onClick={() => goToPage(current_page + 1)}
            disabled={current_page === last_page}
            className="relative ml-3 inline-flex items-center rounded-xl border border-gray-300 bg-white/80 backdrop-blur-xl px-4 py-2 text-sm font-medium text-gray-700 hover:bg-white hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            Next
          </button>
        </div>
        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Menampilkan <span className="font-medium">{from}</span> sampai{' '}
              <span className="font-medium">{to}</span> dari{' '}
              <span className="font-medium">{total}</span> hasil
            </p>
          </div>
          <div>
            <nav className="isolate inline-flex -space-x-px rounded-xl shadow-lg" aria-label="Pagination">
              <button
                onClick={() => goToPage(current_page - 1)}
                disabled={current_page === 1}
                className="relative inline-flex items-center rounded-l-xl px-2 py-2 text-gray-400 bg-white/80 backdrop-blur-xl hover:bg-white hover:shadow-lg focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                <ChevronLeftIcon className="h-5 w-5" />
              </button>

              {getPageNumbers().map((page) => (
                <button
                  key={page}
                  onClick={() => goToPage(page)}
                  className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                    page === current_page
                      ? 'z-10 bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                      : 'text-gray-900 bg-white/80 backdrop-blur-xl hover:bg-white hover:shadow-lg focus:z-20 focus:outline-offset-0'
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => goToPage(current_page + 1)}
                disabled={current_page === last_page}
                className="relative inline-flex items-center rounded-r-xl px-2 py-2 text-gray-400 bg-white/80 backdrop-blur-xl hover:bg-white hover:shadow-lg focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                <ChevronRightIcon className="h-5 w-5" />
              </button>
            </nav>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <Head title="Daftar Gejala - Mahasiswa" />

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
        {/* Enhanced Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 shadow-xl">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-24 -translate-x-24"></div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            {/* Back Button */}
            <div className="mb-6">
              <Link
                href={route('mahasiswa.dashboard')}
                className="group inline-flex items-center space-x-3 bg-white/10 hover:bg-white/20 backdrop-blur-xl text-white px-4 py-3 rounded-xl border border-white/20 hover:border-white/30 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <ArrowLeftIcon className="h-5 w-5 group-hover:-translate-x-1 transition-transform duration-200" />
                <span className="font-semibold">Kembali ke Dashboard</span>
              </Link>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div className="max-w-3xl">
                <div className="flex items-center space-x-2 mb-3">
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur-xl">
                    <ClipboardDocumentListIcon className="h-6 w-6 text-white" />
                  </div>
                  <nav className="flex text-sm text-blue-100" aria-label="Breadcrumb">
                    <Link href={route('mahasiswa.dashboard')} className="hover:text-white transition-colors duration-200">
                      Dashboard
                    </Link>
                    <span className="mx-2">/</span>
                    <span className="text-white font-medium">Daftar Gejala</span>
                  </nav>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-3">
                  Daftar Gejala
                </h1>
                <p className="text-lg sm:text-xl text-blue-100 leading-relaxed">
                  Informasi lengkap tentang gejala-gejala yang dapat diidentifikasi sistem
                </p>
                <div className="flex flex-wrap items-center gap-4 sm:gap-6 mt-6 text-sm">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                    <span className="text-blue-100">{statistics.total} Total Gejala</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></span>
                    <span className="text-blue-100">{Object.keys(statistics.per_kategori).length} Kategori</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>
                    <span className="text-blue-100">Metode Ilmiah</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <Link
                    href={route('mahasiswa.konsultasi.start')}
                    className="group bg-white hover:bg-gray-50 text-blue-600 hover:text-blue-700 px-4 sm:px-6 py-3 rounded-xl hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2 border-2 border-white shadow-lg hover:shadow-xl font-semibold"
                >
                    <ClipboardDocumentListIcon className="h-5 w-5 group-hover:scale-110 transition-transform" />
                    <span>Mulai Konsultasi</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Enhanced Statistics Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-4 sm:p-6 hover:scale-105 transition-all duration-300">
              <div className="flex items-center">
                <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600">
                  <ClipboardDocumentListIcon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-3 sm:ml-4">
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Total Gejala</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{statistics.total}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-4 sm:p-6 hover:scale-105 transition-all duration-300">
              <div className="flex items-center">
                <div className="p-3 rounded-xl bg-gradient-to-r from-green-500 to-green-600">
                  <TagIcon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-3 sm:ml-4">
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Kategori</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{Object.keys(statistics.per_kategori).length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-4 sm:p-6 hover:scale-105 transition-all duration-300">
              <div className="flex items-center">
                <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600">
                  <ChartBarIcon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Terbanyak</p>
                  <p className="text-sm sm:text-lg font-medium text-gray-900 capitalize truncate">
                    {statistics.kategori_terbanyak || 'Tidak ada'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-4 sm:p-6 hover:scale-105 transition-all duration-300">
              <div className="flex items-center">
                <div className="p-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600">
                  <EyeIcon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-3 sm:ml-4">
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Ditampilkan</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{gejala.data.length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Category Distribution */}
          {Object.keys(statistics.per_kategori).length > 0 && (
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-4 sm:p-6 mb-6 sm:mb-8 hover:shadow-xl transition-all duration-300">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 sm:mb-6">Distribusi per Kategori</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {Object.entries(statistics.per_kategori).map(([kategori, count]) => (
                  <div key={kategori} className="text-center group hover:scale-105 transition-all duration-300">
                    <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-xl mx-auto mb-2 flex items-center justify-center ${getKategoriColor(kategori)} group-hover:shadow-lg transition-all duration-300`}>
                      <span className="text-lg sm:text-2xl font-bold">{count}</span>
                    </div>
                    <p className="text-xs sm:text-sm font-medium text-gray-900 capitalize">{kategori}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Enhanced Filters and Search */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-4 sm:p-6 mb-6 hover:shadow-xl transition-all duration-300">
            <div className="flex flex-col space-y-4">
              {/* Search */}
              <form onSubmit={handleSearch} className="w-full">
                <div className="relative">
                  <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Cari gejala berdasarkan kode atau nama..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/70 backdrop-blur-xl transition-all duration-200"
                  />
                </div>
              </form>

              {/* Filter Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 sm:space-x-4">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-xl hover:bg-white hover:shadow-lg bg-white/70 backdrop-blur-xl transition-all duration-300"
                  >
                    <AdjustmentsHorizontalIcon className="h-5 w-5" />
                    <span className="font-medium">Filter</span>
                  </button>

                  <div className="flex items-center space-x-1 border border-gray-300 rounded-xl p-1 bg-white/70 backdrop-blur-xl">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded-lg transition-all duration-200 ${viewMode === 'grid' ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                      <Bars3Icon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded-lg transition-all duration-200 ${viewMode === 'list' ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                      <ListBulletIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <select
                  value={gejala.per_page}
                  onChange={(e) => handlePerPageChange(Number(e.target.value))}
                  className="border border-gray-300 rounded-xl px-3 py-2 text-sm bg-white/70 backdrop-blur-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value={10}>10 per halaman</option>
                  <option value={25}>25 per halaman</option>
                  <option value={50}>50 per halaman</option>
                  <option value={100}>100 per halaman</option>
                </select>
              </div>

              {/* Filter Options */}
              {showFilters && (
                <div className="pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Kategori</label>
                      <select
                        value={kategori}
                        onChange={(e) => handleFilterChange(e.target.value)}
                        className="w-full border border-gray-300 rounded-xl px-3 py-2 bg-white/70 backdrop-blur-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      >
                        <option value="">Semua Kategori</option>
                        {kategoriOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center space-x-4">
                    <button
                      onClick={clearFilters}
                      className="text-sm text-gray-600 hover:text-gray-800 flex items-center space-x-1 hover:bg-gray-100 px-3 py-2 rounded-lg transition-all duration-200"
                    >
                      <XMarkIcon className="h-4 w-4" />
                      <span>Hapus Filter</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Enhanced Loading Indicator */}
          {loading && (
            <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 flex items-center space-x-3 shadow-2xl border border-white/20">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="font-medium">Memuat data...</span>
              </div>
            </div>
          )}

          {/* Enhanced Content */}
          {gejala.data.length > 0 ? (
            <>
              {viewMode === 'grid' ? (
                /* Enhanced Grid View */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
                  {gejala.data.map((item) => {
                    return (
                      <div key={item.id_gejala} className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 overflow-hidden">
                        <div className="p-4 sm:p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-2">
                              <span className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                                {item.formatted_kode || item.kode_gejala}
                              </span>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getKategoriColor(item.kategori_gejala)}`}>
                                {(item.formatted_kategori || item.kategori_gejala).substring(0, 8)}
                              </span>
                            </div>
                          </div>

                          <h3 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2 leading-tight">
                            {item.nama_gejala}
                          </h3>

                          <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
                            {item.deskripsi}
                          </p>

                          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                            <div className="flex items-center space-x-1 text-xs text-gray-500">
                              <InformationCircleIcon className="h-4 w-4" />
                              <span>Detail lengkap</span>
                            </div>
                            <Link
                              href={route('mahasiswa.gejala.show', item.id_gejala)}
                              className="inline-flex items-center space-x-1 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-3 py-2 rounded-lg transition-all duration-200"
                            >
                              <EyeIcon className="h-4 w-4" />
                              <span>Lihat</span>
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Enhanced List View - Tanpa Kolom Tingkat */
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 overflow-hidden mb-6 sm:mb-8 hover:shadow-xl transition-all duration-300">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gradient-to-r from-gray-50 to-blue-50">
                        <tr>
                          <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Kode & Nama Gejala
                          </th>
                          <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Kategori
                          </th>
                          <th className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Deskripsi
                          </th>
                          <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Aksi
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white/60 backdrop-blur-xl divide-y divide-gray-200">
                        {gejala.data.map((item) => {
                          return (
                            <tr key={item.id_gejala} className="hover:bg-blue-50 transition-all duration-200">
                              <td className="px-4 sm:px-6 py-4">
                                <div>
                                  <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">
                                    {item.formatted_kode || item.kode_gejala}
                                  </span>
                                  <p className="text-sm font-medium text-gray-900 mt-1 line-clamp-2">
                                    {item.nama_gejala}
                                  </p>
                                </div>
                              </td>
                              <td className="px-4 sm:px-6 py-4">
                                <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${getKategoriColor(item.kategori_gejala)}`}>
                                  {(item.formatted_kategori || item.kategori_gejala).substring(0, 10)}
                                </span>
                              </td>
                              <td className="hidden lg:table-cell px-6 py-4">
                                <p className="text-sm text-gray-600 line-clamp-2 max-w-xs">
                                  {item.deskripsi}
                                </p>
                              </td>
                              <td className="px-4 sm:px-6 py-4 text-sm font-medium">
                                <Link
                                  href={route('mahasiswa.gejala.show', item.id_gejala)}
                                  className="text-blue-600 hover:text-blue-800 flex items-center space-x-1 hover:bg-blue-50 px-3 py-2 rounded-lg transition-all duration-200"
                                >
                                  <EyeIcon className="h-4 w-4" />
                                  <span>Detail</span>
                                </Link>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Enhanced Pagination */}
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 overflow-hidden hover:shadow-xl transition-all duration-300">
                <Pagination />
              </div>
            </>
          ) : (
            /* Enhanced Empty State */
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-8 sm:p-12 text-center hover:shadow-xl transition-all duration-300">
              <div className="w-20 h-20 bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                <ClipboardDocumentListIcon className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {filters.search || filters.kategori ? 'Tidak ada gejala yang sesuai' : 'Belum ada data gejala'}
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto leading-relaxed">
                {filters.search || filters.kategori
                  ? 'Coba ubah kriteria pencarian atau filter Anda'
                  : 'Data gejala akan ditampilkan di sini setelah ditambahkan oleh admin'
                }
              </p>
              {(filters.search || filters.kategori) && (
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-xl font-medium transition-all duration-200"
                >
                  <XMarkIcon className="h-4 w-4" />
                  <span>Hapus Filter</span>
                </button>
              )}
            </div>
          )}

          {/* Enhanced Bottom Navigation */}
          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <Link
              href={route('mahasiswa.dashboard')}
              className="inline-flex items-center justify-center px-4 py-3 border border-gray-300 shadow-lg text-sm font-medium rounded-xl text-gray-700 bg-white/80 backdrop-blur-xl hover:bg-white hover:shadow-xl hover:scale-105 transition-all duration-300"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Kembali ke Dashboard
            </Link>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
              <Link
                href={route('mahasiswa.konsultasi.start')}
                className="inline-flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:scale-105 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <ClipboardDocumentListIcon className="h-4 w-4 mr-2" />
                Mulai Konsultasi
              </Link>

              <Link
                href={route('mahasiswa.riwayat-konsultasi.index')}
                className="inline-flex items-center justify-center px-4 py-3 border border-gray-300 shadow-lg text-sm font-medium rounded-xl text-gray-700 bg-white/80 backdrop-blur-xl hover:bg-white hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                <ClockIcon className="h-4 w-4 mr-2" />
                Riwayat Konsultasi
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Index;
