/**
 * Number formatting utilities for the game UI.
 */

const SUFFIXES = [
  "", "k", "M", "B", "T", "Qa", "Qi", "Sx", "Sp", "Oc", "No",
  "Dc", "Ud", "Dd", "Td", "Qad", "Qid", "Sxd", "Spd", "Od", "Nd", "V",
  "UV", "DV", "TV", "QaV", "QiV", "SxV", "SpV", "OV", "NV", "Tg",
];

/** Format a large number with suffix abbreviation (e.g. 1.5M, 2.3B) */
export function formatNumber(num: number): string {
  if (num === 0) return "0";
  if (num < 0) return "-" + formatNumber(-num);
  if (num < 1000) return Math.floor(num).toString();
  if (!isFinite(num)) return "∞";

  const exponent = Math.floor(Math.log10(num) / 3);

  if (exponent >= SUFFIXES.length) return num.toExponential(2);

  const shortNum = num / Math.pow(1000, exponent);
  return shortNum.toFixed(2).replace(/\.00$/, "").replace(/(\.\d)0$/, "$1") + SUFFIXES[exponent];
}

/** Format seconds into a human-readable time string (e.g. "2h 30m 15s") */
export function formatTime(totalSeconds: number): string {
  if (totalSeconds < 0) return "0s";
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

/** Format a decimal as a percentage string (e.g. 0.156 -> "15.6%") */
export function formatPercent(value: number, decimals = 1): string {
  return (value * 100).toFixed(decimals) + "%";
}

/** Format a number with commas (e.g. 1234567 -> "1,234,567") */
export function formatWithCommas(num: number): string {
  return Math.floor(num).toLocaleString();
}
