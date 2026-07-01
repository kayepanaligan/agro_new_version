import { Download, FileSpreadsheet, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ExportButtonsProps {
    onExportCsv: () => void;
    onExportPdf: () => void;
}

export function ExportButtons({ onExportCsv, onExportPdf }: ExportButtonsProps) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                    <Download className="h-4 w-4" />
                    Export
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onExportCsv}>
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onExportPdf}>
                    <Printer className="mr-2 h-4 w-4" />
                    Print / Save PDF
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
