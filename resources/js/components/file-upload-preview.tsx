import { Upload, File, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useRef, DragEvent, ChangeEvent } from 'react';

interface FileUploadPreviewProps {
    accept?: string;
    maxSizeMB?: number;
    onFileSelect: (file: File | null) => void;
    selectedFile?: File | null;
    placeholderText?: string;
    helperText?: string;
}

export default function FileUploadPreview({
    accept = '*/*',
    maxSizeMB = 5,
    onFileSelect,
    selectedFile,
    placeholderText = 'Drag or upload files here',
    helperText = 'Accepted formats: PDF, JPG, PNG. Maximum file size: 5MB'
}: FileUploadPreviewProps) {
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        
        const file = e.dataTransfer.files[0];
        if (file && validateFile(file)) {
            onFileSelect(file);
        }
    };

    const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && validateFile(file)) {
            onFileSelect(file);
        }
    };

    const validateFile = (file: File): boolean => {
        const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
        if (!validTypes.includes(file.type)) {
            alert('Invalid file type. Please upload PDF, JPG, or PNG files only.');
            return false;
        }
        
        const maxSizeBytes = maxSizeMB * 1024 * 1024;
        if (file.size > maxSizeBytes) {
            alert(`File size must be less than ${maxSizeMB}MB`);
            return false;
        }
        
        return true;
    };

    const handleRemoveFile = () => {
        onFileSelect(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const getFileIcon = (fileType: string) => {
        if (fileType.includes('pdf')) return '📄';
        if (fileType.includes('image')) return '🖼️';
        return '📁';
    };

    return (
        <div className="space-y-2">
            {!selectedFile ? (
                <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`
                        border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                        ${isDragging 
                            ? 'border-primary bg-primary/5' 
                            : 'border-muted-foreground/25 hover:border-primary hover:bg-muted/50'
                        }
                    `}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept={accept}
                        onChange={handleFileInput}
                        className="hidden"
                    />
                    
                    <div className="flex flex-col items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                            <Upload className="h-6 w-6 text-muted-foreground" />
                        </div>
                        
                        <div className="space-y-1">
                            <p className="text-sm font-medium">{placeholderText}</p>
                            <p className="text-xs text-muted-foreground">{helperText}</p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="border rounded-lg p-4 bg-muted/30">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <span className="text-xl">{getFileIcon(selectedFile.type)}</span>
                            </div>
                            
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                                <p className="text-xs text-muted-foreground">
                                    {formatFileSize(selectedFile.size)}
                                </p>
                            </div>
                        </div>
                        
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleRemoveFile}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                            <X className="h-4 w-4 mr-1" />
                            Remove
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
