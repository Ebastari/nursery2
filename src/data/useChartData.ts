import { useEffect, useState } from 'react';
import { loadPerformanceData, getPerformanceData, getBibitTypes, getBibitLabels, getBibitColors } from './performanceData';
import type { DailyOutput } from './performanceData';

export interface ChartData {
  data: DailyOutput[];
  bibitKeys: string[];
  bibitLabels: Record<string, string>;
  bibitColors: Record<string, string>;
}

export function useChartData(tujuanBibit: string = 'Semua', filterBibit: string = 'Semua'): ChartData {
  const [chartData, setChartData] = useState<ChartData>({
    data: [],
    bibitKeys: [],
    bibitLabels: {},
    bibitColors: {},
  });

  useEffect(() => {
    loadPerformanceData().then(() => {
      const data = getPerformanceData(tujuanBibit, filterBibit);
      const bibitKeys = getBibitTypes().map(b => b.replace(/\s+/g, '_'));
      const bibitLabels = getBibitLabels();
      const bibitColors = getBibitColors();
      
      setChartData({ data, bibitKeys, bibitLabels, bibitColors });
    }).catch(console.error);
  }, [tujuanBibit, filterBibit]);

  return chartData;
}

