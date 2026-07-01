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
    Sprout,
    Leaf,
} from 'lucide-react';
import { FormEventHandler, useRef, useState } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
    [key: string]: string | File | null;
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
            if (file.size > 5 * 1024 * 1024) {
                alert('File size must be less than 5MB');
                return;
            }
            
            const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
            if (!validTypes.includes(file.type)) {
                alert('Only JPG, PNG, and PDF files are allowed');
                return;
            }

            setData('id_document', file);
            
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setIdPreview(reader.result as string);
                };
                reader.readAsDataURL(file);
            } else {
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
        <>
            <Head title="Register" />
            <div className="grid min-h-screen lg:grid-cols-2">
                {/* Left Column - Registration Form */}
                <div className="flex flex-col gap-6 p-6 md:p-8 lg:p-10 order-2 lg:order-1">
                    {/* Logo */}
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-700">
                            <Sprout className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">AgriSystem</h2>
                            <p className="text-sm text-gray-500">Farmer Management Portal</p>
                        </div>
                    </div>

                    {/* Registration Form Container */}
                    <div className="flex-1 overflow-y-auto">
                        <div className="max-w-2xl mx-auto">
                            <div className="mb-6">
                                <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
                                <p className="mt-2 text-sm text-gray-600">
                                    Fill in your details to register as a farmer
                                </p>
                            </div>

                            <form onSubmit={submit} className="space-y-6">
                                {/* Personal Information */}
                                <div className="space-y-4">
                                    <h3 className="text-base font-semibold text-gray-900 border-b border-gray-200 pb-2">
                                        Personal Information
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="first_name" className="text-sm">First Name</Label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
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
                                                    className="pl-10 h-10"
                                                />
                                            </div>
                                            <InputError message={errors.first_name} />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="middle_name" className="text-sm">Middle Name</Label>
                                            <Input
                                                id="middle_name"
                                                type="text"
                                                tabIndex={2}
                                                autoComplete="additional-name"
                                                value={data.middle_name}
                                                onChange={(e) => setData('middle_name', e.target.value)}
                                                disabled={processing}
                                                placeholder="Middle name"
                                                className="h-10"
                                            />
                                            <InputError message={errors.middle_name} />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="last_name" className="text-sm">Last Name</Label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
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
                                                    className="pl-10 h-10"
                                                />
                                            </div>
                                            <InputError message={errors.last_name} />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="gender" className="text-sm">Gender Assigned at Birth</Label>
                                            <Select
                                                value={data.gender}
                                                onValueChange={(value) => setData('gender', value)}
                                            >
                                                <SelectTrigger id="gender" tabIndex={4} className="h-10 relative">
                                                    {data.gender === 'male' && (
                                                        <Mars className="absolute left-3 h-4 w-4 text-blue-500" />
                                                    )}
                                                    {data.gender === 'female' && (
                                                        <Venus className="absolute left-3 h-4 w-4 text-pink-500" />
                                                    )}
                                                    <SelectValue placeholder="Select gender" className={data.gender ? 'pl-7' : ''} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="male">Male</SelectItem>
                                                    <SelectItem value="female">Female</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <InputError message={errors.gender} />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="dob" className="text-sm">Date of Birth</Label>
                                            <div className="relative">
                                                <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                                <Input
                                                    id="dob"
                                                    type="date"
                                                    required
                                                    tabIndex={5}
                                                    value={data.dob}
                                                    onChange={(e) => setData('dob', e.target.value)}
                                                    disabled={processing}
                                                    className="pl-10 h-10"
                                                />
                                            </div>
                                            <InputError message={errors.dob} />
                                        </div>
                                    </div>
                                </div>

                                {/* Contact Information */}
                                <div className="space-y-4">
                                    <h3 className="text-base font-semibold text-gray-900 border-b border-gray-200 pb-2">
                                        Contact Information
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="email" className="text-sm">Email Address</Label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
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
                                                    className="pl-10 h-10"
                                                />
                                            </div>
                                            <InputError message={errors.email} />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="contact_number" className="text-sm">Contact Number</Label>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
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
                                                    className="pl-10 h-10"
                                                />
                                            </div>
                                            <InputError message={errors.contact_number} />
                                        </div>
                                    </div>
                                </div>

                                {/* Address */}
                                <div className="space-y-4">
                                    <h3 className="text-base font-semibold text-gray-900 border-b border-gray-200 pb-2">
                                        Address
                                    </h3>
                                    <div className="grid gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="street" className="text-sm">Street</Label>
                                            <div className="relative">
                                                <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
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
                                                    className="pl-10 h-10"
                                                />
                                            </div>
                                            <InputError message={errors.street} />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="barangay" className="text-sm">Barangay</Label>
                                            <div className="relative">
                                                <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                                <Input
                                                    id="barangay"
                                                    type="text"
                                                    required
                                                    tabIndex={9}
                                                    value={data.barangay}
                                                    onChange={(e) => setData('barangay', e.target.value)}
                                                    disabled={processing}
                                                    placeholder="Barangay"
                                                    className="pl-10 h-10"
                                                />
                                            </div>
                                            <InputError message={errors.barangay} />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="grid gap-2">
                                                <Label htmlFor="municipality" className="text-sm">Municipality</Label>
                                                <div className="relative">
                                                    <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                                    <Input
                                                        id="municipality"
                                                        type="text"
                                                        required
                                                        tabIndex={10}
                                                        value={data.municipality}
                                                        onChange={(e) => setData('municipality', e.target.value)}
                                                        disabled={processing}
                                                        placeholder="Municipality"
                                                        className="pl-10 h-10"
                                                    />
                                                </div>
                                                <InputError message={errors.municipality} />
                                            </div>

                                            <div className="grid gap-2">
                                                <Label htmlFor="province" className="text-sm">Province</Label>
                                                <div className="relative">
                                                    <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                                    <Input
                                                        id="province"
                                                        type="text"
                                                        required
                                                        tabIndex={11}
                                                        value={data.province}
                                                        onChange={(e) => setData('province', e.target.value)}
                                                        disabled={processing}
                                                        placeholder="Province"
                                                        className="pl-10 h-10"
                                                    />
                                                </div>
                                                <InputError message={errors.province} />
                                            </div>
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="postal_code" className="text-sm">Postal Code</Label>
                                            <div className="relative">
                                                <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
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
                                                    className="pl-10 h-10"
                                                />
                                            </div>
                                            <InputError message={errors.postal_code} />
                                        </div>
                                    </div>
                                </div>

                                {/* Proof of Identity */}
                                <div className="space-y-4">
                                    <h3 className="text-base font-semibold text-gray-900 border-b border-gray-200 pb-2">
                                        Proof of Identity
                                    </h3>
                                    <div className="grid gap-2">
                                        <Label htmlFor="id_document" className="text-sm">Upload One Valid ID</Label>
                                        <div 
                                            className={`relative flex min-h-[160px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors ${
                                                idPreview || data.id_document 
                                                    ? 'border-emerald-500 bg-emerald-50/50' 
                                                    : 'border-gray-300 hover:bg-gray-50'
                                            }`}
                                        >
                                            <input
                                                id="id_document"
                                                ref={fileInputRef}
                                                type="file"
                                                accept="image/*,.pdf"
                                                tabIndex={13}
                                                onChange={handleFileChange}
                                                disabled={processing}
                                                className="absolute inset-0 h-full w-full opacity-0 cursor-pointer"
                                            />
                                            
                                            {idPreview ? (
                                                <div className="flex h-full w-full flex-col items-center justify-center p-4">
                                                    <img
                                                        src={idPreview}
                                                        alt="ID Preview"
                                                        className="max-h-[120px] w-full rounded-lg border object-contain bg-white shadow-sm"
                                                    />
                                                    <p className="mt-2 text-xs text-gray-600">Click to change image</p>
                                                </div>
                                            ) : data.id_document && !idPreview ? (
                                                <div className="flex flex-col items-center justify-center p-4 text-center">
                                                    <Upload className="mb-2 h-6 w-6 text-gray-400" />
                                                    <p className="text-sm font-medium text-gray-700">PDF File Selected</p>
                                                    <p className="text-xs text-gray-500 break-all max-w-xs">{data.id_document.name}</p>
                                                    <p className="mt-1 text-xs text-gray-500">Click to change file</p>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center p-4 text-center">
                                                    <Upload className="mb-2 h-6 w-6 text-gray-400" />
                                                    <p className="text-sm font-medium text-gray-700">Drag & drop file or click to browse</p>
                                                    <p className="mt-1 text-xs text-gray-500">JPG, PNG, PDF • Max 5MB</p>
                                                </div>
                                            )}
                                        </div>
                                        <InputError message={errors.id_document} />
                                    </div>
                                </div>

                                {/* Account Security */}
                                <div className="space-y-4">
                                    <h3 className="text-base font-semibold text-gray-900 border-b border-gray-200 pb-2">
                                        Account Security
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="password" className="text-sm">Password</Label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
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
                                                    className="pl-10 h-10"
                                                />
                                            </div>
                                            <InputError message={errors.password} />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="password_confirmation" className="text-sm">Confirm Password</Label>
                                            <div className="relative">
                                                <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
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
                                                    className="pl-10 h-10"
                                                />
                                            </div>
                                            <InputError message={errors.password_confirmation} />
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full h-11 bg-emerald-700 hover:bg-emerald-800"
                                    tabIndex={16}
                                    disabled={processing}
                                >
                                    {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin text-emerald-400" />}
                                    Create account
                                </Button>
                            </form>

                            <div className="mt-6 text-center text-sm text-gray-600">
                                Already have an account?{' '}
                                <TextLink href={route('login')} tabIndex={17} className="font-medium text-emerald-700 hover:text-emerald-800">
                                    Log in
                                </TextLink>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="text-center text-xs text-gray-500">
                        © 2026 Department of Agriculture • Republic of the Philippines
                    </div>
                </div>

                {/* Right Column - Cover Image (Sticky) */}
                <div className="relative hidden lg:block lg:sticky lg:top-0 lg:h-screen order-1 lg:order-2">
                    <div className="absolute inset-0 bg-emerald-700">
                        <img
                            src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1200&h=1600&fit=crop"
                            alt="Farmer working in agricultural field"
                            className="absolute inset-0 h-full w-full object-cover mix-blend-overlay opacity-30"
                        />
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-800 to-emerald-900/95" />
                    </div>
                    
                    {/* Branding Overlay */}
                    <div className="relative z-10 flex h-full flex-col items-center justify-center p-12 text-center text-white">
                        <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm">
                            <Leaf className="h-10 w-10" />
                        </div>
                        <h1 className="mb-4 text-4xl font-bold">Join Our Agricultural Community</h1>
                        <p className="mb-8 max-w-md text-lg text-emerald-100">
                            Register to access farmer benefits, crop monitoring, and government support programs
                        </p>
                        <div className="space-y-4 rounded-xl border border-white/20 bg-white/10 p-6 backdrop-blur-sm">
                            <ul className="text-sm text-emerald-50 space-y-2 text-left">
                                <li className="flex items-start gap-2">
                                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-300 flex-shrink-0" />
                                    <span>Access to agricultural programs and services</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-300 flex-shrink-0" />
                                    <span>Crop monitoring and management tools</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-300 flex-shrink-0" />
                                    <span>Direct support from agricultural technicians</span>
                                </li>
                            </ul>
                            <div className="flex items-center justify-center gap-2 text-xs text-emerald-200 pt-2">
                                <Building2 className="h-4 w-4" />
                                <span>Republic of the Philippines</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
