import { DailyVolume } from "@repo/api-types";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";

interface DailyVolumeChartProps {
  data: DailyVolume[];
}

const chartSetting = {
  width: 1100,
  height: 800,
};

const valueFormatter = (value: number) => value.toExponential();

const DailyVolumeChart = ({ data }: DailyVolumeChartProps) => {
  return (
    <ResponsiveContainer width="100%" height={chartSetting.height}>
      <BarChart width={chartSetting.width} height={chartSetting.height} data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="day" />
        <YAxis scale="log" domain={["auto", "auto"]} tickFormatter={valueFormatter} />
        <Tooltip formatter={valueFormatter} />
        <Bar dataKey="value" fill="#8884d8" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default DailyVolumeChart;
