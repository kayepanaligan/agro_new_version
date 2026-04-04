import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type CropMonitoringFolder, type CropMonitoringItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ArrowLeft, Plus, MapPin, Calendar, User, FileText, Image as ImageIcon, Video, Cloud, Thermometer, Wind, Droplets, ExternalLink } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Monitoring Folders',
        href: '/admin/monitoring-folders',
    },
];

const getWeatherIcon = (condition?: string) => {
    if (!condition) return <Cloud className="h-4 w-4" />;
    const lower = condition.toLowerCase();
    if (lower.includes('sunny')) return <Cloud className="h-4 w-4 text-yellow-500" />;
    if (lower.includes('rain')) return <Cloud className="h-4 w-4 text-blue-500" />;
    if (lower.includes('cloud')) return <Cloud className="h-4 w-4 text-gray-500" />;
    return <Cloud className="h-4 w-4" />;
};

interface Props {
    folder: CropMonitoringFolder;
    items: CropMonitoringItem[];
}

// Reusable Timeline Card Content Component
function TimelineCardContent({ 
    item, 
    isFirst, 
    dateInfo, 
    setEnlargedImage, 
    openMap, 
    handleDelete 
}: { 
    item: CropMonitoringItem;
    isFirst: boolean;
    dateInfo: { month: string; day: number; fullDate: string };
    setEnlargedImage: (url: string | null) => void;
    openMap: (lat: number, lng: number) => void;
    handleDelete: (id: number) => void;
}) {
    return (
        <div className="p-5">
            {/* Header with Latest Badge */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-lg font-semibold">{item.item_name}</h3>
                        {isFirst && (
                            <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                                Latest Update
                            </Badge>
                        )}
                    </div>
                    
                    {/* User Avatar and Info */}
                    <div className="flex items-center gap-3 text-sm">
                        <Avatar className="h-8 w-8 border-2 border-background">
                            <AvatarImage src={item.updater?.avatar || undefined} />
                            <AvatarFallback className="bg-green-500 text-white text-xs">
                                {item.updater?.first_name?.[0]}{item.updater?.last_name?.[0]}
                            </AvatarFallback>
                        </Avatar>
                        <span className="text-muted-foreground">
                            {item.updater ? `${item.updater.first_name} ${item.updater.last_name}` : 'Unknown'}
                        </span>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-muted-foreground">{dateInfo.fullDate}</span>
                    </div>
                </div>

                {/* Dropdown Menu */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="1" />
                                <circle cx="19" cy="12" r="1" />
                                <circle cx="5" cy="12" r="1" />
                            </svg>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {item.media_path && (
                            <DropdownMenuItem onClick={() => setEnlargedImage(`/storage/${item.media_path}`)}>
                                <ImageIcon className="mr-2 h-4 w-4" />
                                View Assets
                            </DropdownMenuItem>
                        )}
                        {item.latitude && item.longitude && (
                            <DropdownMenuItem onClick={() => openMap(Number(item.latitude), Number(item.longitude))}>
                                <MapPin className="mr-2 h-4 w-4" />
                                View on Map
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={() => handleDelete(item.crop_monitoring_item_id)}
                            className="text-destructive focus:text-destructive"
                        >
                            Delete Entry
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Description */}
            {item.description && (
                <p className="text-sm text-muted-foreground mb-4 whitespace-pre-wrap">{item.description}</p>
            )}

            {/* Weather Details */}
            {(item.temperature || item.weather_condition || item.humidity || item.wind_speed) && (
                <div className="grid grid-cols-2 gap-3 mb-4 p-3 rounded-lg bg-muted/30">
                    {item.temperature && (
                        <div className="flex items-center gap-2 text-sm">
                            <Thermometer className="h-4 w-4 text-orange-500" />
                            <div>
                                <div className="text-xs text-muted-foreground">Temp</div>
                                <div className="font-medium">{Number(item.temperature).toFixed(1)}°C</div>
                            </div>
                        </div>
                    )}
                    {item.weather_condition && (
                        <div className="flex items-center gap-2 text-sm">
                            {getWeatherIcon(item.weather_condition)}
                            <div>
                                <div className="text-xs text-muted-foreground">Condition</div>
                                <div className="font-medium">{item.weather_condition}</div>
                            </div>
                        </div>
                    )}
                    {item.humidity && (
                        <div className="flex items-center gap-2 text-sm">
                            <Droplets className="h-4 w-4 text-blue-500" />
                            <div>
                                <div className="text-xs text-muted-foreground">Humidity</div>
                                <div className="font-medium">{item.humidity}%</div>
                            </div>
                        </div>
                    )}
                    {item.wind_speed && (
                        <div className="flex items-center gap-2 text-sm">
                            <Wind className="h-4 w-4 text-teal-500" />
                            <div>
                                <div className="text-xs text-muted-foreground">Wind</div>
                                <div className="font-medium">{Number(item.wind_speed).toFixed(1)} km/h</div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Media Thumbnail with Rounded Corners */}
            {item.media_path && (
                <div 
                    className="w-full h-48 rounded-lg overflow-hidden border cursor-pointer hover:opacity-90 transition-opacity mb-3"
                    onClick={() => setEnlargedImage(`/storage/${item.media_path}`)}
                >
                    {item.media_path.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                        <img
                            src={`/storage/${item.media_path}`}
                            alt="Observation"
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-muted">
                            <Video className="h-12 w-12 text-muted-foreground" />
                        </div>
                    )}
                </div>
            )}

            {/* GPS Coordinates */}
            {item.latitude && item.longitude && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{Number(item.latitude).toFixed(6)}, {Number(item.longitude).toFixed(6)}</span>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2"
                        onClick={() => openMap(Number(item.latitude), Number(item.longitude))}
                    >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        View Map
                    </Button>
                </div>
            )}
        </div>
    );
}

export default function MonitoringFolderDetail({ folder, items }: Props) {
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [enlargedImage, setEnlargedImage] = useState<string | null>(null);
    const [selectedCoords, setSelectedCoords] = useState<{ lat: number; lng: number } | null>(null);

    const addForm = useForm({
        item_name: '',
        description: '',
        latitude: '',
        longitude: '',
        temperature: '',
        weather_condition: '',
        humidity: '',
        wind_speed: '',
        weather_notes: '',
        observation_date: new Date().toISOString().split('T')[0],
        media: null as File | null,
    });

    const handleAdd = () => {
        const formData = new FormData();
        formData.append('item_name', addForm.data.item_name);
        formData.append('description', addForm.data.description || '');
        if (addForm.data.latitude) formData.append('latitude', addForm.data.latitude);
        if (addForm.data.longitude) formData.append('longitude', addForm.data.longitude);
        if (addForm.data.temperature) formData.append('temperature', addForm.data.temperature);
        if (addForm.data.weather_condition) formData.append('weather_condition', addForm.data.weather_condition);
        if (addForm.data.humidity) formData.append('humidity', addForm.data.humidity);
        if (addForm.data.wind_speed) formData.append('wind_speed', addForm.data.wind_speed);
        if (addForm.data.weather_notes) formData.append('weather_notes', addForm.data.weather_notes);
        formData.append('observation_date', addForm.data.observation_date);
        if (addForm.data.media) formData.append('media', addForm.data.media);

        router.post(route('admin.monitoring-items.store', folder.crop_monitoring_folder_id), formData, {
            onSuccess: () => {
                addForm.reset();
                setIsAddOpen(false);
            },
            forceFormData: true,
        });
    };

    const handleDelete = (itemId: number) => {
        if (confirm('Are you sure you want to delete this timeline entry?')) {
            router.delete(route('admin.monitoring-items.destroy', itemId));
        }
    };

    const openMap = (lat: number, lng: number) => {
        setSelectedCoords({ lat, lng });
    };

    // Sort items by observation_date descending (newest first)
    const sortedItems = [...items].sort((a, b) => 
        new Date(b.observation_date).getTime() - new Date(a.observation_date).getTime()
    );

    const formatDateBadge = (dateString: string) => {
        const date = new Date(dateString);
        return {
            month: date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
            day: date.getDate(),
            fullDate: date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        };
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={folder.folder_name} />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                {/* Header */}
                <div>
                    <Button
                        variant="ghost"
                        onClick={() => router.visit(route('admin.monitoring-folders.index'))}
                        className="mb-4"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Folders
                    </Button>

                    <div className="flex items-start justify-between p-4">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">{folder.folder_name}</h1>
                            <p className="text-muted-foreground mt-2">{folder.description}</p>
                            <div className="flex flex-wrap gap-2 mt-4">
                                {folder.category && (
                                    <Badge variant="default">{folder.category.category_name}</Badge>
                                )}
                                {folder.commodity && (
                                    <Badge variant="secondary">{folder.commodity.name}</Badge>
                                )}
                                {folder.variety && (
                                    <Badge variant="outline">{folder.variety.name}</Badge>
                                )}
                            </div>
                        </div>
                        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                            <DialogTrigger asChild>
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Update
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle>Add Timeline Entry</DialogTitle>
                                    <DialogDescription>Record a new observation or update</DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="item-name">Entry Name</Label>
                                        <Input
                                            id="item-name"
                                            value={addForm.data.item_name}
                                            onChange={(e) => addForm.setData('item_name', e.target.value)}
                                            placeholder="e.g., Week 1 Observation"
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="description">Description / Remarks</Label>
                                        <Textarea
                                            id="description"
                                            value={addForm.data.description}
                                            onChange={(e) => addForm.setData('description', e.target.value)}
                                            placeholder="Detailed observations..."
                                            rows={4}
                                        />
                                    </div>
                                    
                                    {/* Weather Details Section */}
                                    <div className="border rounded-lg p-4 space-y-3 bg-muted/30">
                                        <h4 className="font-semibold text-sm">Weather Conditions</h4>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="grid gap-2">
                                                <Label htmlFor="temperature">Temperature (°C)</Label>
                                                <Input
                                                    id="temperature"
                                                    type="number"
                                                    step="0.1"
                                                    value={addForm.data.temperature}
                                                    onChange={(e) => addForm.setData('temperature', e.target.value)}
                                                    placeholder="28.5"
                                                />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="weather-condition">Condition</Label>
                                                <Input
                                                    id="weather-condition"
                                                    value={addForm.data.weather_condition}
                                                    onChange={(e) => addForm.setData('weather_condition', e.target.value)}
                                                    placeholder="Sunny, Rainy, etc."
                                                />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="humidity">Humidity (%)</Label>
                                                <Input
                                                    id="humidity"
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    value={addForm.data.humidity}
                                                    onChange={(e) => addForm.setData('humidity', e.target.value)}
                                                    placeholder="75"
                                                />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="wind-speed">Wind Speed (km/h)</Label>
                                                <Input
                                                    id="wind-speed"
                                                    type="number"
                                                    step="0.1"
                                                    value={addForm.data.wind_speed}
                                                    onChange={(e) => addForm.setData('wind_speed', e.target.value)}
                                                    placeholder="12.5"
                                                />
                                            </div>
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="weather-notes">Weather Notes</Label>
                                            <Textarea
                                                id="weather-notes"
                                                value={addForm.data.weather_notes}
                                                onChange={(e) => addForm.setData('weather_notes', e.target.value)}
                                                placeholder="Additional weather observations..."
                                                rows={2}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="latitude">Latitude</Label>
                                            <Input
                                                id="latitude"
                                                type="number"
                                                step="0.0000001"
                                                value={addForm.data.latitude}
                                                onChange={(e) => addForm.setData('latitude', e.target.value)}
                                                placeholder="6.7354"
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="longitude">Longitude</Label>
                                            <Input
                                                id="longitude"
                                                type="number"
                                                step="0.0000001"
                                                value={addForm.data.longitude}
                                                onChange={(e) => addForm.setData('longitude', e.target.value)}
                                                placeholder="125.3589"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="observation-date">Observation Date</Label>
                                        <Input
                                            id="observation-date"
                                            type="date"
                                            value={addForm.data.observation_date}
                                            onChange={(e) => addForm.setData('observation_date', e.target.value)}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="media">Photo/Video</Label>
                                        <Input
                                            id="media"
                                            type="file"
                                            accept="image/*,video/*"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) addForm.setData('media', file);
                                            }}
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                                    <Button onClick={handleAdd}>Add Entry</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                {/* Timeline Layout with Center Line */}
                <div className="relative p-4">
                    {/* Center vertical dashed line */}
                    <div className="absolute left-1/2 top-0 bottom-0 w-1 border-l-2 border-dashed border-muted-foreground/30 transform -translate-x-1/2" />
                    
                    {/* Timeline items grouped in pairs - side by side */}
                    <div className="space-y-16">
                        {Array.from({ length: Math.ceil(sortedItems.length / 2) }, (_, pairIndex) => {
                            const leftItem = sortedItems[pairIndex * 2];
                            const rightItem = sortedItems[pairIndex * 2 + 1];
                            const leftDateInfo = leftItem ? formatDateBadge(leftItem.observation_date) : null;
                            const rightDateInfo = rightItem ? formatDateBadge(rightItem.observation_date) : null;

                            return (
                                <div key={`pair-${pairIndex}`} className="relative flex items-stretch gap-30">
                                    {/* Left Card */}
                                    {leftItem && (
                                        <div className="flex-1 relative">
                                            <Card className="overflow-hidden hover:shadow-md transition-shadow w-full h-full">
                                                <TimelineCardContent 
                                                    item={leftItem}
                                                    isFirst={pairIndex === 0 && !rightItem}
                                                    dateInfo={leftDateInfo!}
                                                    setEnlargedImage={setEnlargedImage}
                                                    openMap={openMap}
                                                    handleDelete={handleDelete}
                                                />
                                            </Card>
                                        </div>
                                    )}
                                    
                                    {/* Empty space if only left card */}
                                    {!leftItem && <div className="flex-1" />}
                                    
                                    {/* Center Timeline with Date Badges - centered on vertical line */}
                                    <div className="absolute left-1/2 top-0 bottom-0 flex flex-col items-center z-20 pointer-events-none transform -translate-x-1/2">
                                        {/* Left Card Date Badge - aligned to top of card */}
                                        {leftItem && (
                                            <div className="absolute -top-0 flex items-center gap-02 pointer-events-auto">
                                                {/* Dashed line pointing to left card */}
                                                <div className="w08 h-0.5 border-t-2 border-dashed border-muted-foreground/50" />
                                                <div className="w-16 h-16 flex flex-col items-center justify-center border-2 shadow-md bg-background rounded-lg flex-shrink-0">
                                                    <span className="text-xs font-bold text-muted-foreground">{leftDateInfo!.month}</span>
                                                    <span className="text-2xl font-bold">{leftDateInfo!.day}</span>
                                                </div>
                                            </div>
                                        )}
                                        
                                        {/* Right Card Date Badge - aligned to bottom of card */}
                                        {rightItem && (
                                            <div className="absolute -bottom-0 flex items-center gap-2 pointer-events-auto">
                                                <div className="w-16 h-16 flex flex-col items-center justify-center border-2 shadow-md bg-background rounded-lg flex-shrink-0">
                                                    <span className="text-xs font-bold text-muted-foreground">{rightDateInfo!.month}</span>
                                                    <span className="text-2xl font-bold">{rightDateInfo!.day}</span>
                                                </div>
                                                {/* Dashed line pointing to right card */}
                                                <div className="w108 h-0.5 border-t-2 border-dashed border-muted-foreground/50" />
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Right Card */}
                                    {rightItem && (
                                        <div className="flex-1 relative">
                                            <Card className="overflow-hidden hover:shadow-md transition-shadow w-full h-full">
                                                <TimelineCardContent 
                                                    item={rightItem}
                                                    isFirst={false}
                                                    dateInfo={rightDateInfo!}
                                                    setEnlargedImage={setEnlargedImage}
                                                    openMap={openMap}
                                                    handleDelete={handleDelete}
                                                />
                                            </Card>
                                        </div>
                                    )}
                                    
                                    {/* Empty space if only right card */}
                                    {!rightItem && <div className="flex-1" />}
                                </div>
                            );
                        })}
                        
                        {sortedItems.length === 0 && (
                            <Card>
                                <CardContent className="py-12 text-center">
                                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold mb-2">No timeline entries yet</h3>
                                    <p className="text-muted-foreground mb-4">Start tracking by adding your first observation</p>
                                    <Button onClick={() => setIsAddOpen(true)}>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add First Entry
                                    </Button>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>

            {/* Enlarged Image Dialog */}
            <Dialog open={!!enlargedImage} onOpenChange={() => setEnlargedImage(null)}>
                <DialogContent className="max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>Observation Photo</DialogTitle>
                    </DialogHeader>
                    {enlargedImage && (
                        <div className="rounded-lg overflow-hidden">
                            <img
                                src={enlargedImage}
                                alt="Enlarged observation"
                                className="w-full h-auto max-h-[70vh] object-contain"
                            />
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Map View Dialog */}
            <Dialog open={!!selectedCoords} onOpenChange={() => setSelectedCoords(null)}>
                <DialogContent className="max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>Location on Map</DialogTitle>
                    </DialogHeader>
                    {selectedCoords && (
                        <div className="rounded-lg overflow-hidden border">
                            <iframe
                                width="100%"
                                height="400"
                                style={{ border: 0 }}
                                loading="lazy"
                                allowFullScreen
                                referrerPolicy="no-referrer-when-downgrade"
                                src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${selectedCoords.lat},${selectedCoords.lng}&zoom=15`}
                            />
                        </div>
                    )}
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                if (selectedCoords) {
                                    window.open(`https://www.google.com/maps?q=${selectedCoords.lat},${selectedCoords.lng}`, '_blank');
                                }
                            }}
                        >
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Open in Google Maps
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
