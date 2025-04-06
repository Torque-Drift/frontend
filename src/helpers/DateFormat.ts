import { DateTime } from "luxon";

function toFormat(date: string, format = "dd/MM/yyyy") {
  return DateTime.fromISO(date).toUTC().toFormat(format);
}

function isoToTimestamp(iso8601Date: string) {
  return DateTime.fromISO(iso8601Date).toMillis();
}

function secToDays(secs: number) {
  const segundosEmUmDia = 86400;
  return secs / segundosEmUmDia;
}

function unixToTimestamp(unixTime: number) {
  return unixTime * 1000;
}

function timestampUntil(dateString: string | number) {
  if (!dateString) return 0;
  const now = new Date();
  const targetDate = new Date(dateString);
  if (isNaN(targetDate.getTime())) {
    console.error("Invalid date string provided.");
    return 0;
  }
  const differenceInMilliseconds = targetDate.getTime() - now.getTime();
  return differenceInMilliseconds;
}

function timestampToDate(timestamp: number) {
  const totalSeconds = Math.floor(timestamp / 1000);
  const days = Math.floor(totalSeconds / (60 * 60 * 24));
  const hours = Math.floor((totalSeconds % (60 * 60 * 24)) / (60 * 60));
  const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
  const seconds = totalSeconds % 60;

  return { days, hours, minutes, seconds };
}

function dateToTimestamp(date: string) {
  return Math.floor(new Date(date).getTime() / 1000);
}

export const DateFormat = {
  toFormat,
  isoToTimestamp,
  secToDays,
  timestampUntil,
  timestampToDate,
  unixToTimestamp,
  dateToTimestamp,
};
