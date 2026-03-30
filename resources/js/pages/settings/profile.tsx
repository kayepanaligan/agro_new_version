import { type BreadcrumbItem, type SharedData, getFullName } from '@/types';
import { Transition } from '@headlessui/react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler, useRef, useState } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import DeleteUser from '@/components/delete-user';
import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { Camera, X } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Profile settings',
        href: '/settings/profile',
    },
];

export default function Profile({ mustVerifyEmail, status }: { mustVerifyEmail: boolean; status?: string }) {
    const { auth } = usePage<SharedData>().props;
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm({
        first_name: auth.user.first_name,
        middle_name: auth.user.middle_name || '',
        last_name: auth.user.last_name,
        email: auth.user.email,
        avatar: null as File | null,
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) { // 2MB limit
                alert('File size must be less than 2MB');
                return;
            }
            
            const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
            if (!validTypes.includes(file.type)) {
                alert('Only JPG, PNG, and GIF files are allowed');
                return;
            }

            setData('avatar', file);
            
            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = () => {
        setData('avatar', null);
        setPreviewUrl(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        // Create FormData to handle file upload
        const formData = new FormData();
        formData.append('first_name', data.first_name);
        formData.append('middle_name', data.middle_name || '');
        formData.append('last_name', data.last_name);
        formData.append('email', data.email);
        
        if (data.avatar) {
            formData.append('avatar', data.avatar);
        }

        // Use POST method to override PUT for file uploads
        patch(route('profile.update'), {
            forceFormData: true,
            onSuccess: () => {
                setPreviewUrl(null);
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Profile settings" />

            <SettingsLayout>
                <div className="space-y-6">
                    {/* Profile Picture Section */}
                    <div className="space-y-4">
                        <HeadingSmall 
                            title="Profile Picture" 
                            description="Update your profile picture" 
                        />
                        <div className="flex items-start gap-6">
                            <Avatar className="h-24 w-24 overflow-hidden rounded-full border-4 border-border">
                                <AvatarImage src={previewUrl || auth.user.avatar || undefined} alt={getFullName(auth.user)} />
                                <AvatarFallback className="text-2xl">
                                    {auth.user.first_name[0]}{auth.user.last_name[0]}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col gap-3">
                                <div>
                                    <Button 
                                        type="button" 
                                        variant="outline" 
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={processing}
                                    >
                                        <Camera className="mr-2 h-4 w-4" />
                                        {auth.user.avatar ? 'Change Picture' : 'Upload Picture'}
                                    </Button>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="hidden"
                                        disabled={processing}
                                    />
                                </div>
                                {(previewUrl || auth.user.avatar) && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={handleRemoveImage}
                                        disabled={processing}
                                        className="text-red-600 hover:text-red-700"
                                    >
                                        <X className="mr-2 h-4 w-4" />
                                        Remove Picture
                                    </Button>
                                )}
                                <p className="text-muted-foreground text-sm">
                                    Accepted formats: JPG, PNG, GIF. Max size: 2MB
                                </p>
                                {errors.avatar && <InputError message={errors.avatar} />}
                            </div>
                        </div>
                    </div>

                    {/* Profile Information Section */}

                    <form onSubmit={submit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="first_name">First Name</Label>

                                <Input
                                    id="first_name"
                                    className="mt-1 block w-full"
                                    value={data.first_name}
                                    onChange={(e) => setData('first_name', e.target.value)}
                                    required
                                    autoComplete="given-name"
                                    placeholder="First name"
                                />

                                <InputError className="mt-2" message={errors.first_name} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="middle_name">Middle Name (Optional)</Label>

                                <Input
                                    id="middle_name"
                                    className="mt-1 block w-full"
                                    value={data.middle_name}
                                    onChange={(e) => setData('middle_name', e.target.value)}
                                    autoComplete="additional-name"
                                    placeholder="Middle name"
                                />

                                <InputError className="mt-2" message={errors.middle_name} />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="last_name">Last Name</Label>

                            <Input
                                id="last_name"
                                className="mt-1 block w-full"
                                value={data.last_name}
                                onChange={(e) => setData('last_name', e.target.value)}
                                required
                                autoComplete="family-name"
                                placeholder="Last name"
                            />

                            <InputError className="mt-2" message={errors.last_name} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="email">Email address</Label>

                            <Input
                                id="email"
                                type="email"
                                className="mt-1 block w-full"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                required
                                autoComplete="username"
                                placeholder="Email address"
                            />

                            <InputError className="mt-2" message={errors.email} />
                        </div>

                        {mustVerifyEmail && auth.user.email_verified_at === null && (
                            <div>
                                <p className="mt-2 text-sm text-neutral-800">
                                    Your email address is unverified.
                                    <Link
                                        href={route('verification.send')}
                                        method="post"
                                        as="button"
                                        className="rounded-md text-sm text-neutral-600 underline hover:text-neutral-900 focus:ring-2 focus:ring-offset-2 focus:outline-hidden"
                                    >
                                        Click here to re-send the verification email.
                                    </Link>
                                </p>

                                {status === 'verification-link-sent' && (
                                    <div className="mt-2 text-sm font-medium text-green-600">
                                        A new verification link has been sent to your email address.
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="flex items-center gap-4">
                            <Button disabled={processing}>Save</Button>

                            <Transition
                                show={recentlySuccessful}
                                enter="transition ease-in-out"
                                enterFrom="opacity-0"
                                leave="transition ease-in-out"
                                leaveTo="opacity-0"
                            >
                                <p className="text-sm text-neutral-600">Saved</p>
                            </Transition>
                        </div>
                    </form>
                </div>

                <DeleteUser />
            </SettingsLayout>
        </AppLayout>
    );
}
