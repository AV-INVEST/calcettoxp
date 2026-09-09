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
  const seasonKey = `${startYear}/${endYear.toString().slice(-2)}`;
  const name = `Stagione ${seasonKey}`;

  return {
    seasonKey,
    name,
    startDate,
    endDate,
  };
}
