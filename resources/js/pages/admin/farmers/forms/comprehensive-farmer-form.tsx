import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Award, Check, X } from 'lucide-react';
import React from 'react';
import { type Farm } from '@/types';

interface FarmerFormProps {
    formData: any;
    setFormData: (data: any) => void;
    errors?: any;
    mode?: 'create' | 'edit';
    existingFarms?: Farm[]; // Existing farms for selection
    categories?: any[]; // Categories for farming activity
    commodities?: any[]; // Commodities filtered by category
    varieties?: any[]; // Varieties filtered by commodity
}

export default function ComprehensiveFarmerForm({ formData, setFormData, errors, mode = 'create', existingFarms = [], categories = [], commodities = [], varieties = [] }: FarmerFormProps) {
    // Auto-calculate household members
    const maleCount = parseInt(formData.no_male_household_members?.toString()) || 0;
    const femaleCount = parseInt(formData.no_female_household_members?.toString()) || 0;
    
    // Update living members when male/female counts change
    React.useEffect(() => {
        const total = maleCount + femaleCount;
        if (formData.no_living_household_members !== total) {
            setFormData({ ...formData, no_living_household_members: total });
        }
    }, [maleCount, femaleCount]);

    // Check if civil status is single to disable spouse fields
    const isSingle = formData.civil_status === 'single';

    // State for farm creation step
    const [showFarmCreation, setShowFarmCreation] = React.useState(false);
    
    // Track which farms are in edit mode (by farm ID)
    const [editingFarmId, setEditingFarmId] = React.useState<number | null>(null);

    // Initialize or get farms array from formData
    const farms = formData.farms || [];

    // Add a new empty farm card to the list
    const handleAddFarm = () => {
        const newFarm = {
            id: Date.now(), // Temporary ID for React key
            farm_name: '',
            is_new: true, // Flag to distinguish new farms from existing ones
            farm_parcels: [],
        };
        setFormData({ ...formData, farms: [...farms, newFarm] });
        setShowFarmCreation(false);
        setEditingFarmId(newFarm.id); // Automatically put new farm in edit mode
    };

    // Update farm name (local state update without re-rendering parent conditionally)
    const handleUpdateFarmName = (farmId: number, farmName: string) => {
        const updatedFarms = farms.map((farm: any) => 
            farm.id === farmId ? { ...farm, farm_name: farmName } : farm
        );
        setFormData({ ...formData, farms: updatedFarms });
    };

    // Save farm name and exit edit mode
    const handleSaveFarmName = (farmId: number) => {
        setEditingFarmId(null); // Exit edit mode
    };

    // Enable edit mode for a farm
    const handleEditFarmName = (farmId: number) => {
        setEditingFarmId(farmId);
    };

    // Confirm/Add a farm parcel to a specific farm
    const handleAddParcel = (farmIndex: number) => {
        const updatedFarms = [...farms];
        const newParcel = {
            parcel_number: `Parcel ${updatedFarms[farmIndex].farm_parcels.length + 1}`,
            barangay: '',
            city_municipality: '',
            total_farm_area: '',
            within_ancestral_domain: false,
            ownership_document_type: '',
            ownership_document_number: '',
            agrarian_reform_beneficiary: false,
            ownership_type: '',
            landowner_name: '',
            landowner_contact: '',
            parcel_size: '',
            livestock_count: 0,
            farm_type: '',
            is_organic_practitioner: false,
            remarks: '',
        };
        updatedFarms[farmIndex].farm_parcels = [
            ...(updatedFarms[farmIndex].farm_parcels || []),
            newParcel,
        ];
        setFormData({ ...formData, farms: updatedFarms });
    };

    // Update a parcel in a specific farm
    const handleUpdateParcel = (farmIndex: number, parcelIndex: number, field: string, value: any) => {
        const updatedFarms = [...farms];
        updatedFarms[farmIndex].farm_parcels[parcelIndex][field] = value;
        setFormData({ ...formData, farms: updatedFarms });
    };

    // Remove a parcel from a specific farm
    const handleRemoveParcel = (farmIndex: number, parcelIndex: number) => {
        const updatedFarms = [...farms];
        updatedFarms[farmIndex].farm_parcels = updatedFarms[farmIndex].farm_parcels.filter(
            (_: any, i: number) => i !== parcelIndex
        );
        setFormData({ ...formData, farms: updatedFarms });
    };

    // Remove an entire farm
    const handleRemoveFarm = (farmIndex: number) => {
        const updatedFarms = farms.filter((_: any, i: number) => i !== farmIndex);
        setFormData({ ...formData, farms: updatedFarms });
    };

    return (
        <div className="space-y-6">
            {/* Enrollment Information */}
            <Card>
                <CardHeader>
                    <CardTitle>Enrollment Information</CardTitle>
                    <CardDescription>Registration details</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="enrollment_type">Enrollment Type</Label>
                        <Select 
                            value={formData.enrollment_type || 'new'} 
                            onValueChange={(value) => setFormData({ ...formData, enrollment_type: value as 'new' | 'updating' })}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="new">New Registration</SelectItem>
                                <SelectItem value="updating">Updating (With Previous Record)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    {formData.enrollment_type === 'updating' && (
                        <div className="grid gap-2">
                            <Label>Last Updated</Label>
                            <Input type="datetime-local" value={formData.enrollment_updated_at || ''} readOnly disabled />
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Personal Information */}
            <Card>
                <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>Basic farmer details</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                    <div className="grid gap-2">
                        <Label htmlFor="first_name">First Name <span className="text-red-500">*</span></Label>
                        <Input id="first_name" value={formData.first_name} onChange={(e) => setFormData({ ...formData, first_name: e.target.value })} />
                        {errors?.first_name && <p className="text-xs text-red-500">{errors.first_name}</p>}
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="middle_name">Middle Name</Label>
                        <Input id="middle_name" value={formData.middle_name} onChange={(e) => setFormData({ ...formData, middle_name: e.target.value })} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="last_name">Surname <span className="text-red-500">*</span></Label>
                        <Input id="last_name" value={formData.last_name} onChange={(e) => setFormData({ ...formData, last_name: e.target.value })} />
                        {errors?.last_name && <p className="text-xs text-red-500">{errors.last_name}</p>}
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="extension_name">Extension Name</Label>
                        <Input id="extension_name" value={formData.extension_name} onChange={(e) => setFormData({ ...formData, extension_name: e.target.value })} placeholder="Jr., Sr., III" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="sex">Sex <span className="text-red-500">*</span></Label>
                        <Select value={formData.sex} onValueChange={(value) => setFormData({ ...formData, sex: value })}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Male">Male</SelectItem>
                                <SelectItem value="Female">Female</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="birthdate">Date of Birth</Label>
                        <Input id="birthdate" type="date" value={formData.birthdate} onChange={(e) => setFormData({ ...formData, birthdate: e.target.value })} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="civil_status">Civil Status</Label>
                        <Select 
                            value={formData.civil_status || undefined} 
                            onValueChange={(value) => setFormData({ ...formData, civil_status: value })}
                        >
                            <SelectTrigger><SelectValue placeholder="Select civil status" /></SelectTrigger>
                            <SelectContent>
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
                            value={formData.religion || undefined} 
                            onValueChange={(value) => setFormData({ ...formData, religion: value })}
                        >
                            <SelectTrigger><SelectValue placeholder="Select religion" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="christianity">Christianity</SelectItem>
                                <SelectItem value="islam">Islam</SelectItem>
                                <SelectItem value="others">Others</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Address Information */}
            <Card>
                <CardHeader>
                    <CardTitle>Address Information</CardTitle>
                    <CardDescription>Complete residential address</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <div className="grid gap-2 md:col-span-2">
                        <Label htmlFor="house_lot_bldg_no_purok">House/Lot/Building No. or Purok</Label>
                        <Input id="house_lot_bldg_no_purok" value={formData.house_lot_bldg_no_purok} onChange={(e) => setFormData({ ...formData, house_lot_bldg_no_purok: e.target.value })} />
                    </div>
                    <div className="grid gap-2 md:col-span-2">
                        <Label htmlFor="street_sitio_subdv">Street/Sitio/Subdivision</Label>
                        <Input id="street_sitio_subdv" value={formData.street_sitio_subdv} onChange={(e) => setFormData({ ...formData, street_sitio_subdv: e.target.value })} />
                    </div>
                    <div className="grid gap-2 md:grid-cols-4">
                        <div className="grid gap-2">
                            <Label htmlFor="barangay">Barangay</Label>
                            <Input id="barangay" value={formData.barangay} onChange={(e) => setFormData({ ...formData, barangay: e.target.value })} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="municipality_city">Municipality/City</Label>
                            <Input id="municipality_city" value={formData.municipality_city} onChange={(e) => setFormData({ ...formData, municipality_city: e.target.value })} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="province">Province</Label>
                            <Input id="province" value={formData.province} onChange={(e) => setFormData({ ...formData, province: e.target.value })} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="region">Region</Label>
                            <Input id="region" value={formData.region} onChange={(e) => setFormData({ ...formData, region: e.target.value })} />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
                <CardHeader>
                    <CardTitle>Contact Information</CardTitle>
                    <CardDescription>Phone numbers and contact details</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                    <div className="grid gap-2">
                        <Label htmlFor="contact_number">Mobile Number</Label>
                        <Input id="contact_number" value={formData.contact_number} onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })} placeholder="09XXXXXXXXX" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="landline_number">Landline Number</Label>
                        <Input id="landline_number" value={formData.landline_number} onChange={(e) => setFormData({ ...formData, landline_number: e.target.value })} placeholder="(XX) XXX-XXXX" />
                    </div>
                </CardContent>
            </Card>

            {/* Spouse Information */}
            <Card className={isSingle ? 'opacity-50 pointer-events-none' : ''}>
                <CardHeader>
                    <CardTitle>Spouse Information {isSingle && '(Not applicable for Single)'}</CardTitle>
                    <CardDescription>If married, provide spouse details</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-4">
                    <div className="grid gap-2">
                        <Label htmlFor="spouse_first_name">First Name</Label>
                        <Input 
                            id="spouse_first_name" 
                            value={formData.spouse_first_name} 
                            onChange={(e) => setFormData({ ...formData, spouse_first_name: e.target.value })} 
                            disabled={isSingle}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="spouse_middle_name">Middle Name</Label>
                        <Input 
                            id="spouse_middle_name" 
                            value={formData.spouse_middle_name} 
                            onChange={(e) => setFormData({ ...formData, spouse_middle_name: e.target.value })} 
                            disabled={isSingle}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="spouse_surname">Surname</Label>
                        <Input 
                            id="spouse_surname" 
                            value={formData.spouse_surname} 
                            onChange={(e) => setFormData({ ...formData, spouse_surname: e.target.value })} 
                            disabled={isSingle}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="spouse_extension_name">Extension Name</Label>
                        <Input 
                            id="spouse_extension_name" 
                            value={formData.spouse_extension_name} 
                            onChange={(e) => setFormData({ ...formData, spouse_extension_name: e.target.value })} 
                            disabled={isSingle}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Household Information */}
            <Card>
                <CardHeader>
                    <CardTitle>Household Information</CardTitle>
                    <CardDescription>Family composition and members</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="is_household_head"
                            checked={formData.is_household_head || false}
                            onCheckedChange={(checked: boolean) => setFormData({ ...formData, is_household_head: checked })}
                        />
                        <Label htmlFor="is_household_head">Is Household Head</Label>
                    </div>
                    
                    {!formData.is_household_head && (
                        <div className="grid gap-4 md:grid-cols-4 border-t pt-4">
                            <div className="grid gap-2">
                                <Label>Household Head First Name</Label>
                                <Input value={formData.household_head_first_name} onChange={(e) => setFormData({ ...formData, household_head_first_name: e.target.value })} />
                            </div>
                            <div className="grid gap-2">
                                <Label>Household Head Middle Name</Label>
                                <Input value={formData.household_head_middle_name} onChange={(e) => setFormData({ ...formData, household_head_middle_name: e.target.value })} />
                            </div>
                            <div className="grid gap-2">
                                <Label>Household Head Surname</Label>
                                <Input value={formData.household_head_surname} onChange={(e) => setFormData({ ...formData, household_head_surname: e.target.value })} />
                            </div>
                            <div className="grid gap-2">
                                <Label>Relationship to Head</Label>
                                <Input value={formData.relationship_to_household_head} onChange={(e) => setFormData({ ...formData, relationship_to_household_head: e.target.value })} placeholder="e.g., Son, Daughter" />
                            </div>
                        </div>
                    )}

                    <div className="grid gap-4 md:grid-cols-3 border-t pt-4">
                        <div className="grid gap-2">
                            <Label htmlFor="no_living_household_members">No. of Living Members (Auto-calculated)</Label>
                            <Input 
                                id="no_living_household_members" 
                                type="number" 
                                min="0" 
                                value={formData.no_living_household_members} 
                                readOnly
                                disabled
                                className="bg-muted"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="no_male_household_members">No. of Male Members</Label>
                            <Input 
                                id="no_male_household_members" 
                                type="number" 
                                min="0" 
                                value={formData.no_male_household_members} 
                                onChange={(e) => setFormData({ ...formData, no_male_household_members: parseInt(e.target.value) || 0 })} 
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="no_female_household_members">No. of Female Members</Label>
                            <Input 
                                id="no_female_household_members" 
                                type="number" 
                                min="0" 
                                value={formData.no_female_household_members} 
                                onChange={(e) => setFormData({ ...formData, no_female_household_members: parseInt(e.target.value) || 0 })} 
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Education & Special Fields */}
            <Card>
                <CardHeader>
                    <CardTitle>Education & Special Fields</CardTitle>
                    <CardDescription>Educational background and special categories</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="highest_formal_education">Highest Formal Education</Label>
                        <Select 
                            value={formData.highest_formal_education || undefined} 
                            onValueChange={(value) => setFormData({ ...formData, highest_formal_education: value })}
                        >
                            <SelectTrigger><SelectValue placeholder="Select education level" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">None</SelectItem>
                                <SelectItem value="pre_school">Pre-School</SelectItem>
                                <SelectItem value="elementary">Elementary</SelectItem>
                                <SelectItem value="high_school_non_k12">High School (Non K-12)</SelectItem>
                                <SelectItem value="junior_hs_k12">Junior High School (K-12)</SelectItem>
                                <SelectItem value="senior_hs_k12">Senior High School (K-12)</SelectItem>
                                <SelectItem value="college">College</SelectItem>
                                <SelectItem value="vocational">Vocational</SelectItem>
                                <SelectItem value="post_graduate">Post-Graduate</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3 border-t pt-4">
                        <div className="flex items-center space-x-2">
                            <Checkbox id="is_pwd" checked={formData.is_pwd || false} onCheckedChange={(checked: boolean) => setFormData({ ...formData, is_pwd: checked })} />
                            <Label htmlFor="is_pwd">PWD</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox id="is_4ps_beneficiary" checked={formData.is_4ps_beneficiary || false} onCheckedChange={(checked: boolean) => setFormData({ ...formData, is_4ps_beneficiary: checked })} />
                            <Label htmlFor="is_4ps_beneficiary">4Ps Beneficiary</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox id="is_ip" checked={formData.is_ip || false} onCheckedChange={(checked: boolean) => setFormData({ ...formData, is_ip: checked })} />
                            <Label htmlFor="is_ip">Indigenous Person (IP)</Label>
                        </div>
                    </div>
                    
                    {formData.is_ip && (
                        <div className="grid gap-2">
                            <Label htmlFor="ip_specify">Specify IP Group</Label>
                            <Input id="ip_specify" value={formData.ip_specify} onChange={(e) => setFormData({ ...formData, ip_specify: e.target.value })} />
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Government ID */}
            <Card>
                <CardHeader>
                    <CardTitle>Government ID</CardTitle>
                    <CardDescription>Valid government identification (multiple IDs allowed)</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                    {/* Multiple Government IDs */}
                    <div className="space-y-4">
                        {formData.government_ids?.map((id: any, index: number) => (
                            <div key={index} className="p-4 border rounded-lg space-y-3 relative">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-semibold">ID #{index + 1}</h4>
                                    {formData.government_ids.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const newIds = formData.government_ids.filter((_: any, i: number) => i !== index);
                                                setFormData({ ...formData, government_ids: newIds });
                                            }}
                                            className="text-red-600 hover:text-red-800 text-sm"
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>
                                <div className="grid gap-2 md:grid-cols-3">
                                    <div className="grid gap-2">
                                        <Label>ID Type</Label>
                                        <Select 
                                            value={id.id_type || undefined} 
                                            onValueChange={(value) => {
                                                const newIds = [...formData.government_ids];
                                                newIds[index].id_type = value;
                                                setFormData({ ...formData, government_ids: newIds });
                                            }}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select ID type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="philsys">PhilSys (National ID)</SelectItem>
                                                <SelectItem value="umid">UMID</SelectItem>
                                                <SelectItem value="drivers_license">Driver's License</SelectItem>
                                                <SelectItem value="passport">Passport</SelectItem>
                                                <SelectItem value="voters_id">Voter's ID</SelectItem>
                                                <SelectItem value="sss">SSS ID</SelectItem>
                                                <SelectItem value="pagibig">Pag-IBIG ID</SelectItem>
                                                <SelectItem value="philhealth">PhilHealth ID</SelectItem>
                                                <SelectItem value="senior_citizen">Senior Citizen ID</SelectItem>
                                                <SelectItem value="pwd_id">PWD ID</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-2 md:col-span-2">
                                        <Label>ID Number</Label>
                                        <Input 
                                            value={id.id_number || ''} 
                                            onChange={(e) => {
                                                const newIds = [...formData.government_ids];
                                                newIds[index].id_number = e.target.value;
                                                setFormData({ ...formData, government_ids: newIds });
                                            }} 
                                            placeholder="Enter ID number"
                                        />
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label>Upload ID File (Image/PDF)</Label>
                                    <Input 
                                        type="file" 
                                        accept="image/*,.pdf"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                const newIds = [...formData.government_ids];
                                                newIds[index].file = file;
                                                newIds[index].file_name = file.name;
                                                setFormData({ ...formData, government_ids: newIds });
                                            }
                                        }}
                                    />
                                    {id.file_name && (
                                        <p className="text-xs text-muted-foreground">
                                            Selected: {id.file_name}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                        
                        {/* Add Another ID Button */}
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                const newIds = [...(formData.government_ids || []), { id_type: '', id_number: '', file: null, file_name: '' }];
                                setFormData({ ...formData, government_ids: newIds });
                            }}
                            className="w-full"
                        >
                            + Add Another Government ID
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Farm Profile */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Farm Profile</CardTitle>
                            <CardDescription>Add multiple farms and their land parcels</CardDescription>
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleAddFarm}
                            className="gap-2"
                        >
                            + Add New Farm
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="grid gap-6">
                    {/* Display all farms in a vertical stack */}
                    {farms.length > 0 && (
                        <div className="space-y-4">
                            {farms.map((farm: any, farmIndex: number) => (
                                <Card key={farm.id || farmIndex} className="border-2">
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3 flex-1">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500 text-white">
                                                    {farmIndex + 1}
                                                </div>
                                                <div className="flex-1 flex items-center gap-2">
                                                    {editingFarmId === farm.id ? (
                                                        <div className="flex items-center gap-2 flex-1">
                                                            <Input 
                                                                key={`farm-name-input-${farm.id}`}
                                                                value={farm.farm_name || ''} 
                                                                onChange={(e) => handleUpdateFarmName(farm.id, e.target.value)} 
                                                                placeholder="Enter farm name"
                                                                className="max-w-xs"
                                                                autoFocus
                                                                onKeyDown={(e) => {
                                                                    if (e.key === 'Enter') {
                                                                        handleSaveFarmName(farm.id);
                                                                    } else if (e.key === 'Escape') {
                                                                        setEditingFarmId(null);
                                                                    }
                                                                }}
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => handleSaveFarmName(farm.id)}
                                                                className="text-green-600 hover:text-green-800 p-1"
                                                                title="Save (Enter)"
                                                            >
                                                                <Check/>
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => setEditingFarmId(null)}
                                                                className="text-red-600 hover:text-red-800 p-1"
                                                                title="Cancel (Esc)"
                                                            >
                                                                <X />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        // View Mode - Click to Edit
                                                        <div 
                                                            className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 p-2 rounded-md transition-colors flex-1"
                                                            onClick={() => handleEditFarmName(farm.id)}
                                                            title="Click to edit farm name"
                                                        >
                                                            {farm.farm_name && farm.farm_name.trim() !== '' ? (
                                                                <p className="font-semibold">{farm.farm_name}</p>
                                                            ) : (
                                                                <p className="text-muted-foreground italic">Enter farm name...</p>
                                                            )}
                                                            
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <p className="text-xs text-muted-foreground">
                                                    {farm.farm_parcels?.length || 0} parcel(s)
                                                </p>
                                                <div className="flex gap-2">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleAddParcel(farmIndex)}
                                                        disabled={!farm.farm_name || farm.farm_name.trim() === ''}
                                                    >
                                                        + Add Farm Parcel
                                                    </Button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveFarm(farmIndex)}
                                                        className="text-red-600 hover:text-red-800 text-sm px-2"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        {farm.farm_parcels && farm.farm_parcels.length > 0 ? (
                                            <div className="space-y-4">
                                                {farm.farm_parcels.map((parcel: any, parcelIndex: number) => (
                                                    <div key={parcel.id || parcelIndex} className="p-4 border rounded-lg space-y-4 relative bg-muted/30">
                                                        <div className="flex items-center justify-between">
                                                            <h5 className="font-medium">{parcel.parcel_number || `Parcel #${parcelIndex + 1}`}</h5>
                                                            {farm.farm_parcels.length > 1 && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleRemoveParcel(farmIndex, parcelIndex)}
                                                                    className="text-red-600 hover:text-red-800 text-sm"
                                                                >
                                                                    Remove Parcel
                                                                </button>
                                                            )}
                                                        </div>

                                                        <div className="grid gap-4 md:grid-cols-3">
                                                            <div className="grid gap-2">
                                                                <Label>Parcel Number</Label>
                                                                <Input 
                                                                    value={parcel.parcel_number || ''} 
                                                                    onChange={(e) => handleUpdateParcel(farmIndex, parcelIndex, 'parcel_number', e.target.value)} 
                                                                />
                                                            </div>
                                                            <div className="grid gap-2">
                                                                <Label>Barangay</Label>
                                                                <Input 
                                                                    value={parcel.barangay || ''} 
                                                                    onChange={(e) => handleUpdateParcel(farmIndex, parcelIndex, 'barangay', e.target.value)} 
                                                                />
                                                            </div>
                                                            <div className="grid gap-2">
                                                                <Label>City/Municipality</Label>
                                                                <Input 
                                                                    value={parcel.city_municipality || ''} 
                                                                    onChange={(e) => handleUpdateParcel(farmIndex, parcelIndex, 'city_municipality', e.target.value)} 
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="grid gap-4 md:grid-cols-3">
                                                            <div className="grid gap-2">
                                                                <Label>Total Farm Area (hectares)</Label>
                                                                <Input 
                                                                    type="number" 
                                                                    step="0.01"
                                                                    value={parcel.total_farm_area || ''} 
                                                                    onChange={(e) => handleUpdateParcel(farmIndex, parcelIndex, 'total_farm_area', e.target.value)} 
                                                                />
                                                            </div>
                                                            <div className="grid gap-2">
                                                                <Label>Parcel Size (hectares)</Label>
                                                                <Input 
                                                                    type="number" 
                                                                    step="0.01"
                                                                    value={parcel.parcel_size || ''} 
                                                                    onChange={(e) => handleUpdateParcel(farmIndex, parcelIndex, 'parcel_size', e.target.value)} 
                                                                />
                                                            </div>
                                                            <div className="grid gap-2">
                                                                <Label>Livestock Count</Label>
                                                                <Input 
                                                                    type="number" 
                                                                    value={parcel.livestock_count || 0} 
                                                                    onChange={(e) => handleUpdateParcel(farmIndex, parcelIndex, 'livestock_count', parseInt(e.target.value) || 0)} 
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="grid gap-4 md:grid-cols-3">
                                                            <div className="grid gap-2">
                                                                <Label>Farm Type</Label>
                                                                <Select 
                                                                    value={parcel.farm_type || undefined} 
                                                                    onValueChange={(value) => handleUpdateParcel(farmIndex, parcelIndex, 'farm_type', value)}
                                                                >
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder="Select farm type" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value="irrigated">Irrigated</SelectItem>
                                                                        <SelectItem value="rainfed_upland">Rainfed Upland</SelectItem>
                                                                        <SelectItem value="rainfed_lowland">Rainfed Lowland</SelectItem>
                                                                        <SelectItem value="not_applicable">Not Applicable</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                            <div className="grid gap-2">
                                                                <Label>Ownership Type</Label>
                                                                <Select 
                                                                    value={parcel.ownership_type || undefined} 
                                                                    onValueChange={(value) => handleUpdateParcel(farmIndex, parcelIndex, 'ownership_type', value)}
                                                                >
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder="Select ownership" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value="registered_owner">Registered Owner</SelectItem>
                                                                        <SelectItem value="tenant">Tenant</SelectItem>
                                                                        <SelectItem value="lessee">Lessee</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                        </div>

                                                        {/* Landowner Information - Only show if NOT registered owner */}
                                                        {parcel.ownership_type && parcel.ownership_type !== 'registered_owner' && (
                                                            <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
                                                                <h5 className="font-medium text-sm">Landowner Information</h5>
                                                                <div className="grid gap-4 md:grid-cols-4">
                                                                    <div className="grid gap-2">
                                                                        <Label htmlFor={`landowner_first_name_${farmIndex}_${parcelIndex}`}>First Name</Label>
                                                                        <Input 
                                                                            id={`landowner_first_name_${farmIndex}_${parcelIndex}`}
                                                                            value={parcel.landowner_first_name || ''} 
                                                                            onChange={(e) => handleUpdateParcel(farmIndex, parcelIndex, 'landowner_first_name', e.target.value)} 
                                                                            placeholder="First name"
                                                                        />
                                                                    </div>
                                                                    <div className="grid gap-2">
                                                                        <Label htmlFor={`landowner_middle_name_${farmIndex}_${parcelIndex}`}>Middle Name</Label>
                                                                        <Input 
                                                                            id={`landowner_middle_name_${farmIndex}_${parcelIndex}`}
                                                                            value={parcel.landowner_middle_name || ''} 
                                                                            onChange={(e) => handleUpdateParcel(farmIndex, parcelIndex, 'landowner_middle_name', e.target.value)} 
                                                                            placeholder="Middle name"
                                                                        />
                                                                    </div>
                                                                    <div className="grid gap-2">
                                                                        <Label htmlFor={`landowner_surname_${farmIndex}_${parcelIndex}`}>Surname</Label>
                                                                        <Input 
                                                                            id={`landowner_surname_${farmIndex}_${parcelIndex}`}
                                                                            value={parcel.landowner_surname || ''} 
                                                                            onChange={(e) => handleUpdateParcel(farmIndex, parcelIndex, 'landowner_surname', e.target.value)} 
                                                                            placeholder="Surname"
                                                                        />
                                                                    </div>
                                                                    <div className="grid gap-2">
                                                                        <Label htmlFor={`landowner_extension_${farmIndex}_${parcelIndex}`}>Extension Name</Label>
                                                                        <Input 
                                                                            id={`landowner_extension_${farmIndex}_${parcelIndex}`}
                                                                            value={parcel.landowner_extension || ''} 
                                                                            onChange={(e) => handleUpdateParcel(farmIndex, parcelIndex, 'landowner_extension', e.target.value)} 
                                                                            placeholder="Jr., Sr., III"
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}

                                                        <div className="grid gap-4 md:grid-cols-2">
                                                            <div className="grid gap-2">
                                                                <Label>Ownership Document Type</Label>
                                                                <Select 
                                                                    value={parcel.ownership_document_type || undefined} 
                                                                    onValueChange={(value) => handleUpdateParcel(farmIndex, parcelIndex, 'ownership_document_type', value)}
                                                                >
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder="Select document type" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value="certificate_of_land_transfer">Certificate of Land Transfer</SelectItem>
                                                                        <SelectItem value="emancipation_patent">Emancipation Patent</SelectItem>
                                                                        <SelectItem value="individual_cloa">Individual Certificate of Land Ownership Award (CLOA)</SelectItem>
                                                                        <SelectItem value="collective_cloa">Collective CLOA</SelectItem>
                                                                        <SelectItem value="co_ownership_cloa">Co-Ownership CLOA</SelectItem>
                                                                        <SelectItem value="agricultural_sales_patent">Agricultural Sales Patent</SelectItem>
                                                                        <SelectItem value="homestead_patent">Homestead Patent</SelectItem>
                                                                        <SelectItem value="free_patent">Free Patent</SelectItem>
                                                                        <SelectItem value="certificate_of_title">Certificate of Title or Regular Title</SelectItem>
                                                                        <SelectItem value="ancestral_domain_title">Certificate of Ancestral Domain Title</SelectItem>
                                                                        <SelectItem value="ancestral_land_title">Certificate of Ancestral Land Title</SelectItem>
                                                                        <SelectItem value="tax_declaration">Tax Declaration</SelectItem>
                                                                        <SelectItem value="others">Others (e.g., Brgy Clearance)</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                        </div>

                                                        {/* Ownership Document Upload */}
                                                        <div className="grid gap-2">
                                                            <Label htmlFor={`document_upload_${farmIndex}_${parcelIndex}`}>Upload Ownership Document</Label>
                                                            <Input 
                                                                id={`document_upload_${farmIndex}_${parcelIndex}`}
                                                                type="file" 
                                                                accept=".pdf,.jpg,.jpeg,.png"
                                                                onChange={(e) => {
                                                                    const file = e.target.files?.[0];
                                                                    if (file) {
                                                                        // Store file reference in parcel data
                                                                        handleUpdateParcel(farmIndex, parcelIndex, 'document_file', file);
                                                                    }
                                                                }}
                                                            />
                                                            <p className="text-xs text-muted-foreground">
                                                                Accepted formats: PDF, JPG, PNG. Maximum file size: 5MB
                                                            </p>
                                                            {parcel.document_file && (
                                                                <div className="flex items-center justify-between p-2 bg-muted rounded-md mt-2">
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-sm font-medium">{parcel.document_file.name}</span>
                                                                        <Badge variant="outline" className="text-xs">
                                                                            {(parcel.document_file.size / 1024).toFixed(1)} KB
                                                                        </Badge>
                                                                    </div>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleUpdateParcel(farmIndex, parcelIndex, 'document_file', null)}
                                                                        className="text-red-600 hover:text-red-800 text-sm"
                                                                    >
                                                                        Remove
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="grid gap-4 md:grid-cols-3">
                                                            <div className="flex items-center space-x-2">
                                                                <Checkbox 
                                                                    id={`within_ancestral_domain_${farmIndex}_${parcelIndex}`} 
                                                                    checked={parcel.within_ancestral_domain || false} 
                                                                    onCheckedChange={(checked: boolean) => handleUpdateParcel(farmIndex, parcelIndex, 'within_ancestral_domain', checked)} 
                                                                />
                                                                <Label htmlFor={`within_ancestral_domain_${farmIndex}_${parcelIndex}`}>Within Ancestral Domain</Label>
                                                            </div>
                                                            <div className="flex items-center space-x-2">
                                                                <Checkbox 
                                                                    id={`agrarian_reform_${farmIndex}_${parcelIndex}`} 
                                                                    checked={parcel.agrarian_reform_beneficiary || false} 
                                                                    onCheckedChange={(checked: boolean) => handleUpdateParcel(farmIndex, parcelIndex, 'agrarian_reform_beneficiary', checked)} 
                                                                />
                                                                <Label htmlFor={`agrarian_reform_${farmIndex}_${parcelIndex}`}>Agrarian Reform Beneficiary</Label>
                                                            </div>
                                                            <div className="flex items-center space-x-2">
                                                                <Checkbox 
                                                                    id={`is_organic_${farmIndex}_${parcelIndex}`} 
                                                                    checked={parcel.is_organic_practitioner || false} 
                                                                    onCheckedChange={(checked: boolean) => handleUpdateParcel(farmIndex, parcelIndex, 'is_organic_practitioner', checked)} 
                                                                />
                                                                <Label htmlFor={`is_organic_${farmIndex}_${parcelIndex}`}>Organic Practitioner</Label>
                                                            </div>
                                                        </div>

                                                        <div className="grid gap-2">
                                                            <Label>Remarks</Label>
                                                            <Input 
                                                                value={parcel.remarks || ''} 
                                                                onChange={(e) => handleUpdateParcel(farmIndex, parcelIndex, 'remarks', e.target.value)} 
                                                                placeholder="Additional notes about this parcel"
                                                            />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="p-4 border rounded-lg bg-muted/30 text-center">
                                                <p className="text-muted-foreground">
                                                    {!farm.farm_name || farm.farm_name.trim() === '' 
                                                        ? "Enter farm name above to enable adding parcels"
                                                        : "No parcels yet. Click \"+ Add Farm Parcel\" to add one."
                                                    }
                                                </p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}

                    {/* Empty state when no farms */}
                    {farms.length === 0 && (
                        <div className="text-center py-8">
                            <div className="mb-4">
                                <Award className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
                            </div>
                            <h4 className="text-lg font-semibold mb-2">No Farms Yet</h4>
                            <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                                Click "+ Add New Farm" to create your first farm and add land parcels.
                                </p>
                        </div>
                    )}
                </CardContent>
            </Card>

        {/* Emergency Contact */}
            <Card>    
                <CardHeader>
                    <CardTitle>Emergency Contact</CardTitle>
                    <CardDescription>Person to contact in case of emergency</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <div className="grid gap-2 md:grid-cols-4">
                        <div className="grid gap-2">
                            <Label>First Name</Label>
                            <Input value={formData.emergency_contact_first_name} onChange={(e) => setFormData({ ...formData, emergency_contact_first_name: e.target.value })} />
                        </div>
                        <div className="grid gap-2">
                            <Label>Middle Name</Label>
                            <Input value={formData.emergency_contact_middle_name} onChange={(e) => setFormData({ ...formData, emergency_contact_middle_name: e.target.value })} />
                        </div>
                        <div className="grid gap-2">
                            <Label>Last Name</Label>
                            <Input value={formData.emergency_contact_last_name} onChange={(e) => setFormData({ ...formData, emergency_contact_last_name: e.target.value })} />
                        </div>
                        <div className="grid gap-2">
                            <Label>Extension Name</Label>
                            <Input value={formData.emergency_contact_extension_name} onChange={(e) => setFormData({ ...formData, emergency_contact_extension_name: e.target.value })} />
                        </div>
                    </div>
                    <div className="grid gap-2 md:col-span-4">
                        <Label htmlFor="emergency_contact_number">Contact Number</Label>
                        <Input id="emergency_contact_number" value={formData.emergency_contact_number} onChange={(e) => setFormData({ ...formData, emergency_contact_number: e.target.value })} placeholder="09XXXXXXXXX" />
                    </div>
                </CardContent>
            </Card>

            {/* Main Livelihood */}
            <Card>
                <CardHeader>
                    <CardTitle>Main Livelihood</CardTitle>
                    <CardDescription>Select your primary livelihood activity</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Livelihood Type Selection */}
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="flex items-center space-x-2">
                            <Checkbox 
                                id="livelihood_farmer" 
                                checked={formData.main_livelihood_type === 'farmer'} 
                                onCheckedChange={(checked: boolean) => {
                                    if (checked) {
                                        setFormData({ ...formData, main_livelihood_type: 'farmer' });
                                    } else {
                                        setFormData({ ...formData, main_livelihood_type: '' });
                                    }
                                }} 
                            />
                            <Label htmlFor="livelihood_farmer" className="font-medium cursor-pointer">Farmer</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox 
                                id="livelihood_farmworker" 
                                checked={formData.main_livelihood_type === 'farmworker'} 
                                onCheckedChange={(checked: boolean) => {
                                    if (checked) {
                                        setFormData({ ...formData, main_livelihood_type: 'farmworker' });
                                    } else {
                                        setFormData({ ...formData, main_livelihood_type: '' });
                                    }
                                }} 
                            />
                            <Label htmlFor="livelihood_farmworker" className="font-medium cursor-pointer">Farmworker/Laborer</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox 
                                id="livelihood_fisherfolk" 
                                checked={formData.main_livelihood_type === 'fisherfolk'} 
                                onCheckedChange={(checked: boolean) => {
                                    if (checked) {
                                        setFormData({ ...formData, main_livelihood_type: 'fisherfolk' });
                                    } else {
                                        setFormData({ ...formData, main_livelihood_type: '' });
                                    }
                                }} 
                            />
                            <Label htmlFor="livelihood_fisherfolk" className="font-medium cursor-pointer">Fisherfolk</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox 
                                id="livelihood_agri_youth" 
                                checked={formData.main_livelihood_type === 'agri_youth'} 
                                onCheckedChange={(checked: boolean) => {
                                    if (checked) {
                                        setFormData({ ...formData, main_livelihood_type: 'agri_youth' });
                                    } else {
                                        setFormData({ ...formData, main_livelihood_type: '' });
                                    }
                                }} 
                            />
                            <Label htmlFor="livelihood_agri_youth" className="font-medium cursor-pointer">Agricultural Youth</Label>
                        </div>
                    </div>

                    {/* Farmer Details */}
                    {formData.main_livelihood_type === 'farmer' && (
                        <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
                            <h5 className="font-medium">Farming Activity</h5>
                            
                            {/* Category Selection - Multi-select */}
                            <div className="grid gap-2">
                                <Label>Category (Select all that apply)</Label>
                                <Select 
                                    value={Array.isArray(formData.farmer_category) ? formData.farmer_category[0] : undefined} 
                                    onValueChange={(value) => {
                                        // Handle multi-select by toggling values
                                        const currentCategories = Array.isArray(formData.farmer_category) ? formData.farmer_category : [];
                                        const newCategories = currentCategories.includes(value)
                                            ? currentCategories.filter((c: any) => c !== value)
                                            : [...currentCategories, value];
                                        setFormData({ 
                                            ...formData, 
                                            farmer_category: newCategories,
                                            farmer_commodities: [], 
                                            farmer_varieties: [] 
                                        });
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select categories" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((category: any) => {
                                            const isSelected = Array.isArray(formData.farmer_category) && formData.farmer_category.includes(category.id.toString());
                                            return (
                                                <SelectItem key={category.id} value={category.id.toString()} className="relative">
                                                    <span className="flex items-center gap-2">
                                                        <span className={`w-4 h-4 border rounded flex items-center justify-center ${
                                                            isSelected ? 'bg-primary text-primary-foreground' : 'border-input'
                                                        }`}>
                                                            {isSelected && '✓'}
                                                        </span>
                                                        {category.name}
                                                    </span>
                                                </SelectItem>
                                            );
                                        })}
                                    </SelectContent>
                                </Select>
                                {Array.isArray(formData.farmer_category) && formData.farmer_category.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {formData.farmer_category.map((categoryId: any) => {
                                            const category = categories.find((c: any) => c.id.toString() === categoryId);
                                            return category ? (
                                                <Badge key={categoryId} variant="outline" className="text-xs">
                                                    {category.name}
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const newCategories = formData.farmer_category.filter((c: any) => c !== categoryId);
                                                            setFormData({ 
                                                                ...formData, 
                                                                farmer_category: newCategories,
                                                                farmer_commodities: [],
                                                                farmer_varieties: []
                                                            });
                                                        }}
                                                        className="ml-1 text-red-600 hover:text-red-800 font-bold"
                                                    >
                                                        ×
                                                    </button>
                                                </Badge>
                                            ) : null;
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Commodity Selection - Filtered by Categories & Multi-select */}
                            {Array.isArray(formData.farmer_category) && formData.farmer_category.length > 0 && (
                                <div className="grid gap-2">
                                    <Label>Commodities (Select all that apply)</Label>
                                    <Select 
                                        value={Array.isArray(formData.farmer_commodities) ? formData.farmer_commodities[0] : undefined} 
                                        onValueChange={(value) => {
                                            // Handle multi-select by toggling values
                                            const currentCommodities = Array.isArray(formData.farmer_commodities) ? formData.farmer_commodities : [];
                                            const newCommodities = currentCommodities.includes(value)
                                                ? currentCommodities.filter((c: any) => c !== value)
                                                : [...currentCommodities, value];
                                            setFormData({ 
                                                ...formData, 
                                                farmer_commodities: newCommodities,
                                                farmer_varieties: [] // Reset varieties when commodities change
                                            });
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select commodities" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {commodities
                                                .filter((commodity: any) => 
                                                    Array.isArray(formData.farmer_category) && 
                                                    commodity.category_id != null &&
                                                    formData.farmer_category.includes(commodity.category_id.toString())
                                                )
                                                .map((commodity: any) => {
                                                    const isSelected = Array.isArray(formData.farmer_commodities) && formData.farmer_commodities.includes(commodity.id.toString());
                                                    return (
                                                        <SelectItem key={commodity.id} value={commodity.id.toString()} className="relative">
                                                            <span className="flex items-center gap-2">
                                                                <span className={`w-4 h-4 border rounded flex items-center justify-center ${
                                                                    isSelected ? 'bg-primary text-primary-foreground' : 'border-input'
                                                                }`}>
                                                                    {isSelected && '✓'}
                                                                </span>
                                                                {commodity.name}
                                                            </span>
                                                        </SelectItem>
                                                    );
                                                })}
                                        </SelectContent>
                                    </Select>
                                    {Array.isArray(formData.farmer_commodities) && formData.farmer_commodities.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {formData.farmer_commodities.map((commodityId: any) => {
                                                const commodity = commodities.find((c: any) => c.id.toString() === commodityId);
                                                return commodity ? (
                                                    <Badge key={commodityId} variant="secondary" className="text-xs">
                                                        {commodity.name}
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const newCommodities = formData.farmer_commodities.filter((c: any) => c !== commodityId);
                                                                setFormData({ 
                                                                    ...formData, 
                                                                    farmer_commodities: newCommodities,
                                                                    farmer_varieties: []
                                                                });
                                                            }}
                                                            className="ml-1 text-red-600 hover:text-red-800 font-bold"
                                                        >
                                                            ×
                                                        </button>
                                                    </Badge>
                                                ) : null;
                                            })}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Variety Selection - Filtered by Commodities & Multi-select */}
                            {Array.isArray(formData.farmer_commodities) && formData.farmer_commodities.length > 0 && (
                                <div className="grid gap-2">
                                    <Label>Varieties (Select all that apply)</Label>
                                    <Select 
                                        value={Array.isArray(formData.farmer_varieties) ? formData.farmer_varieties[0] : undefined} 
                                        onValueChange={(value) => {
                                            // Handle multi-select by toggling values
                                            const currentVarieties = Array.isArray(formData.farmer_varieties) ? formData.farmer_varieties : [];
                                            const newVarieties = currentVarieties.includes(value)
                                                ? currentVarieties.filter((v: any) => v !== value)
                                                : [...currentVarieties, value];
                                            setFormData({ 
                                                ...formData, 
                                                farmer_varieties: newVarieties
                                            });
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select varieties" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {varieties
                                                .filter((variety: any) => {
                                                    // Filter varieties based on selected commodities
                                                    return Array.isArray(formData.farmer_commodities) && 
                                                        variety.commodity_id != null &&
                                                        formData.farmer_commodities.includes(variety.commodity_id.toString());
                                                })
                                                .map((variety: any) => {
                                                    const isSelected = Array.isArray(formData.farmer_varieties) && formData.farmer_varieties.includes(variety.id.toString());
                                                    return (
                                                        <SelectItem key={variety.id} value={variety.id.toString()} className="relative">
                                                            <span className="flex items-center gap-2">
                                                                <span className={`w-4 h-4 border rounded flex items-center justify-center ${
                                                                    isSelected ? 'bg-primary text-primary-foreground' : 'border-input'
                                                                }`}>
                                                                    {isSelected && '✓'}
                                                                </span>
                                                                {variety.name}
                                                            </span>
                                                        </SelectItem>
                                                    );
                                                })}
                                        </SelectContent>
                                    </Select>
                                    {Array.isArray(formData.farmer_varieties) && formData.farmer_varieties.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {formData.farmer_varieties.map((varietyId: any) => {
                                                const variety = varieties.find((v: any) => v.id.toString() === varietyId);
                                                return variety ? (
                                                    <Badge key={varietyId} variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-300">
                                                        {variety.name}
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const newVarieties = formData.farmer_varieties.filter((v: any) => v !== varietyId);
                                                                setFormData({ 
                                                                    ...formData, 
                                                                    farmer_varieties: newVarieties
                                                                });
                                                            }}
                                                            className="ml-1 text-red-600 hover:text-red-800 font-bold"
                                                        >
                                                            ×
                                                        </button>
                                                    </Badge>
                                                ) : null;
                                            })}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Farmworker Details */}
                    {formData.main_livelihood_type === 'farmworker' && (
                        <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
                            <h5 className="font-medium">Kind of Work (Check all that apply)</h5>
                            <div className="grid gap-3 md:grid-cols-2">
                                <div className="flex items-center space-x-2">
                                    <Checkbox 
                                        id="work_land_prep" 
                                        checked={formData.farmworker_land_preparation || false} 
                                        onCheckedChange={(checked: boolean) => setFormData({ ...formData, farmworker_land_preparation: checked })} 
                                    />
                                    <Label htmlFor="work_land_prep">Land Preparation</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox 
                                        id="work_planting" 
                                        checked={formData.farmworker_planting || false} 
                                        onCheckedChange={(checked: boolean) => setFormData({ ...formData, farmworker_planting: checked })} 
                                    />
                                    <Label htmlFor="work_planting">Planting/Transplanting</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox 
                                        id="work_cultivation" 
                                        checked={formData.farmworker_cultivation || false} 
                                        onCheckedChange={(checked: boolean) => setFormData({ ...formData, farmworker_cultivation: checked })} 
                                    />
                                    <Label htmlFor="work_cultivation">Cultivation</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox 
                                        id="work_harvesting" 
                                        checked={formData.farmworker_harvesting || false} 
                                        onCheckedChange={(checked: boolean) => setFormData({ ...formData, farmworker_harvesting: checked })} 
                                    />
                                    <Label htmlFor="work_harvesting">Harvesting</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox 
                                        id="work_others" 
                                        checked={formData.farmworker_others || false} 
                                        onCheckedChange={(checked: boolean) => setFormData({ ...formData, farmworker_others: checked })} 
                                    />
                                    <Label htmlFor="work_others">Others</Label>
                                </div>
                            </div>
                            {(formData.farmworker_others || false) && (
                                <div className="grid gap-2">
                                    <Label htmlFor="farmworker_others_specify">Specify Other Work</Label>
                                    <Input 
                                        id="farmworker_others_specify"
                                        value={formData.farmworker_others_specify || ''} 
                                        onChange={(e) => setFormData({ ...formData, farmworker_others_specify: e.target.value })} 
                                        placeholder="Specify other kind of work"
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    {/* Fisherfolk Details */}
                    {formData.main_livelihood_type === 'fisherfolk' && (
                        <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
                            <h5 className="font-medium">Fisherfolk Activity (Check all that apply)</h5>
                            <div className="grid gap-3 md:grid-cols-2">
                                <div className="flex items-center space-x-2">
                                    <Checkbox 
                                        id="fish_capture" 
                                        checked={formData.fisherfolk_fish_capture || false} 
                                        onCheckedChange={(checked: boolean) => setFormData({ ...formData, fisherfolk_fish_capture: checked })} 
                                    />
                                    <Label htmlFor="fish_capture">Fish Capture</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox 
                                        id="fish_aquaculture" 
                                        checked={formData.fisherfolk_aquaculture || false} 
                                        onCheckedChange={(checked: boolean) => setFormData({ ...formData, fisherfolk_aquaculture: checked })} 
                                    />
                                    <Label htmlFor="fish_aquaculture">Aquaculture</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox 
                                        id="fish_gleaning" 
                                        checked={formData.fisherfolk_gleaning || false} 
                                        onCheckedChange={(checked: boolean) => setFormData({ ...formData, fisherfolk_gleaning: checked })} 
                                    />
                                    <Label htmlFor="fish_gleaning">Gleaning</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox 
                                        id="fish_processing" 
                                        checked={formData.fisherfolk_processing || false} 
                                        onCheckedChange={(checked: boolean) => setFormData({ ...formData, fisherfolk_processing: checked })} 
                                    />
                                    <Label htmlFor="fish_processing">Fish Processing</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox 
                                        id="fish_vending" 
                                        checked={formData.fisherfolk_vending || false} 
                                        onCheckedChange={(checked: boolean) => setFormData({ ...formData, fisherfolk_vending: checked })} 
                                    />
                                    <Label htmlFor="fish_vending">Fish Vending</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox 
                                        id="fish_others" 
                                        checked={formData.fisherfolk_others || false} 
                                        onCheckedChange={(checked: boolean) => setFormData({ ...formData, fisherfolk_others: checked })} 
                                    />
                                    <Label htmlFor="fish_others">Others</Label>
                                </div>
                            </div>
                            {(formData.fisherfolk_others || false) && (
                                <div className="grid gap-2">
                                    <Label htmlFor="fisherfolk_others_specify">Specify Other Activity</Label>
                                    <Input 
                                        id="fisherfolk_others_specify"
                                        value={formData.fisherfolk_others_specify || ''} 
                                        onChange={(e) => setFormData({ ...formData, fisherfolk_others_specify: e.target.value })} 
                                        placeholder="Specify other activity"
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    {/* Agri-Youth Details */}
                    {formData.main_livelihood_type === 'agri_youth' && (
                        <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
                            <h5 className="font-medium">Agricultural Youth Status (Check all that apply)</h5>
                            <div className="grid gap-3">
                                <div className="flex items-center space-x-2">
                                    <Checkbox 
                                        id="youth_farming_household" 
                                        checked={formData.agri_youth_farming_household || false} 
                                        onCheckedChange={(checked: boolean) => setFormData({ ...formData, agri_youth_farming_household: checked })} 
                                    />
                                    <Label htmlFor="youth_farming_household">Part of a farming household</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox 
                                        id="youth_formal_course" 
                                        checked={formData.agri_youth_formal_course || false} 
                                        onCheckedChange={(checked: boolean) => setFormData({ ...formData, agri_youth_formal_course: checked })} 
                                    />
                                    <Label htmlFor="youth_formal_course">Attending/Attended formal agriculture/fishery related course</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox 
                                        id="youth_participated" 
                                        checked={formData.agri_youth_participated || false} 
                                        onCheckedChange={(checked: boolean) => setFormData({ ...formData, agri_youth_participated: checked })} 
                                    />
                                    <Label htmlFor="youth_participated">Participated in any agricultural activity/program</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox 
                                        id="youth_others" 
                                        checked={formData.agri_youth_others || false} 
                                        onCheckedChange={(checked: boolean) => setFormData({ ...formData, agri_youth_others: checked })} 
                                    />
                                    <Label htmlFor="youth_others">Others</Label>
                                </div>
                            </div>
                            {(formData.agri_youth_others || false) && (
                                <div className="grid gap-2">
                                    <Label htmlFor="agri_youth_others_specify">Specify Other Status</Label>
                                    <Input 
                                        id="agri_youth_others_specify"
                                        value={formData.agri_youth_others_specify || ''} 
                                        onChange={(e) => setFormData({ ...formData, agri_youth_others_specify: e.target.value })} 
                                        placeholder="Specify other status"
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    {/* Gross Annual Income */}
                    <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
                        <h5 className="font-medium">Gross Annual Income Last Year</h5>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="grid gap-2">
                                <Label htmlFor="income_farming">Farming/Fishing Income (₱)</Label>
                                <Input 
                                    id="income_farming"
                                    type="number" 
                                    value={formData.gross_annual_income_farming || ''} 
                                    onChange={(e) => setFormData({ ...formData, gross_annual_income_farming: e.target.value })} 
                                    placeholder="Enter income from farming/fishing"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="income_non_farming">Non-Farming Income (₱)</Label>
                                <Input 
                                    id="income_non_farming"
                                    type="number" 
                                    value={formData.gross_annual_income_non_farming || ''} 
                                    onChange={(e) => setFormData({ ...formData, gross_annual_income_non_farming: e.target.value })} 
                                    placeholder="Enter income from other sources"
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
