import { Head, useForm, Link } from '@inertiajs/react';
import { LoaderCircle, Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react';
import { FormEventHandler, useState, useEffect } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';

type LoginForm = {
    email: string;
    password: string;
    remember: boolean;
};

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
    const [showPassword, setShowPassword] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isFormFocused, setIsFormFocused] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm<Required<LoginForm>>({
        email: '',
        password: '',
        remember: false,
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
        post(route('login'), {
            onFinish: () => reset('password'),
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
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
            <Head title="Log in" />

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

            {/* Main Login Container */}
            <div className="relative z-10 w-full max-w-md">
                {/* Logo/Brand Section */}
                <div className="text-center mb-8 animate-fade-in">
                    <Link
                        href="/"
                        className="inline-block group transition-all duration-300 hover:scale-105"
                    >
                        <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2 group-hover:from-purple-300 group-hover:to-pink-300 transition-all duration-300">
                            DepressionCare
                        </h1>
                    </Link>
                    <p className="text-gray-400 text-sm">Masuk ke akun Anda</p>
                </div>

                {/* Status Message */}
                {status && (
                    <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl backdrop-blur-md">
                        <p className="text-center text-sm font-medium text-green-400">{status}</p>
                    </div>
                )}

                {/* Login Form */}
                <div
                    className={`bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 sm:p-8 shadow-2xl transition-all duration-500 animate-fade-in-up ${
                        isFormFocused ? 'border-purple-500/30 shadow-purple-500/20' : ''
                    }`}
                    onFocus={() => setIsFormFocused(true)}
                    onBlur={() => setIsFormFocused(false)}
                >
                    <form onSubmit={submit} className="space-y-6">
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
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="email@example.com"
                                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300 hover:border-white/30"
                                />
                                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                            </div>
                            <InputError message={errors.email} />
                        </div>

                        {/* Password Field */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password" className="text-sm font-medium text-gray-200 flex items-center">
                                    <Lock className="w-4 h-4 mr-2 text-purple-400" />
                                    Password
                                </Label>
                                {canResetPassword && (
                                    <TextLink
                                        href={route('password.request')}
                                        className="text-sm text-purple-400 hover:text-purple-300 transition-colors duration-300"
                                        tabIndex={5}
                                    >
                                        {/* Forgot password? */}
                                    </TextLink>
                                )}
                            </div>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    tabIndex={2}
                                    autoComplete="current-password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
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

                        {/* Remember Me Checkbox */}
                        <div className="flex items-center space-x-3">
                            <Checkbox
                                id="remember"
                                name="remember"
                                checked={data.remember}
                                onCheckedChange={(checked) => setData('remember', checked as boolean)}
                                tabIndex={3}
                                className="border-white/30 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                            />
                            <Label htmlFor="remember" className="text-sm text-gray-300 cursor-pointer">
                                Remember me for 30 days
                            </Label>
                        </div>

                        {/* Login Button */}
                        <Button
                            type="submit"
                            onClick={handleRippleEffect}
                            className="relative w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 overflow-hidden group"
                            tabIndex={4}
                            disabled={processing}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
                            <div className="relative flex items-center justify-center space-x-2">
                                {processing ? (
                                    <>
                                        <LoaderCircle className="h-5 w-5 animate-spin" />
                                        <span>Signing in...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Log in</span>
                                        <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                                    </>
                                )}
                            </div>
                        </Button>

                        {/* Register Link */}
                        <div className="text-center pt-4 border-t border-white/10">
                            <p className="text-gray-400 text-sm">
                                Don't have an account?{' '}
                                <TextLink
                                    href={route('register')}
                                    className="text-purple-400 hover:text-purple-300 font-medium transition-colors duration-300"
                                    tabIndex={6}
                                >
                                    Sign up here
                                </TextLink>
                            </p>
                        </div>
                    </form>
                </div>

                {/* Additional Info */}
                <div className="mt-8 text-center">
                    <div className="flex items-center justify-center space-x-6 text-xs text-gray-500">
                        <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            <span>Secure Login</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                            <span>SSL Protected</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                            <span>Privacy First</span>
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
