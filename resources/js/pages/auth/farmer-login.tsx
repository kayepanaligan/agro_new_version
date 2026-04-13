import { Head, Link, useForm } from '@inertiajs/react';
import { LoaderCircle, User, Lock, Eye, EyeOff } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';

interface FarmerLoginForm {
    lfid: string;
    password: string;
    remember: boolean;
    [key: string]: string | boolean;
}

interface FarmerLoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function FarmerLogin({ status, canResetPassword }: FarmerLoginProps) {
    const [showPassword, setShowPassword] = useState(false);
    
    // Check if LFID was passed from main login page
    const pendingLfid = typeof window !== 'undefined' ? sessionStorage.getItem('pending_lfid') : null;
    
    const { data, setData, post, processing, errors, reset } = useForm<FarmerLoginForm>({
        lfid: pendingLfid || '',
        password: '',
        remember: false,
    });

    // Clear pending LFID on mount
    if (typeof window !== 'undefined' && pendingLfid) {
        sessionStorage.removeItem('pending_lfid');
    }

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('farmer.login.store'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <AuthLayout title="Farmer Portal" description="Enter your Local Farmer ID (LFID) and password to access your account">
            <Head title="Farmer Login" />

            <form className="flex flex-col gap-6" onSubmit={submit}>
                <div className="grid gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="lfid">Local Farmer ID (LFID)</Label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                id="lfid"
                                type="text"
                                name="lfid"
                                value={data.lfid}
                                className="pl-9"
                                autoComplete="lfid"
                                placeholder="Enter your LFID"
                                autoFocus
                                tabIndex={1}
                                onChange={(e) => setData('lfid', e.target.value)}
                            />
                        </div>
                        <InputError message={errors.lfid} />
                    </div>

                    <div className="grid gap-2">
                        <div className="flex items-center">
                            <Label htmlFor="password">Password</Label>
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                value={data.password}
                                className="pl-9 pr-9"
                                autoComplete="current-password"
                                placeholder="Enter your password"
                                tabIndex={2}
                                onChange={(e) => setData('password', e.target.value)}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                tabIndex={-1}
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                        <InputError message={errors.password} />
                    </div>

                    <div className="flex items-center space-x-3">
                        <Checkbox
                            id="remember"
                            name="remember"
                            checked={data.remember}
                            onCheckedChange={(checked) => setData('remember', checked as boolean)}
                            tabIndex={3}
                        />
                        <Label htmlFor="remember">Remember me</Label>
                    </div>

                    <Button type="submit" className="mt-4 w-full" tabIndex={4} disabled={processing}>
                        {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        Login as Farmer
                    </Button>
                </div>

                <div className="text-center">
                    <TextLink href={route('login')} className="text-sm">
                        Back to Staff Login
                    </TextLink>
                </div>
            </form>

            {status && <div className="mb-4 text-center text-sm font-medium text-green-600">{status}</div>}
        </AuthLayout>
    );
}
