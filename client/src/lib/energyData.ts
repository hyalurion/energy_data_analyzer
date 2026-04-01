/**
 * 用电数据解析和分析工具
 * 内置用电数据，提供数据解析、统计和分析功能
 */

export interface EnergyRecord {
  day: number;
  usage: number; // 用电量（度）
  cost: number; // 费用（元）
}

export interface EnergyStats {
  totalUsage: number;
  totalCost: number;
  averageDaily: number;
  maxDaily: number;
  minDaily: number;
  maxDailyValue: number;
  minDailyValue: number;
  daysWithData: number;
  daysWithoutData: number;
  totalDays: number;
}

// 月份天数配置
export const MONTH_DAYS = {
  JANUARY: 31,
  FEBRUARY: 28,
  FEBRUARY_LEAP: 29,
  MARCH: 31,
  APRIL: 30,
  MAY: 31,
  JUNE: 30,
  JULY: 31,
  AUGUST: 31,
  SEPTEMBER: 30,
  OCTOBER: 31,
  NOVEMBER: 30,
  DECEMBER: 31,
} as const;

// 获取指定月份的天数（支持闰年）
export function getDaysInMonth(year: number, month: number): number {
  // month: 1-12
  return new Date(year, month, 0).getDate();
}

// 默认月份天数（非闰年）
export function getDefaultDaysInMonth(month: number): number {
  const daysMap: Record<number, number> = {
    1: 31, 2: 28, 3: 31, 4: 30, 5: 31, 6: 30,
    7: 31, 8: 31, 9: 30, 10: 31, 11: 30, 12: 31,
  };
  return daysMap[month] || 30;
}

// 内置的原始数据（TXT格式）
const RAW_DATA = `
2026年03月
01日0.03度0.02元
02日0.03度0.02元
03日0.04度0.02元
04日-度-元
05日0.1度0.05元
06日-度-元
07日6.53度3.58元
08日6.53度3.58元
09日6.54度3.59元
10日5.3度2.91元
11日0.8度0.44元
12日0.6度0.33元
13日3.9度2.14元
14日7度3.84元
15日2.3度1.26元
16日1.2度0.66元
17日6.2度3.4元
18日2.7度1.48元
19日3.2度1.75元
20日0.2度0.11元
21日0.1度0.05元
22日0.6度0.33元
23日1.4度0.77元
24日1.4度0.77元
25日1.4度0.77元
26日2.3度1.26元
27日1.3度0.71元
28日1.5度0.82元
29日1.1度0.6元
30日1.4度0.77元
31日1.5度0.82元`;

export interface ParsedEnergyData {
  year: number;
  month: number;
  daysInMonth: number;
  records: EnergyRecord[];
}

/**
 * 解析原始数据字符串
 */
export function parseEnergyData(rawData: string): EnergyRecord[] {
  const result = parseEnergyDataWithMeta(rawData);
  return result.records;
}

/**
 * 解析原始数据字符串（包含年月元信息）
 */
export function parseEnergyDataWithMeta(rawData: string): ParsedEnergyData {
  const lines = rawData.split('\n').filter(line => line.trim());
  const records: EnergyRecord[] = [];
  let year = new Date().getFullYear();
  let month = 3; // 默认3月

  for (const line of lines) {

    // 匹配年月格式：2026年03月
    const yearMonthMatch = line.match(/(\d{4})年(\d{2})月/);
    if (yearMonthMatch) {
      year = parseInt(yearMonthMatch[1], 10);
      month = parseInt(yearMonthMatch[2], 10);
      continue;
    }

    // 匹配格式：01日0.03度0.02元
    const match = line.match(/(\d{2})日([0-9.-]+)度([0-9.-]+)元/);
    if (match) {
      const day = parseInt(match[1], 10);
      const usageStr = match[2];
      const costStr = match[3];

      // 处理缺失数据（用 "-" 表示）
      if (usageStr !== '-' && costStr !== '-') {
        const usage = parseFloat(usageStr);
        const cost = parseFloat(costStr);

        if (!isNaN(usage) && !isNaN(cost)) {
          records.push({
            day,
            usage,
            cost,
          });
        }
      }
    }
  }

  const daysInMonth = getDaysInMonth(year, month);

  return {
    year,
    month,
    daysInMonth,
    records,
  };
}

/**
 * 计算统计数据
 * @param records 用电记录数组
 * @param totalDays 月份总天数（28/29/30/31），默认为30
 */
export function calculateStats(records: EnergyRecord[], totalDays: number = 30): EnergyStats {
  if (records.length === 0) {
    return {
      totalUsage: 0,
      totalCost: 0,
      averageDaily: 0,
      maxDaily: 0,
      minDaily: 0,
      maxDailyValue: 0,
      minDailyValue: 0,
      daysWithData: 0,
      daysWithoutData: totalDays,
      totalDays,
    };
  }

  const totalUsage = records.reduce((sum, r) => sum + r.usage, 0);
  const totalCost = records.reduce((sum, r) => sum + r.cost, 0);
  const averageDaily = totalUsage / records.length;

  const usages = records.map(r => r.usage);
  const maxDaily = Math.max(...usages);
  const minDaily = Math.min(...usages);

  const maxRecord = records.find(r => r.usage === maxDaily);
  const minRecord = records.find(r => r.usage === minDaily);

  return {
    totalUsage: Math.round(totalUsage * 100) / 100,
    totalCost: Math.round(totalCost * 100) / 100,
    averageDaily: Math.round(averageDaily * 100) / 100,
    maxDaily: maxRecord?.day || 0,
    minDaily: minRecord?.day || 0,
    maxDailyValue: Math.round(maxDaily * 100) / 100,
    minDailyValue: Math.round(minDaily * 100) / 100,
    daysWithData: records.length,
    daysWithoutData: totalDays - records.length,
    totalDays,
  };
}

/**
 * 获取内置数据
 */
export function getBuiltInData(): EnergyRecord[] {
  return parseEnergyData(RAW_DATA);
}

/**
 * 获取内置数据的完整解析结果（包含年月元信息）
 */
export function getBuiltInDataWithMeta(): ParsedEnergyData {
  return parseEnergyDataWithMeta(RAW_DATA);
}

/**
 * 获取内置数据的统计信息
 * @param totalDays 月份总天数（28/29/30/31），不传入则自动从数据解析
 */
export function getBuiltInStats(totalDays?: number): EnergyStats {
  const meta = getBuiltInDataWithMeta();
  const days = totalDays ?? meta.daysInMonth;
  return calculateStats(meta.records, days);
}

/**
 * 根据月份获取统计信息（智能计算天数）
 * @param year 年份
 * @param month 月份（1-12）
 */
export function getStatsByMonth(year: number, month: number): EnergyStats {
  const records = getBuiltInData();
  const daysInMonth = getDaysInMonth(year, month);
  return calculateStats(records, daysInMonth);
}
