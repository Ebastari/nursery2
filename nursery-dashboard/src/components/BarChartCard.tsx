import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import type { DailyChart } from "../data";
import { getBibitColor } from "../data";

type Props = {
  data: DailyChart[];
  bibitTypes: string[];
};

export default function BarChartCard({ data, bibitTypes }: Props) {
  const chartData = data.map((d) => ({
    ...d,
    tanggal: d.tanggal.length > 5 ? d.tanggal.slice(5) : d.tanggal,
  }));

  return (
    <div className="bg-white rounded-2xl shadow p-4">
      <h3 className="text-sm font-bold text-gray-700 mb-3">
        Distribusi per Jenis Bibit
      </h3>
      {data.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-10">Tidak ada data</p>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="tanggal" tick={{ fontSize: 10 }} angle={-30} textAnchor="end" height={50} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v: number) => v.toLocaleString("id-ID")} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            {bibitTypes.map((key, i) => (
              <Bar
                key={key}
                dataKey={key}
                fill={getBibitColor(i)}
                radius={[4, 4, 0, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
