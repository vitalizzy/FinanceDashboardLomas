// Access global classes loaded via script tags
const BaseECharts = window.BaseECharts;
const EChartsLineChart = window.EChartsLineChart;
const EChartsBarChart = window.EChartsBarChart;
const EChartsPieChart = window.EChartsPieChart;
const destroyAllCharts = window.destroyAllCharts;

export { destroyAllCharts };
export { createBarChart } from './BarChart.js';
export { createLineChart } from './LineChart.js';
export { createBarRaceChart } from './BarRaceChart.js';
export { getExpensesByCategory, getMonthlyFlow, getByCategoryByMetric, getCategoryRaceData } from './dataTransforms.js';
