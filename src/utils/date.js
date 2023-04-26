export function convertUnixTime(date) {
  return Math.floor(date.getTime() / 1000);
}
