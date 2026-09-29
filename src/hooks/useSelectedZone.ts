import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { useZoneList } from './useZones';
import { ZoneProperties } from '../types/domain';

export function useSelectedZone() {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedZoneId = useAppStore((s) => s.selectedZoneId);
  const setSelectedZoneId = useAppStore((s) => s.setSelectedZoneId);
  const { data: zoneList } = useZoneList();

  // Sync state from URL on initial load or change
  useEffect(() => {
    const urlZone = searchParams.get('zone');
    if (urlZone && urlZone !== selectedZoneId) {
      setSelectedZoneId(urlZone);
    }
  }, [searchParams, selectedZoneId, setSelectedZoneId]);

  const selectZone = (zoneId: string | null) => {
    setSelectedZoneId(zoneId);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (zoneId) {
        next.set('zone', zoneId);
      } else {
        next.delete('zone');
      }
      return next;
    });
  };

  const selectedZone: ZoneProperties | undefined = zoneList?.find(
    (z) => z.id.toUpperCase() === (selectedZoneId || 'MN-047').toUpperCase()
  );

  return {
    selectedZoneId,
    selectedZone,
    selectZone,
  };
}
