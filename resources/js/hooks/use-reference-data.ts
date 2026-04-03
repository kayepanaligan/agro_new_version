import { useEffect, useState } from 'react';
import { referenceDataService } from '@/services/reference-data';
import type { Commodity, Variety, Program } from '@/types';

interface UseReferenceDataReturn {
    commodities: Commodity[];
    varieties: Variety[];
    programs: Program[];
    isLoading: boolean;
    error: Error | null;
    refresh: () => Promise<void>;
}

export function useReferenceData(): UseReferenceDataReturn {
    const [commodities, setCommodities] = useState<Commodity[]>([]);
    const [varieties, setVarieties] = useState<Variety[]>([]);
    const [programs, setPrograms] = useState<Program[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const loadData = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const [commoditiesData, varietiesData, programsData] = await Promise.all([
                referenceDataService.commodities(),
                referenceDataService.varieties(),
                referenceDataService.programs()
            ]);

            setCommodities(commoditiesData);
            setVarieties(varietiesData);
            setPrograms(programsData);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to load reference data'));
            console.error('Failed to load reference data:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const refresh = async () => {
        await referenceDataService.refreshAll();
        await loadData();
    };

    useEffect(() => {
        loadData();
    }, []);

    return {
        commodities,
        varieties,
        programs,
        isLoading,
        error,
        refresh
    };
}
