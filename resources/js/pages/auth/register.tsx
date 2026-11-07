import { Head, useForm, Link } from '@inertiajs/react';
import { LoaderCircle, Eye, EyeOff, User, Mail, Lock, GraduationCap, Users, Calendar, UserCheck, ArrowRight } from 'lucide-react';
import { FormEventHandler, useState, useEffect } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AuthLayout from '@/layouts/auth-layout';

type RegisterForm = {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    nim: string;
    fakultas: string;
    program_studi: string;
    usia: string;
    jenis_kelamin: string;
};

export default function Register() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isFormFocused, setIsFormFocused] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm<Required<RegisterForm>>({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        nim: '',
        fakultas: '',
        program_studi: '',
        usia: '',
        jenis_kelamin: '',
    });

    // Mouse tracking for interactive effects
    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    const handleRippleEffect = (e) => {
        const button = e.currentTarget;
        const rect = button.getBoundingClientRect();
        const ripple = document.createElement('div');
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;

        ripple.className = 'ripple-effect';
        ripple.style.cssText = `
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.4);
            transform: scale(0);
            animation: ripple 0.6s linear;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            pointer-events: none;
            z-index: 10;
        `;

        button.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8 px-4 relative overflow-hidden">
            <Head title="Register" />

            {/* Animated Background Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                {/* Dynamic Orbs */}
                <div
                    className="absolute w-96 h-96 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse"
                    style={{
                        left: `${mousePosition.x * 0.02}px`,
                        top: `${mousePosition.y * 0.02}px`,
                        transform: 'translate(-50%, -50%)'
                    }}
                />
                <div
                    className="absolute w-80 h-80 bg-gradient-to-r from-blue-500/15 to-cyan-500/15 rounded-full blur-3xl animate-pulse"
                    style={{
                        right: `${mousePosition.x * 0.01}px`,
                        bottom: `${mousePosition.y * 0.01}px`,
                        transform: 'translate(50%, 50%)',
                        animationDelay: '1s'
                    }}
                />

                {/* Floating Particles */}
                {[...Array(20)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute opacity-20 animate-pulse"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 5}s`,
                            animationDuration: `${3 + Math.random() * 4}s`
                        }}
                    >
                        <div className="w-1 h-1 bg-white rounded-full animate-ping" />
                    </div>
                ))}

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            </div>

            {/* Main Register Container */}
            <div className="relative z-10 w-full max-w-6xl mx-auto">
                {/* Logo/Brand Section */}
                <div className="text-center mb-6 animate-fade-in">
                    <Link
                        href="/"
                        className="inline-block group transition-all duration-300 hover:scale-105"
                    >
                        <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2 group-hover:from-purple-300 group-hover:to-pink-300 transition-all duration-300">
                            DepressionCare
                        </h1>
                    </Link>
                    <p className="text-gray-400 text-sm">Buat akun mahasiswa baru</p>
                </div>

                {/* Progress Indicator */}
                <div className="mb-6 animate-fade-in">
                    <div className="flex items-center justify-center space-x-8">
                        <div className="flex items-center text-purple-400">
                            <div className="w-8 h-8 rounded-full border-2 border-purple-400 bg-purple-400/20 flex items-center justify-center text-xs font-bold">
                                1
                            </div>
                            <span className="ml-2 text-sm">Data Pribadi</span>
                        </div>
                        <div className="w-16 h-0.5 bg-purple-400"></div>
                        <div className="flex items-center text-purple-400">
                            <div className="w-8 h-8 rounded-full border-2 border-purple-400 bg-purple-400/20 flex items-center justify-center text-xs font-bold">
                                2
                            </div>
                            <span className="ml-2 text-sm">Data Mahasiswa</span>
                        </div>
                    </div>
                </div>

                {/* Register Form */}
                <div
                    className={`bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 sm:p-8 shadow-2xl transition-all duration-500 animate-fade-in-up ${
                        isFormFocused ? 'border-purple-500/30 shadow-purple-500/20' : ''
                    }`}
                    onFocus={() => setIsFormFocused(true)}
                    onBlur={() => setIsFormFocused(false)}
                >
                    <form onSubmit={submit} className="space-y-8">
                        {/* Two Column Layout for Forms */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Left Column - Personal Data */}
                            <div className="space-y-6">
                                <div className="flex items-center space-x-3 pb-4 border-b border-white/10">
                                    <User className="w-5 h-5 text-purple-400" />
                                    <h3 className="text-lg font-semibold text-white">Data Pribadi</h3>
                                </div>

                                {/* Name Field */}
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="text-sm font-medium text-gray-200 flex items-center">
                                        <User className="w-4 h-4 mr-2 text-purple-400" />
                                        Nama Lengkap
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="name"
                                            type="text"
                                            required
                                            autoFocus
                                            tabIndex={1}
                                            autoComplete="name"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            disabled={processing}
                                            placeholder="Masukkan nama lengkap"
                                            className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300 hover:border-white/30"
                                        />
                                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                                    </div>
                                    <InputError message={errors.name} />
                                </div>

                                {/* Email Field */}
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-sm font-medium text-gray-200 flex items-center">
                                        <Mail className="w-4 h-4 mr-2 text-purple-400" />
                                        Email Address
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="email"
                                            type="email"
                                            required
                                            tabIndex={2}
                                            autoComplete="email"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            disabled={processing}
                                            placeholder="email@example.com"
                                            className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300 hover:border-white/30"
                                        />
                                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                                    </div>
                                    <InputError message={errors.email} />
                                </div>

                                {/* Password Field */}
                                <div className="space-y-2">
                                    <Label htmlFor="password" className="text-sm font-medium text-gray-200 flex items-center">
                                        <Lock className="w-4 h-4 mr-2 text-purple-400" />
                                        Password
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            required
                                            tabIndex={3}
                                            autoComplete="new-password"
                                            value={data.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                            disabled={processing}
                                            placeholder="Password"
                                            className="w-full px-4 py-3 pr-12 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300 hover:border-white/30"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-300 p-1"
                                        >
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                                    </div>
                                    <InputError message={errors.password} />
                                </div>

                                {/* Confirm Password Field */}
                                <div className="space-y-2">
                                    <Label htmlFor="password_confirmation" className="text-sm font-medium text-gray-200 flex items-center">
                                        <Lock className="w-4 h-4 mr-2 text-purple-400" />
                                        Konfirmasi Password
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="password_confirmation"
                                            type={showConfirmPassword ? "text" : "password"}
                                            required
                                            tabIndex={4}
                                            autoComplete="new-password"
                                            value={data.password_confirmation}
                                            onChange={(e) => setData('password_confirmation', e.target.value)}
                                            disabled={processing}
                                            placeholder="Konfirmasi password"
                                            className="w-full px-4 py-3 pr-12 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300 hover:border-white/30"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-300 p-1"
                                        >
                                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                                    </div>
                                    <InputError message={errors.password_confirmation} />
                                </div>
                            </div>

                            {/* Right Column - Student Data */}
                            <div className="space-y-6">
                                <div className="flex items-center space-x-3 pb-4 border-b border-white/10">
                                    <GraduationCap className="w-5 h-5 text-purple-400" />
                                    <h3 className="text-lg font-semibold text-white">Data Mahasiswa</h3>
                                </div>

                                {/* NIM */}
                                <div className="space-y-2">
                                    <Label htmlFor="nim" className="text-sm font-medium text-gray-200 flex items-center">
                                        <GraduationCap className="w-4 h-4 mr-2 text-purple-400" />
                                        NIM
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="nim"
                                            type="text"
                                            required
                                            tabIndex={5}
                                            value={data.nim}
                                            onChange={(e) => setData('nim', e.target.value)}
                                            disabled={processing}
                                            placeholder="Masukkan NIM"
                                            className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300 hover:border-white/30"
                                        />
                                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                                    </div>
                                    <InputError message={errors.nim} />
                                </div>

                                {/* Faculty */}
                                <div className="space-y-2">
                                    <Label htmlFor="fakultas" className="text-sm font-medium text-gray-200">
                                        Fakultas
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="fakultas"
                                            type="text"
                                            required
                                            tabIndex={6}
                                            value={data.fakultas}
                                            onChange={(e) => setData('fakultas', e.target.value)}
                                            disabled={processing}
                                            placeholder="Fakultas Teknik"
                                            className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300 hover:border-white/30"
                                        />
                                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                                    </div>
                                    <InputError message={errors.fakultas} />
                                </div>

                                {/* Program Study */}
                                <div className="space-y-2">
                                    <Label htmlFor="program_studi" className="text-sm font-medium text-gray-200">
                                        Program Studi
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="program_studi"
                                            type="text"
                                            required
                                            tabIndex={7}
                                            value={data.program_studi}
                                            onChange={(e) => setData('program_studi', e.target.value)}
                                            disabled={processing}
                                            placeholder="Teknik Informatika"
                                            className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300 hover:border-white/30"
                                        />
                                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                                    </div>
                                    <InputError message={errors.program_studi} />
                                </div>

                                {/* Age */}
                                <div className="space-y-2">
                                    <Label htmlFor="usia" className="text-sm font-medium text-gray-200 flex items-center">
                                        <Calendar className="w-4 h-4 mr-2 text-purple-400" />
                                        Usia
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="usia"
                                            type="number"
                                            required
                                            tabIndex={8}
                                            min="17"
                                            max="100"
                                            value={data.usia}
                                            onChange={(e) => setData('usia', e.target.value)}
                                            disabled={processing}
                                            placeholder="20"
                                            className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300 hover:border-white/30"
                                        />
                                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                                    </div>
                                    <InputError message={errors.usia} />
                                </div>

                                {/* Gender */}
                                <div className="space-y-2">
                                    <Label htmlFor="jenis_kelamin" className="text-sm font-medium text-gray-200 flex items-center">
                                        <Users className="w-4 h-4 mr-2 text-purple-400" />
                                        Jenis Kelamin
                                    </Label>
                                    <Select
                                        value={data.jenis_kelamin}
                                        onValueChange={(value) => setData('jenis_kelamin', value)}
                                        disabled={processing}
                                        required
                                    >
                                        <SelectTrigger
                                            tabIndex={9}
                                            className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300 hover:border-white/30"
                                        >
                                            <SelectValue placeholder="Pilih jenis kelamin" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-800 border-white/20 text-white">
                                            <SelectItem value="L" className="hover:bg-white/10">Laki-laki</SelectItem>
                                            <SelectItem value="P" className="hover:bg-white/10">Perempuan</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.jenis_kelamin} />
                                </div>
                            </div>
                        </div>

                        {/* Register Button - Full Width */}
                        <div className="pt-6 border-t border-white/10">
                            <Button
                                type="submit"
                                onClick={handleRippleEffect}
                                className="relative w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 overflow-hidden group"
                                tabIndex={10}
                                disabled={processing}
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
                                <div className="relative flex items-center justify-center space-x-2">
                                    {processing ? (
                                        <>
                                            <LoaderCircle className="h-5 w-5 animate-spin" />
                                            <span>Creating Account...</span>
                                        </>
                                    ) : (
                                        <>
                                            <UserCheck className="h-5 w-5" />
                                            <span>Buat Akun Mahasiswa</span>
                                            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                                        </>
                                    )}
                                </div>
                            </Button>
                        </div>

                        {/* Login Link */}
                        <div className="text-center">
                            <p className="text-gray-400 text-sm">
                                Sudah punya akun?{' '}
                                <TextLink
                                    href={route('login')}
                                    className="text-purple-400 hover:text-purple-300 font-medium transition-colors duration-300"
                                    tabIndex={11}
                                >
                                    Masuk disini
                                </TextLink>
                            </p>
                        </div>
                    </form>
                </div>

                {/* Additional Info */}
                <div className="mt-6 text-center">
                    <div className="flex items-center justify-center space-x-4 text-xs text-gray-500 flex-wrap">
                        <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            <span>Data Aman</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                            <span>Gratis</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                            <span>Khusus Mahasiswa</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Custom Styles */}
            <style jsx>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                @keyframes ripple {
                    to {
                        transform: scale(4);
                        opacity: 0;
                    }
                }

                .animate-fade-in {
                    animation: fade-in 0.8s ease-out;
                }

                .animate-fade-in-up {
                    animation: fade-in-up 1s ease-out;
                    animation-delay: 0.2s;
                    animation-fill-mode: both;
                }
            `}</style>
        </div>
    );
}
