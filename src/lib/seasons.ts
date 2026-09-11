export function getSeasonKeyInfo(date?: Date): {
  seasonKey: string;
  name: string;
  startDate: Date;
  endDate: Date;
} {
  const d = date ?? new Date();
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const day = d.getDate();

  let startYear: number;
  let endYear: number;

  if (month > 8 || (month === 8 && day >= 16)) {
    startYear = year;
    endYear = year + 1;
  } else {
    startYear = year - 1;
    endYear = year;
  }

  const startDate = new Date(startYear, 7, 16);
  const endDate = new Date(endYear, 5, 15);
  const seasonKey = `${startYear.toString().slice(-2)}/${endYear.toString().slice(-2)}`;
  const name = `Stagione ${seasonKey}`;

  return {
    seasonKey,
    name,
    startDate,
    endDate,
  };
}

export function formatSeasonName(rawName: string | null | undefined): string {
  if (!rawName) return "";
  const match = rawName.match(/(\d{4})\s*\/\s*(\d{2,4})|(\d{2})\s*\/\s*(\d{2})/);
  if (!match) return rawName;
  let startShort: string;
  let endShort: string;
  if (match[1] && match[2]) {
    startShort = match[1].slice(-2);
    endShort = match[2].slice(-2);
  } else {
    startShort = match[3];
    endShort = match[4];
  }
  const shortKey = `${startShort}/${endShort}`;
  if (/stagione/i.test(rawName)) {
    return `Stagione ${shortKey}`;
  }
  return shortKey;
}

export function formatSeasonKey(key: string | null | undefined): string {
  if (!key) return "";
  const match = key.match(/(\d{4})\s*\/\s*(\d{2,4})|(\d{2})\s*\/\s*(\d{2})/);
  if (!match) return key;
  if (match[1] && match[2]) {
    return `${match[1].slice(-2)}/${match[2].slice(-2)}`;
  }
  return key;
}
