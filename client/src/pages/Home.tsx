/**
 * 用电数据分析系统 - 主页面
 */

import { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { Zap, TrendingUp, Calendar, BatteryFull, PlugZap, ChartLine, BarChart2, Table } from 'lucide-react';
import StatCard from '@/components/StatCard';
import DataTable from '@/components/DataTable';
import { getBuiltInData, getBuiltInStats, EnergyRecord, EnergyStats } from '@/lib/energyData';

export default function Home() {
  const [records, setRecords] = useState<EnergyRecord[]>([]);
  const [stats, setStats] = useState<EnergyStats | null>(null);

  useEffect(() => {
    // 加载内置数据
    const data = getBuiltInData();
    const calculatedStats = getBuiltInStats();

    setRecords(data);
    setStats(calculatedStats);
  }, []);

  if (!stats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin mb-4">
            <Zap className="w-8 h-8 text-blue-400 mx-auto" />
          </div>
          <p className="text-muted-foreground">加载数据中...</p>
        </div>
      </div>
    );
  }

  // 准备图表数据
  const chartData = records.map(r => ({
    day: `${r.day}日`,
    usage: r.usage,
    cost: r.cost,
  }));

  return (
    <div className="min-h-screen text-foreground">
      {/* 页面头部 */}
      <header className="py-8 backdrop-blur-lg border-b border-slate-200/30">
        <style>{`
          /* 液态玻璃效果 */
          .glass-card {
            background: rgba(255, 255, 255, 0.8);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.3);
            box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.15);
            transition: all 0.3s ease;
          }
          
          .glass-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 12px 40px 0 rgba(31, 38, 135, 0.2);
            border-color: rgba(255, 255, 255, 0.5);
          }
          
          /* 美化分隔符 */
          .gradient-divider {
            height: 1px;
            background: linear-gradient(
              to right,
              transparent,
              rgba(59, 130, 246, 0.6),
              rgba(16, 185, 129, 0.6),
              transparent
            );
            margin: 60px 0;
            position: relative;
          }
          
          .gradient-divider::before {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 30px;
            height: 30px;
            background: linear-gradient(135deg, #3b82f6, #10b981);
            border-radius: 50%;
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
          }
          
          @media (prefers-color-scheme: dark) {
            .gradient-divider {
              background: linear-gradient(
                to right,
                transparent,
                rgba(59, 130, 246, 0.4),
                rgba(16, 185, 129, 0.4),
                transparent
              );
            }
            
            .gradient-divider::before {
              background: linear-gradient(135deg, #60a5fa, #34d399);
              box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
            }
          }
          
          header {
            background-color: rgba(255, 255, 255, 0.8);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border-color: rgba(203, 213, 225, 0.6);
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
          }
          @media (prefers-color-scheme: dark) {
            .glass-card {
              background: rgba(15, 23, 42, 0.6);
              border: 1px solid rgba(100, 116, 139, 0.3);
              box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3);
            }
            
            .glass-card:hover {
              border-color: rgba(100, 116, 139, 0.5);
              box-shadow: 0 12px 40px 0 rgba(0, 0, 0, 0.4);
            }
            
            header {
              background-color: rgba(15, 23, 42, 0.6);
              border-color: rgba(100, 116, 139, 0.4);
              box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
            }
          }
          
          /* 响应式设计 */
          @media (max-width: 768px) {
            .glass-card {
              padding: 16px;
              margin-bottom: 12px;
            }
            
            h2 {
              font-size: 1.5rem !important;
            }
            
            h3 {
              font-size: 1.1rem !important;
            }
            
            .gradient-divider {
              margin: 40px 0;
            }
            
            .gradient-divider::before {
              width: 20px;
              height: 20px;
            }
          }
          
          @media (max-width: 480px) {
            header {
              padding: 12px;
            }
            
            h1 {
              font-size: 1.2rem !important;
            }
            
            .glass-card {
              padding: 12px;
            }
            
            main {
              padding: 12px !important;
            }
          }
        `}</style>
        <div className="container">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Calendar className="w-6 h-6 text-blue-400" />
            <h1 className="text-xl font-poppins font-bold text-foreground text-center">
              2026年03月
            </h1>
          </div>
        </div>
      </header>

      {/* 表内剩余度 */}
      <div className="container py-4">
        <BatteryFull className="w-8 h-8 text-emerald-500 mx-auto" />
        <p className="text-xl text-emerald-500 font-medium text-center">
          表内剩余：43度
        </p>
      </div>
      {/* 主要内容 */}
      <main className="container py-12">
        {/* 统计卡片网格 */}
        <section className="mb-12">
          <h2 className="text-2xl font-poppins font-bold text-blue-400 mb-6">
            关键指标
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              label="总用电量"
              value={stats.totalUsage}
              unit="度"
              icon={<PlugZap />}
              color="blue"
            />
            <StatCard
              label="总费用"
              value={`¥${stats.totalCost}`}
              icon={<TrendingUp />}
              color="green"
            />
            <StatCard
              label="日均用电"
              value={stats.averageDaily}
              unit="度"
              icon={<Calendar />}
              color="purple"
            />
            <StatCard
              label="最高日用电"
              value={stats.maxDailyValue}
              unit={`度 (${stats.maxDaily}日)`}
              icon={<Calendar />}
              highlight
              color="amber"
            />
          </div>
        </section>

        {/* 渐变分隔线 */}
        <div className="gradient-divider" />

        {/* 图表区域 */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <ChartLine className="w-6 h-6 text-blue-400" />
            <h2 className="text-2xl font-poppins font-bold text-foreground">
              用电趋势分析
            </h2>
          </div>

          {/* 用电量和费用趋势 */}
          <div className="glass-card p-6 rounded-2xl mb-8">
            <h3 className="text-lg font-poppins font-bold text-foreground mb-4">
              日用电量与费用趋势
            </h3>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  dataKey="day"
                  stroke="var(--muted-foreground)"
                  tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                />
                <YAxis
                  yAxisId="left"
                  stroke="var(--muted-foreground)"
                  tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                  label={{ value: '用电量 (度)', angle: -90, position: 'insideLeft', fill: 'var(--muted-foreground)' }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="var(--muted-foreground)"
                  tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                  label={{ value: '费用 (元)', angle: 90, position: 'insideRight', fill: 'var(--muted-foreground)' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    color: 'var(--foreground)',
                    opacity: 0.9
                  }}
                  labelStyle={{ color: 'var(--foreground)' }}
                />
                <Legend
                  wrapperStyle={{ color: 'var(--muted-foreground)' }}
                  iconType="line"
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="usage"
                  stroke="#3b82f6"
                  dot={{ fill: '#3b82f6', r: 4 }}
                  activeDot={{ r: 6 }}
                  strokeWidth={2}
                  name="用电量 (度)"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="cost"
                  stroke="#10b981"
                  dot={{ fill: '#10b981', r: 4 }}
                  activeDot={{ r: 6 }}
                  strokeWidth={2}
                  name="费用 (元)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* 用电量柱状图 */}
          <div className="glass-card p-6 rounded-2xl">
            <h3 className="text-lg font-poppins font-bold text-foreground mb-4">
              日用电量分布
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  dataKey="day"
                  stroke="var(--muted-foreground)"
                  tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                />
                <YAxis
                  stroke="var(--muted-foreground)"
                  tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    color: 'var(--foreground)',
                    opacity: 0.9
                  }}
                  labelStyle={{ color: 'var(--foreground)' }}
                />
                <Bar
                  dataKey="usage"
                  fill="#3b82f6"
                  radius={[8, 8, 0, 0]}
                  name="用电量 (度)"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* 渐变分隔线 */}
        <div className="gradient-divider" />

        {/* 数据统计摘要 */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <BarChart2 className="w-6 h-6 text-blue-400" />
            <h2 className="text-2xl font-poppins font-bold text-foreground">
              数据统计摘要
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card p-6 rounded-2xl">
              <div className="flex items-center gap-3 mb-3">
                <Calendar className="w-5 h-5 text-blue-400" />
                <h3 className="text-foreground font-semibold">数据覆盖（天）</h3>
              </div>
              <p className="text-2xl font-bold text-blue-400 mb-2">
                {stats.daysWithData}
              </p>
              <p className="text-sm text-muted-foreground">
                有数据的天数 / 总共{stats.totalDays}天
              </p>
              <p className="text-sm text-muted-foreground/80 mt-2">
                缺失数据：{stats.daysWithoutData} 天
              </p>
            </div>

            <div className="glass-card p-6 rounded-2xl">
              <div className="flex items-center gap-3 mb-3">
                <TrendingUp className="w-5 h-5 text-green-400" />
                <h3 className="text-foreground font-semibold">用电范围（度）</h3>
              </div>
              <p className="text-2xl font-bold text-green-400 mb-2">
                {stats.minDailyValue} ~ {stats.maxDailyValue}
              </p>
              <p className="text-sm text-muted-foreground">
                最低：{stats.minDaily}日 | 最高：{stats.maxDaily}日
              </p>
            </div>
          </div>
        </section>

        {/* 详细数据表格 */}
        <section>
          <div className="p-6 rounded-2xl">
            <div className="flex items-center gap-3 mb-4">
              <Table className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-poppins font-bold text-foreground">
                详细数据
              </h3>
            </div>
            <DataTable data={records} />
          </div>
        </section>
      </main>

      {/* 页脚 */}
      <footer className="py-6 mt-12 backdrop-blur-lg border-t border-slate-200/30">
        <style>{`
          footer {
            background-color: rgba(255, 255, 255, 0.8);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border-color: rgba(203, 213, 225, 0.6);
            box-shadow: 0 -4px 6px -1px rgba(0, 0, 0, 0.05);
          }
          @media (prefers-color-scheme: dark) {
            footer {
              background-color: rgba(15, 23, 42, 0.6);
              backdrop-filter: blur(12px);
              -webkit-backdrop-filter: blur(12px);
              border-color: rgba(100, 116, 139, 0.4);
              box-shadow: 0 -10px 15px -3px rgba(0, 0, 0, 0.3);
            }
          }
        `}</style>
        <div className="container text-center text-muted-foreground text-sm">
          <p>数据更新：2026年03月31日</p>
        </div>
      </footer>
    </div>
  );
}
