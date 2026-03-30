import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PersonalInfoProps {
    formData: any;
    setFormData: (data: any) => void;
    errors?: any;
}

export function PersonalInfoSection({ formData, setFormData, errors }: PersonalInfoProps) {
    return (
        <div className="space-y-4">
            <div className="border-b pb-2">
                <h3 className="text-lg font-semibold">Personal Information</h3>
                <p className="text-sm text-muted-foreground">Basic farmer details</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="first_name">First Name <span className="text-red-500">*</span></Label>
                    <Input
                        id="first_name"
                        value={formData.first_name}
                        onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                        className={errors?.first_name ? 'border-red-500' : ''}
                    />
                    {errors?.first_name && <p className="text-xs text-red-500">{errors.first_name}</p>}
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="middle_name">Middle Name</Label>
                    <Input
                        id="middle_name"
                        value={formData.middle_name}
                        onChange={(e) => setFormData({ ...formData, middle_name: e.target.value })}
                    />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="last_name">Surname <span className="text-red-500">*</span></Label>
                    <Input
                        id="last_name"
                        value={formData.last_name}
                        onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                        className={errors?.last_name ? 'border-red-500' : ''}
                    />
                    {errors?.last_name && <p className="text-xs text-red-500">{errors.last_name}</p>}
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="extension_name">Extension Name</Label>
                    <Input
                        id="extension_name"
                        value={formData.extension_name}
                        onChange={(e) => setFormData({ ...formData, extension_name: e.target.value })}
                        placeholder="Jr., Sr., III, etc."
                    />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="sex">Sex <span className="text-red-500">*</span></Label>
                    <Select 
                        value={formData.sex} 
                        onValueChange={(value) => setFormData({ ...formData, sex: value as 'Male' | 'Female' | 'Other' })}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select sex" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Male">Male</SelectItem>
                            <SelectItem value="Female">Female</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                    </Select>
                    {errors?.sex && <p className="text-xs text-red-500">{errors.sex}</p>}
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="birthdate">Date of Birth</Label>
                    <Input
                        id="birthdate"
                        type="date"
                        value={formData.birthdate}
                        onChange={(e) => setFormData({ ...formData, birthdate: e.target.value })}
                    />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="civil_status">Civil Status</Label>
                    <Select 
                        value={formData.civil_status || ''} 
                        onValueChange={(value) => setFormData({ ...formData, civil_status: value as 'single' | 'married' | 'widowed' | 'separated' | '' })}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select civil status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="">Not specified</SelectItem>
                            <SelectItem value="single">Single</SelectItem>
                            <SelectItem value="married">Married</SelectItem>
                            <SelectItem value="widowed">Widowed</SelectItem>
                            <SelectItem value="separated">Separated</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="religion">Religion</Label>
                    <Select 
                        value={formData.religion || ''} 
                        onValueChange={(value) => setFormData({ ...formData, religion: value as 'christianity' | 'islam' | 'others' | '' })}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select religion" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="">Not specified</SelectItem>
                            <SelectItem value="christianity">Christianity</SelectItem>
                            <SelectItem value="islam">Islam</SelectItem>
                            <SelectItem value="others">Others</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
    );
}
