import axios from 'axios';
import type { SensorDevice, SensorReading } from '../types/sensor';
import { getSensorInfo } from '../utils/sensorUtils';

const apiUrl = "/sensingtools-api/api/user-hard-sensors/cVDqRI0BmK9pjniFeoOV/data";

//Recoge los últimos valores de todos los sensores
export const getLatestValues = async (): Promise<SensorDevice[]> => {
  try {
    const url = apiUrl + "/latest-values";
    const response = await axios.get(url);
    const datosRaw = response.data.data;

    const sensoresMap = new Map<string, {
      location_id: string;
      lat: number;
      lon: number;
      alt: number;
      data: SensorReading[];
    }>();

    for (const sensor of datosRaw) {
      if (!sensoresMap.has(sensor.name)) {
        sensoresMap.set(sensor.name, {
          location_id: sensor.location_id,
          lat: parseFloat(sensor.lat),
          lon: parseFloat(sensor.lon),
          alt: parseFloat(sensor.alt),
          data: []
        });
      }

      const sensorData = sensoresMap.get(sensor.name)!;
      const { label, unit } = getSensorInfo(sensor.sensor_type);
      sensorData.data.push({
        type: label,
        value: sensor.value,
        unit: unit,
        timestamp: sensor.timestamp
      });
    }

    const devices: SensorDevice[] = Array.from(sensoresMap, ([name, data]) => ({
      location_id: data.location_id,
      name: name,
      lat: data.lat,
      lon: data.lon,
      alt: data.alt,
      data: data.data
    }));

    return devices;
  } catch (error) {
    console.error("Error fetching sensor data:", error);
    throw error;
  }
};

//Recoge los datos de un sensor en concreto en un rango de fechas
export const getValuesBySensor = async (sensorName: string, timeFrom?: any, timeTo?: any) => {
  let finalTimeTo = timeTo;
  //Si no se especifica un día final, se coge el actual
  if (!finalTimeTo) {
    finalTimeTo = new Date().getTime();
  }

  let finalTimeFrom = timeFrom;
  //Si no se especifica un día inicial, se coge un mes
  if (!finalTimeFrom) {
    const date = new Date(finalTimeTo);
    date.setMonth(date.getMonth() - 1);
    finalTimeFrom = date.getTime();
  }

  const url = apiUrl + "?sensorTypeNames=humidity,noise,temperature&fromDate=" + finalTimeFrom + "&toDate=" + finalTimeTo + "&locationIds=" + sensorName + "&group=location";
  try {
    const response = await axios.get(url);
    const data = response.data;

    const result: Record<string, any[]> = {};

    if (data && data.series) {
      const series = data.series;
      const keys = Object.keys(series);

      for (const key of keys) {
        const types = Object.keys(series[key]);
        for (const type of types) {
          const { label, unit } = getSensorInfo(type);
          const rawData = series[key][type];

          const dailyData = new Map<string, { sum: number; count: number; timestamp: number }>();
          const currentHour = new Date().getHours();

          rawData.forEach((d: any[]) => {
            const timestamp = d[0];
            const value = Number(d[1]);
            const date = new Date(timestamp);

            if (date.getHours() === currentHour) {
              const dateStr = date.toLocaleDateString();

              if (!dailyData.has(dateStr)) {
                dailyData.set(dateStr, { sum: 0, count: 0, timestamp });
              }

              const entry = dailyData.get(dateStr)!;
              entry.sum += value;
              entry.count += 1;
            }
          });

          result[label] = Array.from(dailyData.entries()).map(([dateStr, d]) => ({
            time: dateStr,
            fullTime: d.timestamp,
            value: Number((d.sum / d.count).toFixed(2)),
            unit: unit
          })).sort((a, b) => a.fullTime - b.fullTime);
        }
      }
    }

    return result;
  } catch (error) {
    console.error("Error fetching sensor data:", error);
    return {};
  }
}



export const getDataForChart = async (
  sensorName: string,
  targetDate: Date,
  comparisonMode: 'same_hour_yesterday' | 'daily_average_yesterday'
) => {
  const fromDate = new Date(targetDate);
  fromDate.setDate(fromDate.getDate() - 1);
  fromDate.setHours(0, 0, 0, 0);

  const toDate = new Date(targetDate);
  toDate.setHours(23, 59, 59, 999);

  const url = `${apiUrl}?sensorTypeNames=humidity,noise,temperature&fromDate=${fromDate.getTime()}&toDate=${toDate.getTime()}&locationIds=${sensorName}&group=location`;
  console.log(url);

  try {
    const response = await axios.get(url);
    const data = response.data;
    const result: Record<string, any[]> = {};

    if (data && data.series) {
      const typeMergedHours: Record<string, any[]> = {};

      const keys = Object.keys(data.series);
      for (const key of keys) {
        const types = Object.keys(data.series[key]);
        for (const type of types) {
          const { label } = getSensorInfo(type);
          const rawData = data.series[key][type];

          if (!typeMergedHours[label]) {
            typeMergedHours[label] = Array.from({ length: 24 }, (_, i) => ({
              hour: i,
              timeLabel: `${i.toString().padStart(2, '0')}:00`,
              todayValue: 0,
              yesterdayValue: 0,
              todayCount: 0,
              yesterdayCount: 0
            }));
          }

          const mergedHours = typeMergedHours[label];
          const targetDay = targetDate.getDate();
          const targetMonth = targetDate.getMonth();
          const targetYear = targetDate.getFullYear();

          rawData.forEach((d: any[]) => {
            const timestamp = d[0];
            const value = Number(d[1]);
            const date = new Date(timestamp);
            const dataHour = date.getHours();

            const isToday =
              date.getDate() === targetDay &&
              date.getMonth() === targetMonth &&
              date.getFullYear() === targetYear;

            if (isToday) {
              mergedHours[dataHour].todayValue += value;
              mergedHours[dataHour].todayCount += 1;
            } else {
              mergedHours[dataHour].yesterdayValue += value;
              mergedHours[dataHour].yesterdayCount += 1;
            }
          });
        }
      }

      for (const label of Object.keys(typeMergedHours)) {
        const mergedHours = typeMergedHours[label];
        let yesterdayDailySum = 0;
        let yesterdayDailyCount = 0;

        const chartData = mergedHours.map(hourData => {
          const finalToday = hourData.todayCount > 0 ? Number((hourData.todayValue / hourData.todayCount).toFixed(2)) : null;
          const finalYesterday = hourData.yesterdayCount > 0 ? Number((hourData.yesterdayValue / hourData.yesterdayCount).toFixed(2)) : null;

          if (finalYesterday !== null) {
            yesterdayDailySum += finalYesterday;
            yesterdayDailyCount += 1;
          }

          return {
            hour: hourData.hour,
            timeLabel: hourData.timeLabel,
            todayValue: finalToday,
            yesterdayValue: finalYesterday,
          };
        });

        if (comparisonMode === 'daily_average_yesterday') {
          const avgYesterday = yesterdayDailyCount > 0 ? Number((yesterdayDailySum / yesterdayDailyCount).toFixed(2)) : null;
          chartData.forEach(cd => { cd.yesterdayValue = avgYesterday; });
        }

        result[label] = chartData;
      }
    }
    return result;
  } catch (error) {
    console.error("Error fetching advanced sensor data:", error);
    return {};
  }
};


type Interval = 'hour' | 'day' | 'month';

function getInterval(startDate: Date, endDate: Date): Interval {
  const diffMs = endDate.getTime() - startDate.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  if (diffDays < 30) return 'hour';
  if (diffDays <= 183) return 'day';
  return 'month';
}

const MONTH_NAMES_SHORT = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

function getIntervalLabel(date: Date, interval: Interval): { key: string; label: string; sortTs: number } {
  const dd = date.getDate().toString().padStart(2, '0');
  const mm = (date.getMonth() + 1).toString().padStart(2, '0');
  const yy = date.getFullYear();

  switch (interval) {
    case 'hour': {
      const hh = date.getHours().toString().padStart(2, '0');
      return {
        key: `${yy}-${mm}-${dd}-${hh}`,
        label: `${dd}/${mm} ${hh}:00`,
        sortTs: new Date(yy, date.getMonth(), date.getDate(), date.getHours()).getTime()
      };
    }
    case 'day': {
      return {
        key: `${yy}-${mm}-${dd}`,
        label: `${dd}/${mm}`,
        sortTs: new Date(yy, date.getMonth(), date.getDate()).getTime()
      };
    }
    case 'month': {
      return {
        key: `${yy}-${mm}`,
        label: `${MONTH_NAMES_SHORT[date.getMonth()]} ${yy}`,
        sortTs: new Date(yy, date.getMonth(), 1).getTime()
      };
    }
  }
}

const dateRangeCache = new Map<string, Record<string, any[]>>();

export const getDataForDateRange = async (
  sensorName: string,
  startDate: Date,
  endDate: Date,
  signal?: AbortSignal
) => {
  const fromDate = new Date(startDate);
  fromDate.setHours(0, 0, 0, 0);

  const toDate = new Date(endDate);
  toDate.setHours(23, 59, 59, 999);

  const interval = getInterval(fromDate, toDate);
  const cacheKey = `${sensorName}_${fromDate.getTime()}_${toDate.getTime()}`;

  if (dateRangeCache.has(cacheKey)) {
    return dateRangeCache.get(cacheKey)!;
  }

  const url = `${apiUrl}?sensorTypeNames=humidity,noise,temperature&fromDate=${fromDate.getTime()}&toDate=${toDate.getTime()}&locationIds=${sensorName}&group=location`;
  try {
    const response = await axios.get(url, { signal });
    const data = response.data;
    const result: Record<string, any[]> = {};

    if (data && data.series) {
      const typeMergedPoints: Record<string, Map<string, { sum: number; count: number; label: string; sortTs: number }>> = {};

      const tempDate = new Date();

      const keys = Object.keys(data.series);
      for (const key of keys) {
        const types = Object.keys(data.series[key]);
        for (const type of types) {
          const { label } = getSensorInfo(type);
          const rawData = data.series[key][type];

          if (!typeMergedPoints[label]) {
            typeMergedPoints[label] = new Map();
          }

          const mergedPoints = typeMergedPoints[label];

          for (let i = 0; i < rawData.length; i++) {
            const d = rawData[i];
            const value = Number(d[1]);
            tempDate.setTime(d[0]);
            const group = getIntervalLabel(tempDate, interval);

            const existing = mergedPoints.get(group.key);
            if (existing) {
              existing.sum += value;
              existing.count += 1;
            } else {
              mergedPoints.set(group.key, { sum: 0 + value, count: 1, label: group.label, sortTs: group.sortTs });
            }
          }
        }
      }

      for (const label of Object.keys(typeMergedPoints)) {
        const points = typeMergedPoints[label];
        const chartData = Array.from(points.values())
          .map(d => ({
            timeLabel: d.label,
            timestamp: d.sortTs,
            todayValue: Number((d.sum / d.count).toFixed(2))
          }))
          .sort((a, b) => a.timestamp - b.timestamp);

        result[label] = chartData;
      }
    }

    if (dateRangeCache.size >= 20) {
      const firstKey = dateRangeCache.keys().next().value;
      if (firstKey) dateRangeCache.delete(firstKey);
    }
    dateRangeCache.set(cacheKey, result);

    return result;
  } catch (error) {
    if (axios.isCancel(error)) return {};
    console.error("Error fetching date range sensor data:", error);
    return {};
  }
};
