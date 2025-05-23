export const timeToMs = {
  hours: (hours: number) => hours * 60 * 60 * 1000,
  mins: (mins: number) => mins * 60 * 1000,
  secs: (secs: number) => secs * 1000,
  days: (days: number) => days * 24 * 60 * 60 * 1000,
} as const;

export const msToTime = (time: number): string => {
  const days = Math.floor(time / timeToMs.days(1));
  time -= days * timeToMs.days(1);

  const hours = Math.floor(time / timeToMs.hours(1));
  time -= hours * timeToMs.hours(1);

  const minutes = Math.floor(time / timeToMs.mins(1));
  time -= minutes * timeToMs.mins(1);

  const seconds = Math.floor(time / timeToMs.secs(1));

  const pad = (num: number) => num.toString().padStart(2, "0");

  return `${pad(days)}:${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
};

export const isoDurationToMs = (iso: string) => {
  const match = /^PT(?:(\d+)M)?(?:(\d+)S)?$/.exec(iso);

  if (!match || (!match[1] && !match[2])) {
    throw new Error(`Invalid ISO duration: ${iso}`);
  }

  const minutes = parseInt(match[1] || "0", 10);
  const seconds = parseInt(match[2] || "0", 10);

  return (minutes * 60 + seconds) * 1000;
};
