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

import { RAW_DATA } from './rawData';

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

// 电价常量（元/度）
export const ELECTRICITY_PRICE = 0.5483;

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

    // 匹配格式：01日0.03度（可能包含充值信息）
    const match = line.match(/(\d{2})日([0-9.-]+)度/);
    if (match) {
      const day = parseInt(match[1], 10);
      const usageStr = match[2];

      // 处理缺失数据（用 "-" 表示）
      if (usageStr !== '-') {
        const usage = parseFloat(usageStr);

        if (!isNaN(usage)) {
          // 费用由用电量 * 电价计算得出
          const cost = usage * ELECTRICITY_PRICE;
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
 * 生成指定月份的空白数据
 * @param month 月份（1-12）
 */
export function generateEmptyData(month: number): EnergyRecord[] {
  const daysInMonth = getDefaultDaysInMonth(month);
  return []; // 空数组表示所有日期都是空白数据
}

/**
 * 解析指定月份的原始数据
 * @param rawData 原始数据
 * @param targetMonth 目标月份（1-12）
 */
export function parseEnergyDataByMonth(rawData: string, targetMonth: number): EnergyRecord[] {
  const lines = rawData.split('\n').filter(line => line.trim());
  const records: EnergyRecord[] = [];
  let currentMonth = 0;
  let inTargetMonth = false;

  for (const line of lines) {
    // 匹配年月格式：2026年03月
    const yearMonthMatch = line.match(/(\d{4})年(\d{2})月/);
    if (yearMonthMatch) {
      currentMonth = parseInt(yearMonthMatch[2], 10);
      inTargetMonth = currentMonth === targetMonth;
      continue;
    }

    // 只处理目标月份的数据
    if (inTargetMonth) {
      // 匹配格式：01日0.03度（可能包含充值信息）
      const match = line.match(/(\d{2})日([0-9.-]+)度/);
      if (match) {
        const day = parseInt(match[1], 10);
        const usageStr = match[2];

        // 处理缺失数据（用 "-" 表示）
        if (usageStr !== '-') {
          const usage = parseFloat(usageStr);

          if (!isNaN(usage)) {
            // 费用由用电量 * 电价计算得出
            const cost = usage * ELECTRICITY_PRICE;
            records.push({
              day,
              usage,
              cost,
            });
          }
        }
      }
    }
  }

  return records;
}

/**
 * 获取指定月份的数据
 * @param month 月份（1-12）
 */
export function getDataByMonth(month: number): EnergyRecord[] {
  if (month >= 3 && month <= 6) {
    const records = parseEnergyDataByMonth(RAW_DATA, month);
    return records.length > 0 ? records : generateEmptyData(month);
  }
  return [];
}

/**
 * 获取指定月份的完整解析结果（包含年月元信息）
 * @param month 月份（1-12）
 */
export function getDataWithMetaByMonth(month: number): ParsedEnergyData {
  if (month >= 3 && month <= 6) {
    const records = parseEnergyDataByMonth(RAW_DATA, month);
    const daysInMonth = getDefaultDaysInMonth(month);
    return {
      year: 2026,
      month,
      daysInMonth,
      records: records.length > 0 ? records : generateEmptyData(month),
    };
  }
  return {
    year: 2026,
    month,
    daysInMonth: 30,
    records: [],
  };
}

/**
 * 获取指定月份的统计信息
 * @param month 月份（1-12）
 */
export function getStatsByMonth(year: number, month: number): EnergyStats {
  const records = getDataByMonth(month);
  const daysInMonth = getDaysInMonth(year, month);
  return calculateStats(records, daysInMonth);
}

/**
 * 获取内置数据（默认3月）
 */
export function getBuiltInData(): EnergyRecord[] {
  return getDataByMonth(3);
}

/**
 * 获取内置数据的完整解析结果（包含年月元信息）（默认3月）
 */
export function getBuiltInDataWithMeta(): ParsedEnergyData {
  return getDataWithMetaByMonth(3);
}

/**
 * 获取内置数据的统计信息（默认3月）
 * @param totalDays 月份总天数（28/29/30/31），不传入则自动从数据解析
 */
export function getBuiltInStats(totalDays?: number): EnergyStats {
  const meta = getBuiltInDataWithMeta();
  const days = totalDays ?? meta.daysInMonth;
  return calculateStats(meta.records, days);
}

// 充值记录接口
export interface RechargeRecord {
  month: number;
  day: number;
  amount: number; // 充值度数
}

// 剩余电量信息接口
export interface BatteryInfo {
  currentBalance: number; // 当前剩余度数
  totalRecharged: number; // 总充值度数
  totalUsed: number; // 总使用度数
}

// 充值推荐信息接口
export interface RechargeRecommendation {
  shouldRecharge: boolean; // 是否需要充值
  recommendedDate: string; // 推荐充值日期
  daysUntilEmpty: number; // 预计剩余天数
  recommendedAmount: number; // 推荐充值度数
  urgency: 'low' | 'medium' | 'high'; // 紧急程度
}

/**
 * 解析充值数据
 * @param rawData 原始数据
 */
export function parseRechargeData(rawData: string): RechargeRecord[] {
  const lines = rawData.split('\n').filter(line => line.trim());
  const recharges: RechargeRecord[] = [];
  let currentMonth = 0;

  for (const line of lines) {
    // 匹配年月格式：2026年03月
    const yearMonthMatch = line.match(/(\d{4})年(\d{2})月/);
    if (yearMonthMatch) {
      currentMonth = parseInt(yearMonthMatch[2], 10);
      continue;
    }

    // 匹配格式：01日0.03度，充值10度 或 01日0.03度，充值10.2度
    const match = line.match(/(\d{2})日[0-9.-]+度.*充值([0-9.]+)度/);
    if (match) {
      const day = parseInt(match[1], 10);
      const amount = parseFloat(match[2]);

      if (!isNaN(day) && !isNaN(amount)) {
        recharges.push({
          month: currentMonth,
          day,
          amount,
        });
      }
    }
  }

  return recharges;
}

/**
 * 计算剩余电量
 * @param rawData 原始数据
 */
export function calculateBatteryInfo(rawData: string): BatteryInfo {
  const recharges = parseRechargeData(rawData);
  const totalRecharged = recharges.reduce((sum, r) => sum + r.amount, 0);

  // 解析所有用电数据
  const allRecords: EnergyRecord[] = [];
  const lines = rawData.split('\n').filter(line => line.trim());
  let currentMonth = 0;

  for (const line of lines) {
    // 匹配年月格式：2026年03月
    const yearMonthMatch = line.match(/(\d{4})年(\d{2})月/);
    if (yearMonthMatch) {
      currentMonth = parseInt(yearMonthMatch[2], 10);
      continue;
    }

    // 匹配格式：01日0.03度（可能包含充值信息）
    const match = line.match(/(\d{2})日([0-9.-]+)度/);
    if (match) {
      const day = parseInt(match[1], 10);
      const usageStr = match[2];

      // 处理缺失数据（用 "-" 表示）
      if (usageStr !== '-') {
        const usage = parseFloat(usageStr);

        if (!isNaN(usage)) {
          // 费用由用电量 * 电价计算得出
          const cost = usage * ELECTRICITY_PRICE;
          allRecords.push({
            day,
            usage,
            cost,
          });
        }
      }
    }
  }

  const totalUsed = allRecords.reduce((sum, r) => sum + r.usage, 0);
  const currentBalance = totalRecharged - totalUsed;

  return {
    currentBalance: Math.round(currentBalance * 100) / 100,
    totalRecharged,
    totalUsed: Math.round(totalUsed * 100) / 100,
  };
}

/**
 * 获取充值推荐
 * @param batteryInfo 电池信息
 * @param averageDailyUsage 日均用电量
 * @param currentDate 当前日期
 * @param chargeDelayDays 充电延迟天数（1-3天）
 */
export function getRechargeRecommendation(
  batteryInfo: BatteryInfo,
  averageDailyUsage: number,
  currentDate: Date = new Date(),
  chargeDelayDays: number = 2
): RechargeRecommendation {
  if (averageDailyUsage <= 0) {
    return {
      shouldRecharge: false,
      recommendedDate: '-',
      daysUntilEmpty: Infinity,
      recommendedAmount: 0,
      urgency: 'low',
    };
  }

  const daysUntilEmpty = batteryInfo.currentBalance / averageDailyUsage;
  const safeDays = 3; // 安全余量天数

  // 计算推荐充值日期（考虑充电延迟）
  const recommendedDate = new Date(currentDate);
  recommendedDate.setDate(currentDate.getDate() + Math.max(0, Math.floor(daysUntilEmpty - safeDays - chargeDelayDays)));

  // 推荐充值度数（约30天的用量）
  const recommendedAmount = Math.ceil(averageDailyUsage * 30);

  // 判断紧急程度
  let urgency: 'low' | 'medium' | 'high' = 'low';
  if (daysUntilEmpty <= 3) {
    urgency = 'high';
  } else if (daysUntilEmpty <= 7) {
    urgency = 'medium';
  }

  // 判断是否需要充值
  const shouldRecharge = daysUntilEmpty <= safeDays + chargeDelayDays + 2;

  return {
    shouldRecharge,
    recommendedDate: recommendedDate.toLocaleDateString('zh-CN'),
    daysUntilEmpty: Math.round(daysUntilEmpty * 10) / 10,
    recommendedAmount,
    urgency,
  };
}
