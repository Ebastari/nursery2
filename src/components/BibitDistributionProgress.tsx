import React from "react";

type BibitData = {
  tanggal: string;
  bibit: string;
  total: number;
};

type Props = {
  data: BibitData[];
};

const formatNumber = (num: number) =>
  num.toLocaleString("id-ID", { maximumFractionDigits: 0 });

const getBarColor = (percent: number) => {
  if (percent > 40) return "bg-green-500";
  if (percent >= 15) return "bg-yellow-400";
  return "bg-red-500";
};

const today = new Date();
const todayStr = today.toISOString().slice(0, 10);

const BibitDistributionProgress: React.FC<Props> = ({ data }) => {
  const filtered = data.filter(
    (d) =>
      d.tanggal >= "2026-01-01" &&
      d.tanggal <= todayStr
  );

  const bibitMap = new Map<string, number>();
  filtered.forEach((d) => {
    const bibit = d.bibit.trim().toUpperCase();
    bibitMap.set(bibit, (bibitMap.get(bibit) || 0) + d.total);
  });

  const totalAll = Array.from(bibitMap.values()).reduce((a, b) => a + b, 0);

  const bibitArr = Array.from(bibitMap.entries()).map(([bibit, total]) => ({
    bibit,
    total,
    percent: totalAll ? (total / totalAll) * 100 : 0,
  }));
  bibitArr.sort((a, b) => b.total - a.total);

  const top5 = bibitArr.slice(0, 5);
  const others = bibitArr.slice(5);
  const othersTotal = others.reduce((a, b) => a + b.total, 0);
  const othersPercent = totalAll ? (othersTotal / totalAll) * 100 : 0;
  const displayArr =
    others.length > 0
      ? [
          ...top5,
          {
            bibit: "LAINNYA",
            total: othersTotal,
            percent: othersPercent,
          },
        ]
      : top5;

  return (
    <div className="w-full bg-white rounded shadow p-4 text-sm">
      <div className="font-semibold mb-2">Distribusi Bibit (2026 s/d Hari Ini)</div>
      <div className="space-y-2">
        {displayArr.map((item) => (
          <div key={item.bibit} className="flex flex-col">
            <div className="flex justify-between items-center mb-1">
              <span className="font-medium truncate">{item.bibit}</span>
              <span>
                {formatNumber(item.total)} &nbsp;
                <span className="text-gray-500">
                  ({item.percent.toFixed(1)}%)
                </span>
              </span>
            </div>
            <div className="w-full h-3 bg-gray-200 rounded">
              <div
                className={`${getBarColor(item.percent)} h-3 rounded`}
                style={{
                  width: `${item.percent}%`,
                  minWidth: item.total > 0 ? 8 : 0,
                  transition: "width 0.5s",
                }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 text-right text-xs text-gray-400">
        Total: {formatNumber(totalAll)}
      </div>
    </div>
  );
};

export default BibitDistributionProgress;
