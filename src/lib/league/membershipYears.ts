/** The calendar years a membership covers: one, or two when approved from 1 October. */
export const membershipYears = (startsOn: string, endsOn: string) => {
  const a = startsOn.slice(0, 4);
  const b = endsOn.slice(0, 4);
  return a && a !== b ? [a, b] : [b];
};
