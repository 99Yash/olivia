'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';

export type MonthYearValue = {
  month: number | null;
  year: number | null;
};

const MONTHS = [
  { value: '1', label: 'Jan' },
  { value: '2', label: 'Feb' },
  { value: '3', label: 'Mar' },
  { value: '4', label: 'Apr' },
  { value: '5', label: 'May' },
  { value: '6', label: 'Jun' },
  { value: '7', label: 'Jul' },
  { value: '8', label: 'Aug' },
  { value: '9', label: 'Sep' },
  { value: '10', label: 'Oct' },
  { value: '11', label: 'Nov' },
  { value: '12', label: 'Dec' },
];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 50 }, (_, i) =>
  String(currentYear - i)
);

export function MonthYearPicker({
  value,
  onChange,
}: {
  value: MonthYearValue;
  onChange: (val: MonthYearValue) => void;
}) {
  return (
    <div className="flex gap-2">
      <Select
        value={value.month ? String(value.month) : ''}
        onValueChange={(v) =>
          onChange({ ...value, month: v ? Number(v) : null })
        }
      >
        <SelectTrigger className="w-[90px]">
          <SelectValue placeholder="Month" />
        </SelectTrigger>
        <SelectContent>
          {MONTHS.map((m) => (
            <SelectItem key={m.value} value={m.value}>
              {m.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={value.year ? String(value.year) : ''}
        onValueChange={(v) =>
          onChange({ ...value, year: v ? Number(v) : null })
        }
      >
        <SelectTrigger className="w-[90px]">
          <SelectValue placeholder="Year" />
        </SelectTrigger>
        <SelectContent>
          {YEARS.map((y) => (
            <SelectItem key={y} value={y}>
              {y}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
