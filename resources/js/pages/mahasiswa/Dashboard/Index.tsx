import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
  ChartBarIcon,
  ClipboardDocumentListIcon,
  ClockIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  QuestionMarkCircleIcon,
  HeartIcon,
  ListBulletIcon,
  UserIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CalendarIcon,
  BellIcon,
  ArrowRightIcon,
  ArrowRightOnRectangleIcon,
  InformationCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ShieldCheckIcon,
  ExclamationCircleIcon as AlertIcon,
} from '@heroicons/react/24/outline';

import { Line, Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

import EditProfileModal from '@/components/Modals/EditProfileModal';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, Title, Tooltip, Legend, ArcElement
);

// ============================================================================
// TYPES
// ============================================================================

interface User {
  name: string;
  nim: string;
  fakultas: string;
  program_studi: string;
  email: string;
  usia: number | null;
  jenis_kelamin: 'L' | 'P' | null;
}

interface MonitoringStatus {
  status: 'never' | 'on_track' | 'due_soon' | 'overdue';
  label: string;
  description: string;
  days_since: number | null;
  next_due: string | null;
  color: 'green' | 'yellow' | 'red' | 'gray';
  icon: 'check' | 'clock' | 'warning' | 'question';
}

interface TrendData {
  direction: 'improving' | 'declining' | 'stable';
  message: string;
  percentage: number;
  analysis: string;
  data_points: number;
  consultation_dates: string[];
  cf_values: number[];
  severity_levels: string[];
  cf_change: number;
  severity_change: number;
  pattern: string;
  latest_cf: number;
  avg_previous_cf: number;
}

interface Stats {
  total_konsultasi: number;
  konsultasi_bulan_ini: number;
  target_bulan_ini: number;      // selalu 2
  sisa_target: number;           // 0 jika sudah tercapai
  total_symptoms: number;
  konsultasi_terakhir?: {
    tanggal: string;
    hasil: string;
    nilai_cf: number;
    waktu_lalu: string;
  };
  rata_rata_cf: { value: number; formatted: string };
  status_terakhir: string;
  trend: TrendData;
  monitoring_status: MonitoringStatus;  // ← pengganti streak
  diagnosis_distribution: Record<string, number>;
}

interface RecentActivity {
  id: number;
  tanggal: string;
  tanggal_formatted: string;
  hasil_diagnosa: string;
  nilai_cf: number;
  nilai_cf_formatted: string;
  waktu_lalu: string;
  severity_level: 'normal' | 'mild' | 'moderate' | 'severe' | 'unknown';
}

interface ProgressData {
  monthly_trends: Array<{ month: string; count: number }>;
  weekly_trend: Array<{ week: string; avg_cf: number; total: number; period: string }>;
  diagnosa_distribution: Array<{ hasil_diagnosa: string; total: number }>;
}

interface Recommendation {
  type: string;
  title: string;
  description: string;
  steps?: string[];        // langkah konkret yang ditampilkan sebagai checklist
  action: string;
  url: string;
  priority: 'high' | 'medium' | 'low';
  icon: string;
}

interface Reminder {
  type: string;
  title: string;
  description: string;
  date?: string;
  days_left?: number;
  days_overdue?: number;
  priority: 'high' | 'medium' | 'low';
}

interface ConsultationStatus {
  status: string;
  message: string;
  color: string;
  icon: string;
}

interface LatestConsultation {
  id?: number;
  tanggal_konsultasi?: string;
  hasil_diagnosa?: string;
  nilai_cf?: string;
  rekomendasi?: string;
  waktu_lalu?: string;
  exists: boolean;
}

interface QuickAction {
  title: string;
  description: string;
  route: string;
  icon: string;
  color: string;
}

interface Props {
  user: User;
  stats: Stats;
  recent_activity: RecentActivity[];
  progress_data: ProgressData;
  recommendations: Recommendation[];
  upcoming_reminders: Reminder[];
  consultation_status: ConsultationStatus;
  latest_consultation: LatestConsultation;
  quick_actions: QuickAction[];
  has_consultations: boolean;
}

// ============================================================================
// COMPONENT
// ============================================================================

const Dashboard: React.FC<Props> = ({
  user, stats, recent_activity, progress_data,
  recommendations, upcoming_reminders, consultation_status,
  latest_consultation, quick_actions, has_consultations,
}) => {
  const [showDetailedTrend, setShowDetailedTrend] = useState(false);
  const [showEditModal, setShowEditModal]         = useState(false);

  // ── Route helpers ──────────────────────────────────────────────────────────
  const getRouteUrl = (routeName: string, params?: any) => {
    try { return route(routeName, params); }
    catch { return null; }
  };
  const isRouteAvailable = (routeName: string) => getRouteUrl(routeName) !== null;
  const getCorrectRoute  = (routeName: string) => {
    const map: Record<string, string> = {
      'mahasiswa.konsultasi.create': 'mahasiswa.konsultasi.index',
      'mahasiswa.konsultasi.new':    'mahasiswa.konsultasi.index',
      'mahasiswa.konsultasi.start':  'mahasiswa.konsultasi.index',
      'mahasiswa.konsultasi':        'mahasiswa.konsultasi.index',
      'mahasiswa.riwayat':           'mahasiswa.riwayat-konsultasi.index',
      'mahasiswa.history':           'mahasiswa.riwayat-konsultasi.index',
    };
    return map[routeName] || routeName;
  };

  const handleLogout = () => {
    if (!confirm('Apakah Anda yakin ingin keluar dari sistem?')) return;
    const url = getRouteUrl('logout') ?? getRouteUrl('auth.logout')
             ?? getRouteUrl('mahasiswa.logout');
    if (url) router.post(url);
    else window.location.href = '/';
  };

  // ── Chart data ─────────────────────────────────────────────────────────────
  const monthlyTrendsData = {
    labels: progress_data.monthly_trends.map(i => i.month),
    datasets: [{
      label: 'Jumlah Konsultasi',
      data: progress_data.monthly_trends.map(i => i.count),
      borderColor: 'rgb(59,130,246)', backgroundColor: 'rgba(59,130,246,0.1)',
      tension: 0.4, borderWidth: 3,
      pointBackgroundColor: 'rgb(59,130,246)', pointBorderColor: '#fff', pointBorderWidth: 2,
    }],
  };

  const diagnosisDistributionData = {
    labels: progress_data.diagnosa_distribution.map(i => i.hasil_diagnosa),
    datasets: [{
      data: progress_data.diagnosa_distribution.map(i => i.total),
      backgroundColor: ['rgba(34,197,94,0.8)','rgba(251,191,36,0.8)','rgba(249,115,22,0.8)','rgba(239,68,68,0.8)'],
      borderColor:     ['rgba(34,197,94,1)',   'rgba(251,191,36,1)',  'rgba(249,115,22,1)',  'rgba(239,68,68,1)'],
      borderWidth: 2,
    }],
  };

  const weeklyTrendData = {
    labels: progress_data.weekly_trend.map(i => i.week),
    datasets: [{
      label: 'Rata-rata CF (%)',
      data: progress_data.weekly_trend.map(i => i.avg_cf),
      backgroundColor: 'rgba(147,51,234,0.8)', borderColor: 'rgba(147,51,234,1)',
      borderWidth: 2, borderRadius: 8,
    }],
  };

  // ── Style helpers ──────────────────────────────────────────────────────────
  const getStatusIcon = (status: string) => {
    const m: Record<string, React.ComponentType<any>> = {
      'check-circle': CheckCircleIcon, 'exclamation-triangle': ExclamationTriangleIcon,
      'exclamation-circle': ExclamationCircleIcon, 'x-circle': XCircleIcon,
      'question-mark-circle': QuestionMarkCircleIcon,
    };
    return m[status] || QuestionMarkCircleIcon;
  };

  const getStatusColor = (color: string) => ({
    green:  'text-green-600 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200',
    yellow: 'text-yellow-600 bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200',
    orange: 'text-orange-600 bg-gradient-to-r from-orange-50 to-red-50 border-orange-200',
    red:    'text-red-600 bg-gradient-to-r from-red-50 to-rose-50 border-red-200',
    gray:   'text-gray-600 bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200',
  }[color] ?? 'text-gray-600 bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200');

  const getSeverityColor = (level: string) => ({
    normal:   'text-green-700 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200',
    mild:     'text-yellow-700 bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200',
    moderate: 'text-orange-700 bg-gradient-to-r from-orange-50 to-red-50 border-orange-200',
    severe:   'text-red-700 bg-gradient-to-r from-red-50 to-rose-50 border-red-200',
    unknown:  'text-gray-700 bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200',
  }[level] ?? 'text-gray-700 bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200');

  const getTrendIcon = (direction: string) => {
    if (direction === 'improving') return <ArrowTrendingUpIcon  className="h-6 w-6 text-green-600" />;
    if (direction === 'declining') return <ArrowTrendingDownIcon className="h-6 w-6 text-red-600" />;
    return <ChartBarIcon className="h-6 w-6 text-gray-600" />;
  };

  const getTrendColorClass = (direction: string) => ({
    improving: 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200',
    declining: 'bg-gradient-to-r from-red-50 to-rose-50 border-red-200',
    stable:    'bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200',
  }[direction] ?? 'bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200');

  const getQuickActionIcon = (name: string) => ({
    'clipboard-document-list': ClipboardDocumentListIcon,
    'clock': ClockIcon, 'list-bullet': ListBulletIcon,
    'question-mark-circle': QuestionMarkCircleIcon,
  }[name] ?? QuestionMarkCircleIcon);

  const getQuickActionColor = (color: string) => ({
    blue:   'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700',
    green:  'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700',
    purple: 'bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700',
    yellow: 'bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700',
  }[color] ?? 'bg-gradient-to-r from-gray-500 to-slate-600');

  // ── Monitoring status helpers ───────────────────────────────────────────────
  const monitoringCardStyle = {
    on_track: { bg: 'bg-gradient-to-r from-green-500 to-emerald-600',  badge: 'bg-green-100 text-green-800',   border: 'border-green-200' },
    due_soon: { bg: 'bg-gradient-to-r from-yellow-500 to-amber-600',   badge: 'bg-yellow-100 text-yellow-800', border: 'border-yellow-200' },
    overdue:  { bg: 'bg-gradient-to-r from-red-500 to-rose-600',       badge: 'bg-red-100 text-red-800',       border: 'border-red-200' },
    never:    { bg: 'bg-gradient-to-r from-gray-500 to-slate-600',     badge: 'bg-gray-100 text-gray-800',     border: 'border-gray-200' },
  };

  const MonitoringIcon: React.FC<{ icon: string; className?: string }> = ({ icon, className = 'h-8 w-8' }) => {
    if (icon === 'check')    return <ShieldCheckIcon     className={className} />;
    if (icon === 'clock')    return <ClockIcon           className={className} />;
    if (icon === 'warning')  return <ExclamationTriangleIcon className={className} />;
    return <QuestionMarkCircleIcon className={className} />;
  };

  const ms       = stats.monitoring_status;
  const msStyle  = monitoringCardStyle[ms.status];

  // ── Bulan ini: progress bar ────────────────────────────────────────────────
  const bulanIniPct = Math.min(100, (stats.konsultasi_bulan_ini / stats.target_bulan_ini) * 100);
  const bulanIniReached = stats.konsultasi_bulan_ini >= stats.target_bulan_ini;

  const StatusIcon = getStatusIcon(consultation_status.icon);

  // ============================================================================
  return (
    <>
      <Head title="Dashboard - Mahasiswa" />

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">

        {/* ================================================================ */}
        {/* HEADER                                                            */}
        {/* ================================================================ */}
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-700 to-purple-700">
          <div className="absolute inset-0 bg-black/10" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-48 translate-x-48" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/10 rounded-full translate-y-36 -translate-x-36" />
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-r from-pink-400/20 to-purple-400/20 rounded-full -translate-x-1/2 -translate-y-1/2" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
            {/* Desktop */}
            <div className="hidden lg:flex items-center justify-between">
              <div className="text-white">
                <h1 className="text-4xl font-bold mb-3 leading-tight">Selamat datang, {user.name}!</h1>
                <p className="text-xl opacity-90 mb-4">{user.nim} — {user.program_studi}</p>
                <div className="flex items-center space-x-6 text-sm">
                  {['Dashboard Mahasiswa','Konsultasi Mental Health','CF-Based Diagnosis'].map((t,i) => (
                    <div key={i} className="flex items-center space-x-2">
                      <span className={`w-2 h-2 rounded-full animate-pulse ${['bg-green-400','bg-blue-400','bg-purple-400'][i]}`} />
                      <span>{t}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className={`flex items-center space-x-3 px-6 py-3 rounded-2xl border backdrop-blur-xl shadow-lg ${getStatusColor(consultation_status.color)}`}>
                  <StatusIcon className="h-6 w-6" />
                  <span className="font-semibold">{consultation_status.message}</span>
                </div>
                <button onClick={handleLogout}
                  className="flex items-center space-x-3 px-6 py-3 border-2 border-white/20 text-white bg-white/10 hover:bg-white/20 backdrop-blur-xl rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105">
                  <ArrowRightOnRectangleIcon className="h-5 w-5" />
                  <span className="font-semibold">Keluar</span>
                </button>
              </div>
            </div>

            {/* Mobile */}
            <div className="lg:hidden space-y-4">
              <div className="flex items-start justify-between">
                <div className="text-white flex-1 min-w-0">
                  <h1 className="text-2xl sm:text-3xl font-bold mb-2">{user.name}</h1>
                  <p className="text-lg opacity-90 truncate">{user.nim} — {user.program_studi}</p>
                </div>
                <button onClick={handleLogout}
                  className="flex items-center justify-center w-12 h-12 border-2 border-white/20 text-white bg-white/10 hover:bg-white/20 rounded-2xl transition-all ml-3 flex-shrink-0">
                  <ArrowRightOnRectangleIcon className="h-6 w-6" />
                </button>
              </div>
              <div className={`flex items-center space-x-3 px-4 py-3 rounded-2xl border backdrop-blur-xl shadow-lg ${getStatusColor(consultation_status.color)}`}>
                <StatusIcon className="h-5 w-5 flex-shrink-0" />
                <span className="font-semibold text-sm">{consultation_status.message}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

          {/* ============================================================== */}
          {/* QUICK ACTIONS                                                    */}
          {/* ============================================================== */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Aksi Cepat</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {quick_actions.map((action, index) => {
                const Icon        = getQuickActionIcon(action.icon);
                const corrected   = getCorrectRoute(action.route);
                const routeUrl    = getRouteUrl(corrected);
                if (!routeUrl) return (
                  <div key={index} className="bg-gray-400 text-white p-8 rounded-2xl opacity-50 cursor-not-allowed shadow-lg">
                    <Icon className="h-10 w-10 mb-4" />
                    <h3 className="font-bold text-xl mb-2">{action.title}</h3>
                    <p className="text-sm opacity-90">Route tidak tersedia</p>
                  </div>
                );
                return (
                  <Link key={index} href={routeUrl}
                    className={`${getQuickActionColor(action.color)} text-white p-8 rounded-2xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 block`}>
                    <Icon className="h-10 w-10 mb-4" />
                    <h3 className="font-bold text-xl mb-2">{action.title}</h3>
                    <p className="text-sm opacity-90">{action.description}</p>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* ============================================================== */}
          {/* 4 STATS CARDS                                                   */}
          {/* ============================================================== */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

            {/* 1 — Total Konsultasi */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-8 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center">
                <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg">
                  <ClipboardDocumentListIcon className="h-8 w-8" />
                </div>
                <div className="ml-6">
                  <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Konsultasi</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.total_konsultasi}</p>
                </div>
              </div>
            </div>

            {/* 2 — Bulan Ini + progress bar target 2x */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-8 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center mb-4">
                <div className="p-4 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg">
                  <CalendarIcon className="h-8 w-8" />
                </div>
                <div className="ml-6">
                  <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Bulan Ini</p>
                  {/* Angka besar: "1 / 2" */}
                  <div className="flex items-baseline space-x-1">
                    <p className={`text-3xl font-bold ${bulanIniReached ? 'text-green-600' : 'text-gray-900'}`}>
                      {stats.konsultasi_bulan_ini}
                    </p>
                    <p className="text-lg font-semibold text-gray-400">/ {stats.target_bulan_ini}</p>
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="space-y-1">
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${
                      bulanIniReached ? 'bg-gradient-to-r from-green-400 to-emerald-500' : 'bg-gradient-to-r from-blue-400 to-indigo-500'
                    }`}
                    style={{ width: `${bulanIniPct}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500">
                  {bulanIniReached
                    ? '✓ Target bulan ini tercapai'
                    : `${stats.sisa_target}x lagi untuk mencapai target 2x/bulan`}
                </p>
              </div>
            </div>

            {/* 3 — Rata-rata CF */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-8 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center">
                <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg">
                  <ChartBarIcon className="h-8 w-8" />
                </div>
                <div className="ml-6">
                  <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Rata-rata CF</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.rata_rata_cf.formatted}</p>
                </div>
              </div>
            </div>

            {/* 4 — Status Monitoring (pengganti streak) */}
            <div className={`bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border p-8 hover:shadow-xl transition-all duration-300 ${msStyle.border}`}>
              <div className="flex items-center mb-3">
                <div className={`p-4 rounded-2xl ${msStyle.bg} text-white shadow-lg`}>
                  <MonitoringIcon icon={ms.icon} />
                </div>
                <div className="ml-6">
                  <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Status Monitoring</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`px-2 py-0.5 rounded-full text-sm font-bold ${msStyle.badge}`}>
                      {ms.label}
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">{ms.description}</p>
              {ms.next_due && ms.status !== 'on_track' && (
                <p className="text-xs font-medium text-gray-600 mt-1">
                  Jadwal berikutnya: {ms.next_due}
                </p>
              )}
              {ms.status === 'on_track' && ms.next_due && (
                <p className="text-xs font-medium text-green-600 mt-1">
                  Jadwal berikutnya: {ms.next_due}
                </p>
              )}
            </div>

          </div>

          {/* ============================================================== */}
          {/* MAIN CONTENT                                                     */}
          {/* ============================================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* ── Left column ────────────────────────────────────────────── */}
            <div className="lg:col-span-2 space-y-8">

              {/* Latest Consultation */}
              {latest_consultation.exists && latest_consultation.id ? (
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-8">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">Konsultasi Terakhir</h3>
                  </div>
                  <div className="bg-gradient-to-r from-gray-50 to-white rounded-2xl p-6 border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <span className={`px-4 py-2 rounded-xl text-sm font-bold border ${getSeverityColor('normal')}`}>
                        {latest_consultation.hasil_diagnosa || 'Tidak diketahui'}
                      </span>
                      <span className="text-sm text-gray-500 font-medium">{latest_consultation.waktu_lalu || '-'}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-6 text-sm mb-4">
                      <div>
                        <p className="text-gray-600 font-semibold">Tanggal</p>
                        <p className="font-bold text-gray-900">{latest_consultation.tanggal_konsultasi || '-'}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 font-semibold">Nilai CF</p>
                        <p className="font-bold text-gray-900">{latest_consultation.nilai_cf || '-'}</p>
                      </div>
                    </div>
                    {latest_consultation.rekomendasi && (
                      <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                        <p className="text-sm text-blue-800 font-medium">{latest_consultation.rekomendasi}</p>
                      </div>
                    )}
                    <div className="mt-6 flex flex-wrap gap-3">
                      {/* Tombol detail konsultasi ini */}
                      {isRouteAvailable('mahasiswa.riwayat-konsultasi.show') && (
                        <Link href={route('mahasiswa.riwayat-konsultasi.show', latest_consultation.id)}
                          className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 shadow hover:shadow-md transition-all duration-200">
                          Lihat Detail Konsultasi <ArrowRightIcon className="h-4 w-4 ml-2" />
                        </Link>
                      )}
                      {/* Tombol ke seluruh riwayat — selalu tampil */}
                      {isRouteAvailable('mahasiswa.riwayat-konsultasi.index') && (
                        <Link href={route('mahasiswa.riwayat-konsultasi.index')}
                          className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200">
                          <ClockIcon className="h-4 w-4 mr-2" />
                          Semua Riwayat Konsultasi
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-8">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-8 h-8 bg-gradient-to-r from-gray-500 to-slate-600 rounded-xl flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">Konsultasi Terakhir</h3>
                  </div>
                  <div className="text-center py-12">
                    <div className="w-20 h-20 mx-auto bg-gradient-to-r from-gray-200 to-gray-300 rounded-full flex items-center justify-center mb-4">
                      <QuestionMarkCircleIcon className="h-10 w-10 text-gray-500" />
                    </div>
                    <p className="text-gray-500 mb-2 text-lg font-medium">Belum ada konsultasi yang dilakukan</p>
                    <p className="text-gray-400 text-sm mb-6">Mulai konsultasi pertama untuk mendapatkan analisis kesehatan mental</p>
                    {isRouteAvailable('mahasiswa.konsultasi.index') && (
                      <Link href={route('mahasiswa.konsultasi.index')}
                        className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                        <ClipboardDocumentListIcon className="h-5 w-5 mr-2" />
                        Mulai Konsultasi Pertama
                      </Link>
                    )}
                  </div>
                </div>
              )}

              {/* Charts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-8">
                  <h3 className="text-xl font-bold text-gray-800 mb-6">Tren 6 Bulan Terakhir</h3>
                  <div className="h-64">
                    <Line data={monthlyTrendsData} options={{ responsive: true, maintainAspectRatio: false,
                      plugins: { legend: { display: false } },
                      scales: { y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } },
                                x: { grid: { color: 'rgba(0,0,0,0.05)' } } } }} />
                  </div>
                </div>
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-8">
                  <h3 className="text-xl font-bold text-gray-800 mb-6">Distribusi Diagnosa</h3>
                  <div className="h-64">
                    <Doughnut data={diagnosisDistributionData} options={{ responsive: true, maintainAspectRatio: false,
                      plugins: { legend: { position: 'bottom', labels: { padding: 20, usePointStyle: true, font: { size: 12, weight: 500 } } } } }} />
                  </div>
                </div>
              </div>

              {/* Weekly Trend Bar */}
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-8">
                <h3 className="text-xl font-bold text-gray-800 mb-6">Tren Mingguan CF</h3>
                <div className="h-64">
                  <Bar data={weeklyTrendData} options={{ responsive: true, maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: { y: { beginAtZero: true, max: 100, grid: { color: 'rgba(0,0,0,0.05)' } },
                              x: { grid: { color: 'rgba(0,0,0,0.05)' } } } }} />
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-8">
                <h3 className="text-xl font-bold text-gray-800 mb-6">Aktivitas Terbaru</h3>
                {recent_activity.length > 0 ? (
                  <div className="space-y-4">
                    {recent_activity.map((activity) => (
                      <div key={activity.id} className="flex items-center justify-between p-6 bg-gradient-to-r from-gray-50 to-white rounded-2xl border border-gray-200 hover:shadow-md transition-all duration-200">
                        <div className="flex items-center space-x-4">
                          <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                            { normal: 'bg-green-500', mild: 'bg-yellow-500', moderate: 'bg-orange-500', severe: 'bg-red-500', unknown: 'bg-gray-400' }[activity.severity_level]
                          }`} />
                          <div>
                            <p className="font-bold text-gray-900">{activity.hasil_diagnosa}</p>
                            <p className="text-sm text-gray-600">{activity.tanggal_formatted}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-gray-900">{activity.nilai_cf_formatted}</p>
                          <p className="text-sm text-gray-500">{activity.waktu_lalu}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <ClockIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Belum ada aktivitas konsultasi</p>
                  </div>
                )}
              </div>
            </div>

            {/* ── Right column ───────────────────────────────────────────── */}
            <div className="space-y-8">

              {/* Trend Indicator */}
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">Analisis Tren</h3>
                  <button onClick={() => setShowDetailedTrend(!showDetailedTrend)}
                    className="ml-auto p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    {showDetailedTrend ? <ChevronUpIcon className="h-5 w-5 text-gray-500" /> : <ChevronDownIcon className="h-5 w-5 text-gray-500" />}
                  </button>
                </div>

                <div className={`flex items-center space-x-4 p-6 rounded-2xl border ${getTrendColorClass(stats.trend.direction)}`}>
                  {getTrendIcon(stats.trend.direction)}
                  <div className="flex-1">
                    <p className="font-bold text-gray-900">{stats.trend.message}</p>
                    {stats.trend.percentage > 0 && (
                      <p className="text-sm text-gray-600 mt-1">{stats.trend.percentage}% perubahan</p>
                    )}
                  </div>
                </div>

                {showDetailedTrend && (
                  <div className="mt-6 space-y-4">
                    <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                      <div className="flex items-start space-x-3">
                        <InformationCircleIcon className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                          <p className="font-semibold text-blue-800 mb-1">Penjelasan:</p>
                          <p className="text-blue-700 leading-relaxed">{stats.trend.analysis}</p>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="bg-white rounded-xl p-4 border border-gray-200">
                        <p className="font-semibold text-gray-600 mb-1">Data</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.trend.data_points}</p>
                        <p className="text-xs text-gray-500 mt-1">konsultasi</p>
                      </div>
                      <div className="bg-white rounded-xl p-4 border border-gray-200">
                        <p className="font-semibold text-gray-600 mb-1">Pola</p>
                        <p className="text-sm font-bold text-gray-900 leading-snug">{stats.trend.pattern}</p>
                      </div>
                    </div>
                    {stats.trend.cf_change !== 0 && (
                      <div className="bg-white rounded-xl p-4 border border-gray-200">
                        <p className="font-semibold text-gray-600 mb-3 text-sm">Perubahan Nilai CF:</p>
                        <div className="flex items-center justify-between text-sm">
                          <div>
                            <p className="text-gray-500 text-xs">CF Terakhir</p>
                            <p className="font-bold text-lg">{stats.trend.latest_cf}%</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${stats.trend.cf_change > 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                            {stats.trend.cf_change > 0 ? '+' : ''}{stats.trend.cf_change}%
                          </span>
                          <div className="text-right">
                            <p className="text-gray-500 text-xs">Rata-rata Sebelum</p>
                            <p className="font-bold text-lg">{stats.trend.avg_previous_cf}%</p>
                          </div>
                        </div>
                      </div>
                    )}
                    {stats.trend.consultation_dates?.length > 0 && (
                      <div className="bg-white rounded-xl p-4 border border-gray-200">
                        <p className="font-semibold text-gray-600 mb-3 text-sm">Riwayat Teranalisis:</p>
                        <div className="space-y-2">
                          {stats.trend.consultation_dates.map((date, i) => (
                            <div key={i} className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">{date}</span>
                              <div className="flex items-center space-x-2">
                                <span className="font-semibold">{stats.trend.cf_values[i]}%</span>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getSeverityColor(stats.trend.severity_levels[i])}`}>
                                  {stats.trend.severity_levels[i]}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {/* Tips per direction */}
                    <div className={`rounded-xl p-4 border ${
                      stats.trend.direction === 'improving' ? 'bg-green-50 border-green-200'
                      : stats.trend.direction === 'declining' ? 'bg-red-50 border-red-200'
                      : 'bg-blue-50 border-blue-200'
                    }`}>
                      <p className="font-semibold mb-2 text-sm">
                        {stats.trend.direction === 'improving' ? 'Tips Mempertahankan Kondisi:'
                         : stats.trend.direction === 'declining' ? 'Rekomendasi Tindak Lanjut:'
                         : 'Tips Monitoring:'}
                      </p>
                      <ul className="text-sm space-y-1">
                        {stats.trend.direction === 'improving' ? (
                          <>
                            <li className="text-green-700">• Pertahankan rutinitas positif yang telah dilakukan</li>
                            <li className="text-green-700">• Lanjutkan konsultasi berkala setiap 2 minggu</li>
                            <li className="text-green-700">• Bagikan pengalaman positif dengan keluarga</li>
                          </>
                        ) : stats.trend.direction === 'declining' ? (
                          <>
                            <li className="text-red-700">• Hubungi dosen pembimbing akademik Anda</li>
                            <li className="text-red-700">• Pertimbangkan konsultasi profesional via Halodoc/Alodokter</li>
                            <li className="text-red-700">• Jika krisis, hubungi 119 ext 8 (gratis, 24 jam)</li>
                          </>
                        ) : (
                          <>
                            <li className="text-blue-700">• Lakukan konsultasi rutin setiap 2 minggu</li>
                            <li className="text-blue-700">• Jaga pola tidur dan makan yang teratur</li>
                            <li className="text-blue-700">• Perhatikan perubahan mood atau gejala baru</li>
                          </>
                        )}
                      </ul>
                    </div>
                  </div>
                )}
              </div>

              {/* Recommendations */}
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-pink-600 rounded-xl flex items-center justify-center">
                    <HeartIcon className="h-4 w-4 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">Rekomendasi</h3>
                </div>
                {recommendations.length > 0 ? (
                  <div className="space-y-5">
                    {recommendations.map((rec, i) => (
                      <div key={i} className={`rounded-2xl border-l-4 shadow-sm overflow-hidden ${
                        rec.priority === 'high'
                          ? 'border-red-500'
                          : rec.priority === 'medium'
                          ? 'border-yellow-500'
                          : 'border-blue-500'
                      }`}>
                        {/* Header kartu */}
                        <div className={`px-5 py-4 ${
                          rec.priority === 'high'
                            ? 'bg-gradient-to-r from-red-50 to-rose-50'
                            : rec.priority === 'medium'
                            ? 'bg-gradient-to-r from-yellow-50 to-amber-50'
                            : 'bg-gradient-to-r from-blue-50 to-indigo-50'
                        }`}>
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-bold text-gray-900 text-sm leading-snug">{rec.title}</h4>
                            <span className={`flex-shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full ${
                              rec.priority === 'high'   ? 'bg-red-100 text-red-700'
                              : rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-blue-100 text-blue-700'
                            }`}>
                              {rec.priority === 'high' ? 'Segera' : rec.priority === 'medium' ? 'Penting' : 'Info'}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 mt-1 leading-relaxed">{rec.description}</p>
                        </div>

                        {/* Langkah-langkah konkret */}
                        {rec.steps && rec.steps.length > 0 && (
                          <div className="bg-white px-5 py-4 border-t border-gray-100">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                              Langkah yang bisa dilakukan:
                            </p>
                            <ul className="space-y-2">
                              {rec.steps.map((step, si) => (
                                <li key={si} className="flex items-start space-x-2.5">
                                  <span className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold mt-0.5 ${
                                    rec.priority === 'high'   ? 'bg-red-100 text-red-700'
                                    : rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-700'
                                    : 'bg-blue-100 text-blue-700'
                                  }`}>
                                    {si + 1}
                                  </span>
                                  <span className="text-sm text-gray-700 leading-snug">{step}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Tombol aksi */}
                        {rec.url && rec.action && getRouteUrl(rec.url) && (
                          <div className="bg-gray-50 px-5 py-3 border-t border-gray-100">
                            <Link href={rec.url}
                              className={`inline-flex items-center text-sm font-semibold px-4 py-2 rounded-xl transition-all duration-200 ${
                                rec.priority === 'high'
                                  ? 'bg-red-600 text-white hover:bg-red-700'
                                  : rec.priority === 'medium'
                                  ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                                  : 'text-blue-600 hover:text-blue-800 hover:bg-blue-50'
                              }`}>
                              {rec.action} <ArrowRightIcon className="h-4 w-4 ml-1.5" />
                            </Link>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-6">Tidak ada rekomendasi saat ini</p>
                )}
              </div>

              {/* Reminders */}
              {upcoming_reminders.length > 0 && (
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-8">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center">
                      <BellIcon className="h-4 w-4 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">Pengingat</h3>
                  </div>
                  <div className="space-y-4">
                    {upcoming_reminders.map((r, i) => (
                      <div key={i} className={`p-6 rounded-2xl border shadow-sm ${
                        r.priority === 'high'   ? 'bg-gradient-to-r from-red-50 to-rose-50 border-red-200'
                        : r.priority === 'medium' ? 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200'
                        : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200'
                      }`}>
                        <h4 className="font-bold text-gray-900 mb-2">{r.title}</h4>
                        <p className="text-sm text-gray-700">{r.description}</p>
                        {r.days_left !== undefined && (
                          <p className="text-xs text-gray-500 mt-2 font-medium">{r.days_left} hari lagi</p>
                        )}
                        {r.days_overdue !== undefined && (
                          <p className="text-xs text-red-600 mt-2 font-medium">Terlambat {r.days_overdue} hari</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Profile Summary */}
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-8 h-8 bg-gradient-to-r from-gray-500 to-slate-600 rounded-xl flex items-center justify-center">
                    <UserIcon className="h-4 w-4 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">Profil Singkat</h3>
                </div>
                <div className="space-y-3 text-sm">
                  {[
                    { label: 'NIM',           value: user.nim },
                    { label: 'Fakultas',      value: user.fakultas },
                    { label: 'Program Studi', value: user.program_studi },
                    { label: 'Email',         value: user.email },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between items-center p-3 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200">
                      <span className="text-gray-600 font-semibold">{label}:</span>
                      <span className="font-bold text-gray-900 text-right max-w-[60%] truncate">{value}</span>
                    </div>
                  ))}
                  {user.usia !== null && (
                    <div className="flex justify-between items-center p-3 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200">
                      <span className="text-gray-600 font-semibold">Usia:</span>
                      <span className="font-bold text-gray-900">{user.usia} tahun</span>
                    </div>
                  )}
                  {user.jenis_kelamin && (
                    <div className="flex justify-between items-center p-3 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200">
                      <span className="text-gray-600 font-semibold">Jenis Kelamin:</span>
                      <span className="font-bold text-gray-900">
                        {user.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
                      </span>
                    </div>
                  )}
                </div>

                {showEditModal && (
                  <EditProfileModal
                    user={{ id: 0, email: user.email, nama: user.name, nim: user.nim,
                            fakultas: user.fakultas, program_studi: user.program_studi,
                            usia: user.usia, jenis_kelamin: user.jenis_kelamin }}
                    onClose={() => setShowEditModal(false)}
                  />
                )}
                <div className="mt-6 flex justify-end">
                  <button onClick={() => setShowEditModal(true)}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg hover:from-blue-700 hover:to-indigo-800 font-medium shadow-md hover:shadow-lg transition duration-200">
                    Edit Profil
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;