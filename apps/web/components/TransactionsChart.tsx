import { BarChart } from "@mui/x-charts";
import { DailyVolume } from "@repo/api-types";

interface TransactionChartProps {
  data: DailyVolume[];
}

const chartSetting = {
  width: 1100,
  height: 400,
};

const valueFormatter = (value: number | null) => `${value} BUSD`;

const TransactionsChart = ({ data }: TransactionChartProps) => {
  return (
    <BarChart
      dataset={data}
      xAxis={[{ scaleType: "band", dataKey: "day" }]}
      series={[{ dataKey: "value", valueFormatter }]}
      {...chartSetting}
    />
  );
};

export default TransactionsChart;
