import { ParkingSpot } from '../types/parking';

export interface SpotDisplayInfo {
  statusBadge: {
    bg: string;
    text: string;
    dot: string;
  };
  dataSourceBadge: {
    bg: string;
    text: string;
  } | null;
  isAvailable: boolean;
}

export function getSpotDisplayInfo(spot: ParkingSpot): SpotDisplayInfo {
  const isAvailable = spot.status === 'empty';

  let statusBadge = {
    bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    text: '目前空閒',
    dot: 'bg-emerald-500 animate-pulse'
  };

  switch (spot.status) {
    case 'empty':
      statusBadge = {
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        text: '目前空閒',
        dot: 'bg-emerald-500 animate-pulse'
      };
      break;
    case 'occupied':
      statusBadge = {
        bg: 'bg-rose-50 text-rose-700 border-rose-200',
        text: '使用中',
        dot: 'bg-rose-500'
      };
      break;
    case 'maintenance':
      statusBadge = {
        bg: 'bg-amber-50 text-amber-700 border-amber-200',
        text: '維護中',
        dot: 'bg-amber-500'
      };
      break;
    case 'unknown':
    default:
      statusBadge = {
        bg: 'bg-slate-100 text-slate-600 border-slate-200',
        text: '無即時資訊',
        dot: 'bg-slate-400'
      };
      break;
  }

  let dataSourceBadge = null;
  if (spot.sensorDetail) {
    switch (spot.sensorDetail.dataSource) {
      case 'geomagnetic':
        dataSourceBadge = {
          bg: 'bg-blue-50 text-blue-700 border-blue-200',
          text: '地磁即時'
        };
        break;
      case 'estimate':
        dataSourceBadge = {
          bg: 'bg-amber-50 text-amber-700 border-amber-200',
          text: '官方概估'
        };
        break;
      case 'none':
        dataSourceBadge = {
          bg: 'bg-slate-100 text-slate-500 border-slate-200',
          text: '無動態'
        };
        break;
    }
  }

  return {
    statusBadge,
    dataSourceBadge,
    isAvailable
  };
}
