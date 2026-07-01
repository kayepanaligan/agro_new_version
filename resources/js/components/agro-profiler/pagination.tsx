import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface PaginationProps {
    currentPage: number;
    lastPage: number;
    total: number;
    perPage: number;
    onPageChange: (page: number) => void;
    onPerPageChange?: (perPage: number) => void;
    className?: string;
}

export function Pagination({
    currentPage,
    lastPage,
    total,
    perPage,
    onPageChange,
    onPerPageChange,
    className,
}: PaginationProps) {
    const from = Math.min((currentPage - 1) * perPage + 1, total);
    const to = Math.min(currentPage * perPage, total);

    const getPageNumbers = () => {
        const pages: (number | 'ellipsis')[] = [];
        const maxVisible = 5;

        if (lastPage <= maxVisible + 2) {
            for (let i = 1; i <= lastPage; i++) pages.push(i);
        } else {
            pages.push(1);
            if (currentPage > 3) pages.push('ellipsis');

            const start = Math.max(2, currentPage - 1);
            const end = Math.min(lastPage - 1, currentPage + 1);
            for (let i = start; i <= end; i++) pages.push(i);

            if (currentPage < lastPage - 2) pages.push('ellipsis');
            pages.push(lastPage);
        }
        return pages;
    };

    return (
        <div className={cn('flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between', className)}>
            <div className="flex items-center gap-3">
                <p className="text-sm text-muted-foreground">
                    Showing <span className="font-medium text-foreground">{from}</span>
                    –<span className="font-medium text-foreground">{to}</span> of{' '}
                    <span className="font-medium text-foreground">{total}</span> results
                </p>
                {onPerPageChange && (
                    <div className="flex items-center gap-2">
                        <Select value={perPage.toString()} onValueChange={(v) => onPerPageChange(Number(v))}>
                            <SelectTrigger className="h-8 w-[70px] text-xs">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="10">10</SelectItem>
                                <SelectItem value="25">25</SelectItem>
                                <SelectItem value="50">50</SelectItem>
                                <SelectItem value="100">100</SelectItem>
                            </SelectContent>
                        </Select>
                        <span className="text-xs text-muted-foreground">per page</span>
                    </div>
                )}
            </div>

            <div className="flex items-center gap-1">
                <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onPageChange(1)}
                    disabled={currentPage === 1}
                >
                    <ChevronsLeft className="h-3.5 w-3.5" />
                </Button>
                <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                >
                    <ChevronLeft className="h-3.5 w-3.5" />
                </Button>

                {getPageNumbers().map((page, idx) =>
                    page === 'ellipsis' ? (
                        <span key={`ellipsis-${idx}`} className="px-2 text-sm text-muted-foreground">
                            ...
                        </span>
                    ) : (
                        <Button
                            key={page}
                            variant={currentPage === page ? 'default' : 'outline'}
                            size="icon"
                            className={cn('h-8 w-8 text-xs font-medium', currentPage === page && 'shadow-sm')}
                            onClick={() => onPageChange(page)}
                        >
                            {page}
                        </Button>
                    )
                )}

                <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === lastPage}
                >
                    <ChevronRight className="h-3.5 w-3.5" />
                </Button>
                <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onPageChange(lastPage)}
                    disabled={currentPage === lastPage}
                >
                    <ChevronsRight className="h-3.5 w-3.5" />
                </Button>
            </div>
        </div>
    );
}
