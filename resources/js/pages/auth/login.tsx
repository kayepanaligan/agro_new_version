import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle, Mail, Lock, Eye, EyeOff, User } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';

interface LoginForm {
    email: string;
    password: string;
    remember: boolean;
    [key: string]: string | boolean;
}

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
    const [showPassword, setShowPassword] = useState(false);
    const [showFarmerJoin, setShowFarmerJoin] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm<LoginForm>({
        email: '',
        password: '',
        remember: false,
    });

    const { data: farmerData, setData: setFarmerData, processing: farmerProcessing, errors: farmerErrors } = useForm({
        lfid: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    const handleFarmerJoin: FormEventHandler = (e) => {
        e.preventDefault();
        // Store LFID in session storage and redirect to farmer login
        if (farmerData.lfid.trim()) {
            sessionStorage.setItem('pending_lfid', farmerData.lfid);
            window.location.href = route('farmer.login');
        }
    };

    return (
        <AuthLayout title="Log in to your account" description="Enter your email and password below to log in">
            <Head title="Log in" />

            <form className="flex flex-col gap-6" onSubmit={submit}>
                <div className="grid gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email address</Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
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
                                className="pl-9"
                            />
                        </div>
                        <InputError message={errors.email} />
                    </div>

                    <div className="grid gap-2">
                        <div className="flex items-center">
                            <Label htmlFor="password">Password</Label>
                            {canResetPassword && (
                                <TextLink href={route('password.request')} className="ml-auto text-sm" tabIndex={5}>
                                    Forgot password?
                                </TextLink>
                            )}
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                required
                                tabIndex={2}
                                autoComplete="current-password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                placeholder="Password"
                                className="pl-9 pr-9"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                                tabIndex={-1}
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                        <InputError message={errors.password} />
                    </div>

                    <div className="flex items-center space-x-3">
                        <Checkbox id="remember" name="remember" tabIndex={3} />
                        <Label htmlFor="remember">Remember me</Label>
                    </div>

                    <Button type="submit" className="mt-4 w-full" tabIndex={4} disabled={processing}>
                        {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        Log in
                    </Button>
                </div>

                <div className="text-muted-foreground text-center text-sm">
                    Don't have an account?{' '}
                    <TextLink href={route('register')} tabIndex={5}>
                        Sign up
                    </TextLink>
                </div>

                <div className="space-y-3">
                    {!showFarmerJoin ? (
                        <button
                            type="button"
                            onClick={() => setShowFarmerJoin(true)}
                            className="text-sm text-primary hover:underline w-full text-center"
                        >
                            Join as Farmer
                        </button>
                    ) : (
                        <div className="space-y-3 p-4 border rounded-lg bg-muted/50">
                            <div className="text-sm font-medium text-center mb-2">Enter your Local Farmer ID (LFID)</div>
                            <form onSubmit={handleFarmerJoin}>
                                <div className="grid gap-2">
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            id="farmer-lfid"
                                            type="text"
                                            value={farmerData.lfid}
                                            className="pl-9"
                                            autoComplete="lfid"
                                            placeholder="Enter your LFID"
                                            autoFocus
                                            onChange={(e) => setFarmerData('lfid', e.target.value)}
                                        />
                                    </div>
                                    <InputError message={farmerErrors.lfid} />
                                    <div className="flex gap-2">
                                        <Button 
                                            type="submit" 
                                            className="flex-1" 
                                            disabled={farmerProcessing}
                                            size="sm"
                                        >
                                            {farmerProcessing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                                            Continue
                                        </Button>
                                        <Button 
                                            type="button" 
                                            variant="outline" 
                                            className="flex-1"
                                            onClick={() => {
                                                setShowFarmerJoin(false);
                                                setFarmerData('lfid', '');
                                            }}
                                            size="sm"
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </form>

            {status && <div className="mb-4 text-center text-sm font-medium text-green-600">{status}</div>}
        </AuthLayout>
    );
}
