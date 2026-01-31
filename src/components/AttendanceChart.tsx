'use client';

import { AttendanceStats } from '@/types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  RadialBarChart,
  RadialBar,
} from 'recharts';
import { useState } from 'react';

interface AttendanceChartProps {
  subjectStats: AttendanceStats[];
  onClose: () => void;
}

type ChartType = 'bar' | 'pie' | 'radial';

export function AttendanceChart({ subjectStats, onClose }: AttendanceChartProps) {
  const [chartType, setChartType] = useState<ChartType>('bar');

  // Prepare data for charts
  const barData = subjectStats.map((stat) => ({
    name: stat.subject_code || stat.subject_name.substring(0, 12),
    fullName: stat.subject_name,
    percentage: stat.percentage,
    present: stat.present_count,
    absent: stat.absent_count,
    od: stat.od_count,
    total: stat.total_sessions,
  }));

  // Color based on percentage
  const getBarColor = (percentage: number) => {
    if (percentage >= 82) return '#22c55e'; // green-500
    if (percentage >= 80) return '#eab308'; // yellow-500
    if (percentage >= 75) return '#f97316'; // orange-500
    return '#ef4444'; // red-500
  };

  // Pie chart data for overall breakdown
  const totalPresent = subjectStats.reduce((sum, s) => sum + s.present_count, 0);
  const totalAbsent = subjectStats.reduce((sum, s) => sum + s.absent_count, 0);
  const totalOD = subjectStats.reduce((sum, s) => sum + s.od_count, 0);

  const pieData = [
    { name: 'Present', value: totalPresent, color: '#22c55e' },
    { name: 'OD', value: totalOD, color: '#8b5cf6' },
    { name: 'Absent', value: totalAbsent, color: '#ef4444' },
  ].filter((d) => d.value > 0);

  // Radial chart data
  const radialData = subjectStats
    .map((stat, index) => ({
      name: stat.subject_code || stat.subject_name.substring(0, 8),
      fullName: stat.subject_name,
      percentage: stat.percentage,
      fill: getBarColor(stat.percentage),
    }))
    .sort((a, b) => b.percentage - a.percentage);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="font-semibold text-gray-900 dark:text-white">{data.fullName || data.name}</p>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Attendance: <span className="font-medium">{data.percentage?.toFixed(1)}%</span>
          </p>
          {data.present !== undefined && (
            <>
              <p className="text-sm text-green-600 dark:text-green-400">Present: {data.present}</p>
              <p className="text-sm text-purple-600 dark:text-purple-400">OD: {data.od}</p>
              <p className="text-sm text-red-600 dark:text-red-400">Absent: {data.absent}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total: {data.total}</p>
            </>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Attendance Analytics</h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">Visual breakdown of your attendance</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Chart Type Selector */}
        <div className="flex gap-2 p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <button
            onClick={() => setChartType('bar')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              chartType === 'bar'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Bar Chart
          </button>
          <button
            onClick={() => setChartType('pie')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              chartType === 'pie'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
            </svg>
            Pie Chart
          </button>
          <button
            onClick={() => setChartType('radial')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              chartType === 'radial'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Radial Chart
          </button>
        </div>

        {/* Chart Content */}
        <div className="p-6 overflow-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          {chartType === 'bar' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Attendance by Subject</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="name"
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      interval={0}
                      tick={{ fontSize: 12, fill: '#6b7280' }}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tick={{ fontSize: 12, fill: '#6b7280' }}
                      tickFormatter={(value) => `${value}%`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="percentage" name="Attendance %" radius={[4, 4, 0, 0]}>
                      {barData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getBarColor(entry.percentage)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Reference Lines Legend */}
              <div className="flex justify-center gap-6 mt-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-gray-600 dark:text-gray-300">≥82% (Safe)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span className="text-gray-600 dark:text-gray-300">80-82% (Warning)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                  <span className="text-gray-600 dark:text-gray-300">75-80% (Low)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-gray-600 dark:text-gray-300">&lt;75% (Critical)</span>
                </div>
              </div>
            </div>
          )}

          {chartType === 'pie' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-center">Overall Breakdown</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-center">Statistics</h3>
                <div className="space-y-4 p-4">
                  <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/30 rounded-lg">
                    <span className="text-green-700 dark:text-green-400 font-medium">Present</span>
                    <span className="text-2xl font-bold text-green-600 dark:text-green-400">{totalPresent}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
                    <span className="text-purple-700 dark:text-purple-400 font-medium">OD (On Duty)</span>
                    <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">{totalOD}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-900/30 rounded-lg">
                    <span className="text-red-700 dark:text-red-400 font-medium">Absent</span>
                    <span className="text-2xl font-bold text-red-600 dark:text-red-400">{totalAbsent}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border-t-2 border-gray-200 dark:border-gray-700">
                    <span className="text-gray-700 dark:text-gray-200 font-medium">Total Sessions</span>
                    <span className="text-2xl font-bold text-gray-600 dark:text-gray-300">{totalPresent + totalOD + totalAbsent}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {chartType === 'radial' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Subject Performance Ranking</h3>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart
                    cx="50%"
                    cy="50%"
                    innerRadius="10%"
                    outerRadius="90%"
                    barSize={20}
                    data={radialData}
                    startAngle={180}
                    endAngle={0}
                  >
                    <RadialBar
                      label={{ position: 'insideStart', fill: '#fff', fontSize: 11 }}
                      background
                      dataKey="percentage"
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      iconSize={10}
                      layout="vertical"
                      verticalAlign="middle"
                      align="right"
                      wrapperStyle={{ paddingLeft: '20px' }}
                    />
                  </RadialBarChart>
                </ResponsiveContainer>
              </div>

              {/* Subject list with percentages */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mt-4">
                {radialData.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-2 rounded-lg"
                    style={{ backgroundColor: `${item.fill}15` }}
                  >
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.fill }}
                    ></div>
                    <span className="text-sm text-gray-700 dark:text-gray-200 truncate" title={item.fullName}>
                      {item.name}: {item.percentage.toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
