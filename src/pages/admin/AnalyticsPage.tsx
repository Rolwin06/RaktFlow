import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { BarChart3, TrendingUp, ShieldCheck, Activity } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

const demandData = [
  { day: 'Mon', demand: 18, supply: 22 },
  { day: 'Tue', demand: 25, supply: 24 },
  { day: 'Wed', demand: 32, supply: 28 },
  { day: 'Thu', demand: 28, supply: 30 },
  { day: 'Fri', demand: 42, supply: 35 },
  { day: 'Sat', demand: 48, supply: 38 },
  { day: 'Sun', demand: 36, supply: 34 },
];

const inventoryByGroup = [
  { group: 'O+', units: 95 },
  { group: 'A+', units: 72 },
  { group: 'B+', units: 48 },
  { group: 'AB+', units: 28 },
  { group: 'O-', units: 19 },
  { group: 'A-', units: 14 },
  { group: 'B-', units: 12 },
  { group: 'AB-', units: 8 },
];

const unitsSavedData = [
  { week: 'W1', saved: 4 },
  { week: 'W2', saved: 9 },
  { week: 'W3', saved: 15 },
  { week: 'W4', saved: 23 },
];

const COLORS = ['#DC2626', '#EF4444', '#F87171', '#FCA5A5', '#B91C1C', '#991B1B', '#7F1D1D', '#450A0A'];

export const AnalyticsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-surface-900">
              Network Analytics & Trends
            </h1>
            <span className="text-xs font-mono font-bold bg-surface-100 text-surface-800 border border-surface-200 px-2.5 py-0.5 rounded-full">
              7-Day Window
            </span>
          </div>
          <p className="text-xs text-surface-500 mt-1">
            Operational telemetry monitoring demand spikes, inventory group dispersion, and progressive units saved.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Demand vs Supply Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-surface-700 font-mono">
              7-Day Demand vs Available Supply (Units)
            </CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={demandData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="demand" stroke="#DC2626" strokeWidth={2} name="Emergency Demand" />
                <Line type="monotone" dataKey="supply" stroke="#10B981" strokeWidth={2} name="Available Supply" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Units Saved Growth Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-surface-700 font-mono">
              Cumulative Units Saved (Wastage Prevented)
            </CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={unitsSavedData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="saved" fill="#DC2626" radius={[4, 4, 0, 0]} name="Units Saved" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Inventory Distribution by Blood Group */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-surface-700 font-mono">
              Aggregate Inventory Distribution by Blood Group
            </CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={inventoryByGroup}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="group" tick={{ fontSize: 11, fontFamily: 'monospace' }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="units" fill="#EF4444" radius={[4, 4, 0, 0]} name="Units in Storage" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
