import { Head, useForm } from '@inertiajs/react';
import {
    LoaderCircle,
    Upload,
    User,
    Mail,
    Phone,
    MapPin,
    Building2,
    Calendar,
    Lock,
    KeyRound,
    Mars,
    Venus,
    CircleSmall,
} from 'lucide-react';
import { FormEventHandler, useRef, useState } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AuthLayout from '@/layouts/auth-layout';

interface RegisterForm {
    first_name: string;
    middle_name: string;
    last_name: string;
    gender: string;
    dob: string;
    email: string;
    contact_number: string;
    street: string;
    barangay: string;
    municipality: string;
    province: string;
    postal_code: string;
    id_document: File | null;
    password: string;
    password_confirmation: string;
}

export default function Register() {
    const [idPreview, setIdPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data, setData, post, processing, errors, reset } = useForm<RegisterForm>({
        first_name: '',
        middle_name: '',
        last_name: '',
        gender: '',
        dob: '',
        email: '',
        contact_number: '',
        street: '',
        barangay: '',
        municipality: '',
        province: '',
        postal_code: '',
        id_document: null,
        password: '',
        password_confirmation: '',
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                alert('File size must be less than 5MB');
                return;
            }
            
            const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
            if (!validTypes.includes(file.type)) {
                alert('Only JPG, PNG, and PDF files are allowed');
                return;
            }

            setData('id_document', file);
            
            // Create preview for images
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setIdPreview(reader.result as string);
                };
                reader.readAsDataURL(file);
            } else {
                // For PDFs, show a placeholder
                setIdPreview(null);
            }
        }
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        
        const formData = new FormData();
        formData.append('first_name', data.first_name);
        formData.append('middle_name', data.middle_name);
        formData.append('last_name', data.last_name);
        formData.append('gender', data.gender);
        formData.append('dob', data.dob);
        formData.append('email', data.email);
        formData.append('contact_number', data.contact_number);
        formData.append('street', data.street);
        formData.append('barangay', data.barangay);
        formData.append('municipality', data.municipality);
        formData.append('province', data.province);
        formData.append('postal_code', data.postal_code);
        formData.append('password', data.password);
        formData.append('password_confirmation', data.password_confirmation);
        
        if (data.id_document) {
            formData.append('id_document', data.id_document);
        }

        post(route('register'), {
            onFinish: () => {
                reset('password', 'password_confirmation');
                setIdPreview(null);
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            },
        });
    };

    return (
        <AuthLayout title="Create an account" description="Enter your details below to create your account">
            <Head title="Register" />
            <div className="w-full max-w-[1000px]">
                <form className="flex flex-col gap-6" onSubmit={submit}>
                {/* Personal Information Section */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium">Personal Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="first_name">First Name</Label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    id="first_name"
                                    type="text"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="given-name"
                                    value={data.first_name}
                                    onChange={(e) => setData('first_name', e.target.value)}
                                    disabled={processing}
                                    placeholder="First name"
                                    className="pl-9"
                                />
                            </div>
                            <InputError message={errors.first_name} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="middle_name">Middle Name</Label>
                            <Input
                                id="middle_name"
                                type="text"
                                tabIndex={2}
                                autoComplete="additional-name"
                                value={data.middle_name}
                                onChange={(e) => setData('middle_name', e.target.value)}
                                disabled={processing}
                                placeholder="Middle name"
                            />
                            <InputError message={errors.middle_name} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="last_name">Last Name</Label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    id="last_name"
                                    type="text"
                                    required
                                    tabIndex={3}
                                    autoComplete="family-name"
                                    value={data.last_name}
                                    onChange={(e) => setData('last_name', e.target.value)}
                                    disabled={processing}
                                    placeholder="Last name"
                                    className="pl-9"
                                />
                            </div>
                            <InputError message={errors.last_name} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="gender">Gender Assigned at Birth</Label>
                            <Select
                                value={data.gender}
                                onValueChange={(value) => setData('gender', value)}
                            >
                                <SelectTrigger id="gender" tabIndex={4} className="relative">
                                    {data.gender === 'male' && (
                                        <Mars className="absolute left-3 h-4 w-4 text-blue-500" />
                                    )}
                                    {data.gender === 'female' && (
                                        <Venus className="absolute left-3 h-4 w-4 text-pink-500" />
                                    )}
                                    <SelectValue placeholder="Select gender" className={data.gender ? 'pl-7' : ''} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="male" className="flex items-center gap-2">
                                        <span className='flex justify-center'>
                                        {/* <Mars className="h-4 w-4 text-blue-500" /> */}
                                        <span>Male</span>
                                        </span>
                                        
                                    </SelectItem>
                                    <SelectItem value="female" className="flex items-center gap-2">
                                        <span className='flex justify-center'>
                                        {/* <Venus className="h-4 w-4 text-pink-500" /> */}
                                        <span>Female</span>
                                        </span>
                                        
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            <InputError message={errors.gender} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="dob">Date of Birth</Label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    id="dob"
                                    type="date"
                                    required
                                    tabIndex={5}
                                    value={data.dob}
                                    onChange={(e) => setData('dob', e.target.value)}
                                    disabled={processing}
                                    className="pl-9"
                                />
                            </div>
                            <InputError message={errors.dob} />
                        </div>
                    </div>
                </div>

                {/* Contact Information Section */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium">Contact Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email Address</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    id="email"
                                    type="email"
                                    required
                                    tabIndex={6}
                                    autoComplete="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    disabled={processing}
                                    placeholder="email@example.com"
                                    className="pl-9"
                                />
                            </div>
                            <InputError message={errors.email} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="contact_number">Contact Number</Label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    id="contact_number"
                                    type="tel"
                                    required
                                    tabIndex={7}
                                    autoComplete="tel"
                                    value={data.contact_number}
                                    onChange={(e) => setData('contact_number', e.target.value)}
                                    disabled={processing}
                                    placeholder="e.g., 09123456789"
                                    className="pl-9"
                                />
                            </div>
                            <InputError message={errors.contact_number} />
                        </div>
                    </div>
                </div>

                {/* Address Section */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium">Address</h3>
                    <div className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="street">Street</Label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    id="street"
                                    type="text"
                                    required
                                    tabIndex={8}
                                    autoComplete="street-address"
                                    value={data.street}
                                    onChange={(e) => setData('street', e.target.value)}
                                    disabled={processing}
                                    placeholder="Street address"
                                    className="pl-9"
                                />
                            </div>
                            <InputError message={errors.street} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="barangay">Barangay</Label>
                            <div className="relative">
                                <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    id="barangay"
                                    type="text"
                                    required
                                    tabIndex={9}
                                    value={data.barangay}
                                    onChange={(e) => setData('barangay', e.target.value)}
                                    disabled={processing}
                                    placeholder="Barangay"
                                    className="pl-9"
                                />
                            </div>
                            <InputError message={errors.barangay} />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="municipality">Municipality</Label>
                                <div className="relative">
                                    <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        id="municipality"
                                        type="text"
                                        required
                                        tabIndex={10}
                                        value={data.municipality}
                                        onChange={(e) => setData('municipality', e.target.value)}
                                        disabled={processing}
                                        placeholder="Municipality"
                                        className="pl-9"
                                    />
                                </div>
                                <InputError message={errors.municipality} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="province">Province</Label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        id="province"
                                        type="text"
                                        required
                                        tabIndex={11}
                                        value={data.province}
                                        onChange={(e) => setData('province', e.target.value)}
                                        disabled={processing}
                                        placeholder="Province"
                                        className="pl-9"
                                    />
                                </div>
                                <InputError message={errors.province} />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="postal_code">Postal Code</Label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    id="postal_code"
                                    type="text"
                                    required
                                    tabIndex={12}
                                    autoComplete="postal-code"
                                    value={data.postal_code}
                                    onChange={(e) => setData('postal_code', e.target.value)}
                                    disabled={processing}
                                    placeholder="Postal code"
                                    className="pl-9"
                                />
                            </div>
                            <InputError message={errors.postal_code} />
                        </div>
                    </div>
                </div>

                {/* Proof of Identity Section */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium">Proof of Identity</h3>
                    <div className="grid gap-2">
                        <Label htmlFor="id_document">Upload One Valid ID</Label>
                        <div className="flex items-center gap-4">
                            <Input
                                id="id_document"
                                ref={fileInputRef}
                                type="file"
                                accept="image/*,.pdf"
                                tabIndex={13}
                                onChange={handleFileChange}
                                disabled={processing}
                                className="flex-1"
                            />
                        </div>
                        <p className="text-muted-foreground text-sm">
                            Accepted formats: JPG, PNG, PDF. Max size: 5MB
                        </p>
                        
                        {idPreview && (
                            <div className="mt-3 rounded-xl border-2 border-border bg-muted/50 p-4">
                                <p className="mb-2 text-sm font-medium">ID Preview:</p>
                                <div className="relative">
                                    <img
                                        src={idPreview}
                                        alt="ID Preview"
                                        className="max-h-64 w-full rounded-xl border-2 object-contain bg-white shadow-sm"
                                    />
                                </div>
                            </div>
                        )}
                        
                        {data.id_document && !idPreview && (
                            <div className="mt-3 rounded-xl border-2 border-border bg-muted/50 p-4">
                                <div className="flex items-center gap-3">
                                    <Upload className="h-5 w-5" />
                                    <div>
                                        <p className="font-medium">PDF File Selected:</p>
                                        <p className="text-sm text-muted-foreground">{data.id_document.name}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        <InputError message={errors.id_document} />
                    </div>
                </div>

                {/* Account Security Section */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium">Account Security</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    id="password"
                                    type="password"
                                    required
                                    tabIndex={14}
                                    autoComplete="new-password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    disabled={processing}
                                    placeholder="Password"
                                    className="pl-9"
                                />
                            </div>
                            <InputError message={errors.password} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="password_confirmation">Confirm Password</Label>
                            <div className="relative">
                                <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    id="password_confirmation"
                                    type="password"
                                    required
                                    tabIndex={15}
                                    autoComplete="new-password"
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    disabled={processing}
                                    placeholder="Confirm password"
                                    className="pl-9"
                                />
                            </div>
                            <InputError message={errors.password_confirmation} />
                        </div>
                    </div>
                </div>

                <Button type="submit" className="mt-2 w-full" tabIndex={16} disabled={processing}>
                    {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                    Create account
                </Button>
            </form>
            </div>

            <div className="text-muted-foreground text-center text-sm">
                Already have an account?{' '}
                <TextLink href={route('login')} tabIndex={17}>
                    Log in
                </TextLink>
            </div>
        </AuthLayout>
    );
}
