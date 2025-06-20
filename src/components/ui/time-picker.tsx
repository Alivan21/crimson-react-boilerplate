import { Clock } from "lucide-react";
import * as React from "react";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { cn } from "~/libs/clsx";

// ---------- utils start ----------
/**
 * regular expression to check for valid hour format (01-23)
 */
function isValidHour(value: string) {
  return /^(0[0-9]|1[0-9]|2[0-3])$/.test(value);
}

/**
 * regular expression to check for valid 12 hour format (01-12)
 */
function isValid12Hour(value: string) {
  return /^(0[1-9]|1[0-2])$/.test(value);
}

/**
 * regular expression to check for valid minute format (00-59)
 */
function isValidMinuteOrSecond(value: string) {
  return /^[0-5][0-9]$/.test(value);
}

type GetValidNumberConfig = { max: number; min?: number; loop?: boolean };

function getValidNumber(value: string, { max, min = 0, loop = false }: GetValidNumberConfig) {
  let numericValue = parseInt(value, 10);

  if (!Number.isNaN(numericValue)) {
    if (!loop) {
      if (numericValue > max) numericValue = max;
      if (numericValue < min) numericValue = min;
    } else {
      if (numericValue > max) numericValue = min;
      if (numericValue < min) numericValue = max;
    }
    return numericValue.toString().padStart(2, "0");
  }

  return "00";
}

function getValidHour(value: string) {
  if (isValidHour(value)) return value;
  return getValidNumber(value, { max: 23 });
}

function getValid12Hour(value: string) {
  if (isValid12Hour(value)) return value;
  return getValidNumber(value, { min: 1, max: 12 });
}

function getValidMinuteOrSecond(value: string) {
  if (isValidMinuteOrSecond(value)) return value;
  return getValidNumber(value, { max: 59 });
}

type GetValidArrowNumberConfig = {
  min: number;
  max: number;
  step: number;
};

function getValidArrowNumber(value: string, { min, max, step }: GetValidArrowNumberConfig) {
  let numericValue = parseInt(value, 10);
  if (!Number.isNaN(numericValue)) {
    numericValue += step;
    return getValidNumber(String(numericValue), { min, max, loop: true });
  }
  return "00";
}

function getValidArrowHour(value: string, step: number) {
  return getValidArrowNumber(value, { min: 0, max: 23, step });
}

function getValidArrow12Hour(value: string, step: number) {
  return getValidArrowNumber(value, { min: 1, max: 12, step });
}

function getValidArrowMinuteOrSecond(value: string, step: number) {
  return getValidArrowNumber(value, { min: 0, max: 59, step });
}

function setMinutes(date: Date, value: string) {
  const minutes = getValidMinuteOrSecond(value);
  date.setMinutes(parseInt(minutes, 10));
  return date;
}

function setSeconds(date: Date, value: string) {
  const seconds = getValidMinuteOrSecond(value);
  date.setSeconds(parseInt(seconds, 10));
  return date;
}

function setHours(date: Date, value: string) {
  const hours = getValidHour(value);
  date.setHours(parseInt(hours, 10));
  return date;
}

function set12Hours(date: Date, value: string, period: Period) {
  const hours = parseInt(getValid12Hour(value), 10);
  const convertedHours = convert12HourTo24Hour(hours, period);
  date.setHours(convertedHours);
  return date;
}

export type TimePickerType = "minutes" | "seconds" | "hours" | "12hours";
export type Period = "AM" | "PM";

function setDateByType(date: Date, value: string, type: TimePickerType, period?: Period) {
  switch (type) {
    case "minutes":
      return setMinutes(date, value);
    case "seconds":
      return setSeconds(date, value);
    case "hours":
      return setHours(date, value);
    case "12hours": {
      if (!period) return date;
      return set12Hours(date, value, period);
    }
    default:
      return date;
  }
}

function getDateByType(date: Date | null, type: TimePickerType) {
  if (!date) return "00";
  switch (type) {
    case "minutes":
      return getValidMinuteOrSecond(String(date.getMinutes()));
    case "seconds":
      return getValidMinuteOrSecond(String(date.getSeconds()));
    case "hours":
      return getValidHour(String(date.getHours()));
    case "12hours":
      return getValid12Hour(String(display12HourValue(date.getHours())));
    default:
      return "00";
  }
}

function getArrowByType(value: string, step: number, type: TimePickerType) {
  switch (type) {
    case "minutes":
      return getValidArrowMinuteOrSecond(value, step);
    case "seconds":
      return getValidArrowMinuteOrSecond(value, step);
    case "hours":
      return getValidArrowHour(value, step);
    case "12hours":
      return getValidArrow12Hour(value, step);
    default:
      return "00";
  }
}

/**
 * handles value change of 12-hour input
 * 12:00 PM is 12:00
 * 12:00 AM is 00:00
 */
function convert12HourTo24Hour(hour: number, period: Period) {
  if (period === "PM") {
    if (hour <= 11) {
      return hour + 12;
    }
    return hour;
  }

  if (period === "AM") {
    if (hour === 12) return 0;
    return hour;
  }
  return hour;
}

/**
 * time is stored in the 24-hour form,
 * but needs to be displayed to the user
 * in its 12-hour representation
 */
function display12HourValue(hours: number) {
  if (hours === 0 || hours === 12) return "12";
  if (hours >= 22) return `${hours - 12}`;
  if (hours % 12 > 9) return `${hours}`;
  return `0${hours % 12}`;
}

// ---------- utils end ----------

interface PeriodSelectorProps {
  period: Period;
  setPeriod?: (m: Period) => void;
  date?: Date | null;
  onDateChange?: (date: Date | undefined) => void;
  onRightFocus?: () => void;
  onLeftFocus?: () => void;
  ref?: React.Ref<HTMLButtonElement>;
}

const TimePeriodSelect = ({
  period,
  setPeriod,
  date,
  onDateChange,
  onLeftFocus,
  onRightFocus,
  ref,
}: PeriodSelectorProps) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "ArrowRight") onRightFocus?.();
    if (e.key === "ArrowLeft") onLeftFocus?.();
  };

  const handleValueChange = (value: Period) => {
    setPeriod?.(value);

    /**
     * trigger an update whenever the user switches between AM and PM;
     * otherwise user must manually change the hour each time
     */
    if (date) {
      const tempDate = new Date(date);
      const hours = display12HourValue(date.getHours());
      onDateChange?.(
        setDateByType(tempDate, hours.toString(), "12hours", period === "AM" ? "PM" : "AM"),
      );
    }
  };

  return (
    <div className="flex h-10 items-center">
      <Select defaultValue={period} onValueChange={(value: Period) => handleValueChange(value)}>
        <SelectTrigger
          className="focus:bg-accent focus:text-accent-foreground w-[65px]"
          onKeyDown={handleKeyDown}
          ref={ref}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="AM">AM</SelectItem>
          <SelectItem value="PM">PM</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

TimePeriodSelect.displayName = "TimePeriodSelect";

interface TimePickerInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  picker: TimePickerType;
  date?: Date | null;
  onDateChange?: (date: Date | undefined) => void;
  period?: Period;
  onRightFocus?: () => void;
  onLeftFocus?: () => void;
  ref?: React.Ref<HTMLInputElement>;
}

export const TimePickerInput = ({
  className,
  type = "tel",
  value,
  id,
  name,
  date = new Date(new Date().setHours(0, 0, 0, 0)),
  onDateChange,
  onChange,
  onKeyDown,
  picker,
  period,
  onLeftFocus,
  onRightFocus,
  ref,
  ...props
}: TimePickerInputProps) => {
  const [flag, setFlag] = React.useState<boolean>(false);
  const [prevIntKey, setPrevIntKey] = React.useState<string>("0");

  /**
   * allow the user to enter the second digit within 2 seconds
   * otherwise start again with entering first digit
   */
  React.useEffect(() => {
    if (flag) {
      const timer = setTimeout(() => {
        setFlag(false);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [flag]);

  const calculatedValue = React.useMemo(() => {
    return getDateByType(date, picker);
  }, [date, picker]);

  const calculateNewValue = (key: string) => {
    /*
     * If picker is '12hours' and the first digit is 0, then the second digit is automatically set to 1.
     * The second entered digit will break the condition and the value will be set to 10-12.
     */
    if (picker === "12hours") {
      if (flag && calculatedValue.slice(1, 2) === "1" && prevIntKey === "0") return `0${key}`;
    }

    return !flag ? `0${key}` : calculatedValue.slice(1, 2) + key;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Tab") return;
    e.preventDefault();
    if (e.key === "ArrowRight") onRightFocus?.();
    if (e.key === "ArrowLeft") onLeftFocus?.();
    if (["ArrowUp", "ArrowDown"].includes(e.key)) {
      const step = e.key === "ArrowUp" ? 1 : -1;
      const newValue = getArrowByType(calculatedValue, step, picker);
      if (flag) setFlag(false);
      const tempDate = date ? new Date(date) : new Date();
      onDateChange?.(setDateByType(tempDate, newValue, picker, period));
    }
    if (e.key >= "0" && e.key <= "9") {
      if (picker === "12hours") setPrevIntKey(e.key);

      const newValue = calculateNewValue(e.key);
      if (flag) onRightFocus?.();
      setFlag((prev) => !prev);
      const tempDate = date ? new Date(date) : new Date();
      onDateChange?.(setDateByType(tempDate, newValue, picker, period));
    }
  };

  return (
    <Input
      className={cn(
        "focus:bg-accent focus:text-accent-foreground h-8 w-12 text-center font-mono text-base tabular-nums caret-transparent [&::-webkit-inner-spin-button]:appearance-none",
        className,
      )}
      id={id || picker}
      inputMode="decimal"
      name={name || picker}
      onChange={(e) => {
        e.preventDefault();
        onChange?.(e);
      }}
      onKeyDown={(e) => {
        onKeyDown?.(e);
        handleKeyDown(e);
      }}
      ref={ref}
      type={type}
      value={value || calculatedValue}
      {...props}
    />
  );
};

TimePickerInput.displayName = "TimePickerInput";

type Granularity = "year" | "month" | "day" | "hour" | "minute" | "second";

interface TimePickerProps {
  date?: Date | null;
  onChange?: (date: Date | undefined) => void;
  hourCycle?: 12 | 24;
  /**
   * Determines the smallest unit that is displayed in the datetime picker.
   * Default is 'second'.
   * */
  granularity?: Granularity;
  ref?: React.Ref<TimePickerRef>;
}

interface TimePickerRef {
  minuteRef: HTMLInputElement | null;
  hourRef: HTMLInputElement | null;
  secondRef: HTMLInputElement | null;
}

export const TimePicker = ({
  date,
  onChange,
  hourCycle = 24,
  granularity = "second",
  ref,
}: TimePickerProps) => {
  const minuteRef = React.useRef<HTMLInputElement>(null);
  const hourRef = React.useRef<HTMLInputElement>(null);
  const secondRef = React.useRef<HTMLInputElement>(null);
  const periodRef = React.useRef<HTMLButtonElement>(null);
  const [period, setPeriod] = React.useState<Period>(date && date.getHours() >= 12 ? "PM" : "AM");

  React.useImperativeHandle(
    ref,
    () => ({
      minuteRef: minuteRef.current,
      hourRef: hourRef.current,
      secondRef: secondRef.current,
    }),
    [minuteRef, hourRef, secondRef],
  );
  return (
    <div className="flex items-center justify-center gap-2">
      <label className="cursor-pointer" htmlFor="datetime-picker-hour-input">
        <Clock className="mr-2 h-4 w-4" />
      </label>
      <TimePickerInput
        date={date}
        id="datetime-picker-hour-input"
        onDateChange={onChange}
        onRightFocus={() => minuteRef?.current?.focus()}
        period={period}
        picker={hourCycle === 24 ? "hours" : "12hours"}
        ref={hourRef}
      />
      {(granularity === "minute" || granularity === "second") && (
        <>
          :
          <TimePickerInput
            date={date}
            onDateChange={onChange}
            onLeftFocus={() => hourRef?.current?.focus()}
            onRightFocus={() => secondRef?.current?.focus()}
            picker="minutes"
            ref={minuteRef}
          />
        </>
      )}
      {granularity === "second" && (
        <>
          :
          <TimePickerInput
            date={date}
            onDateChange={onChange}
            onLeftFocus={() => minuteRef?.current?.focus()}
            onRightFocus={() => periodRef?.current?.focus()}
            picker="seconds"
            ref={secondRef}
          />
        </>
      )}
      {hourCycle === 12 && (
        <div className="grid gap-1 text-center">
          <TimePeriodSelect
            date={date}
            onDateChange={(date) => {
              onChange?.(date);
              if (date && date?.getHours() >= 12) {
                setPeriod("PM");
              } else {
                setPeriod("AM");
              }
            }}
            onLeftFocus={() => secondRef?.current?.focus()}
            period={period}
            ref={periodRef}
            setPeriod={setPeriod}
          />
        </div>
      )}
    </div>
  );
};

TimePicker.displayName = "TimePicker";

export type { Granularity, TimePickerRef, TimePickerInputProps };
