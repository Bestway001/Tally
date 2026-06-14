export const GRADES = {
  5: [
    { label: 'A', min: 70, point: 5 },
    { label: 'B', min: 60, point: 4 },
    { label: 'C', min: 50, point: 3 },
    { label: 'D', min: 45, point: 2 },
    { label: 'E', min: 40, point: 1 },
    { label: 'F', min: 0, point: 0 },
  ],
  4: [
    { label: 'A', min: 70, point: 4 },
    { label: 'B', min: 60, point: 3 },
    { label: 'C', min: 50, point: 2 },
    { label: 'D', min: 45, point: 1 },
    { label: 'F', min: 0, point: 0 },
  ],
};

export const CATEGORIES = [
  'Food', 'Transport', 'Data/Airtime', 'Books/School',
  'Accommodation', 'Clothing', 'Health', 'Entertainment', 'Others',
];

export function gradesFor(scale) {
  return GRADES[scale] || GRADES[5];
}

export function gradePoint(scale, label) {
  const g = gradesFor(scale).find((x) => x.label === label);
  return g ? g.point : 0;
}

export function degreeClass(scale, cgpa) {
  if (scale === 5) {
    if (cgpa >= 4.5) return { label: 'First class', pill: 'pill-green' };
    if (cgpa >= 3.5) return { label: 'Second class upper', pill: 'pill-gold' };
    if (cgpa >= 2.5) return { label: 'Second class lower', pill: 'pill-amber' };
    if (cgpa >= 1.5) return { label: 'Third class', pill: 'pill-red' };
    return { label: 'Pass', pill: 'pill-red' };
  }
  if (cgpa >= 3.6) return { label: 'First class', pill: 'pill-green' };
  if (cgpa >= 3.0) return { label: 'Second class upper', pill: 'pill-gold' };
  if (cgpa >= 2.0) return { label: 'Second class lower', pill: 'pill-amber' };
  if (cgpa >= 1.0) return { label: 'Third class', pill: 'pill-red' };
  return { label: 'Pass', pill: 'pill-red' };
}

export function gpaOf(courses) {
  const units = courses.reduce((s, c) => s + c.units, 0);
  if (!units) return { gpa: 0, units: 0, valid: false };
  const points = courses.reduce((s, c) => s + c.grade_point * c.units, 0);
  return { gpa: points / units, units, valid: true };
}

export function naira(n) {
  return '₦' + Math.round(n).toLocaleString('en-NG');
}

export function gradePill(scale, point) {
  const max = scale;
  if (point >= max - 1) return 'pill-green';
  if (point >= max - 2) return 'pill-gold';
  if (point >= max - 3) return 'pill-amber';
  return 'pill-red';
}

export function initials(name) {
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
}

export function levelsUpTo(level) {
  const out = [];
  for (let l = 100; l <= level; l += 100) out.push(l);
  return out;
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}
