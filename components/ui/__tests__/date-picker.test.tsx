import * as React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { addDays } from "date-fns";

import { DatePicker } from "../DatePicker";
import { DateRangePicker } from "../DateRangePicker";
import type { DatePickerProps } from "../DatePicker";
import type { DateRangePickerProps } from "../DateRangePicker";

const january = (day: number) => new Date(2024, 0, day);

type ControlledDatePickerProps = Omit<DatePickerProps, "value" | "onChange"> & {
  initialValue?: Date;
  onChange?: (date: Date | undefined) => void;
};

const ControlledDatePicker = ({
  initialValue,
  onChange,
  ...props
}: ControlledDatePickerProps) => {
  const [value, setValue] = React.useState<Date | undefined>(initialValue);

  return (
    <DatePicker
      {...props}
      value={value}
      onChange={(next) => {
        setValue(next);
        onChange?.(next);
      }}
    />
  );
};

type ControlledDateRangePickerProps = Omit<
  DateRangePickerProps,
  "value" | "onChange"
> & {
  initialValue?: DateRangePickerProps["value"];
  onChange?: DateRangePickerProps["onChange"];
};

const ControlledDateRangePicker = ({
  initialValue,
  onChange,
  ...props
}: ControlledDateRangePickerProps) => {
  const [value, setValue] = React.useState(initialValue);

  return (
    <DateRangePicker
      {...props}
      value={value}
      onChange={(next) => {
        setValue(next);
        onChange?.(next);
      }}
    />
  );
};

describe("DatePicker", () => {
  it("calls onChange when a day is selected", async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(
      <ControlledDatePicker
        onChange={handleChange}
        triggerLabel="Choose date"
        calendarLabel="Calendar"
        minDate={january(1)}
        maxDate={january(31)}
      />
    );

    const trigger = screen.getByRole("button", { name: /choose date/i });
    await user.click(trigger);

    const day = await screen.findByRole("button", {
      name: /January 15th, 2024/,
    });
    await user.click(day);

    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange.mock.calls[0][0]).toEqual(january(15));

    const display = screen.getByRole("button", { name: /choose date/i });
    expect(display).toHaveTextContent("January 15th, 2024");
  });

  it("disables days outside the provided range", async () => {
    const user = userEvent.setup();

    render(
      <ControlledDatePicker
        triggerLabel="Open"
        calendarLabel="Calendar"
        minDate={january(5)}
        maxDate={january(20)}
      />
    );

    await user.click(screen.getByRole("button", { name: /open/i }));

    expect(
      screen.getByRole("button", { name: /January 4th, 2024/ })
    ).toBeDisabled();
    expect(
      screen.getByRole("button", { name: /January 21st, 2024/ })
    ).toBeDisabled();
  });

  it("supports keyboard navigation", async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(
      <ControlledDatePicker
        initialValue={january(10)}
        onChange={handleChange}
        triggerLabel="Keyboard"
        calendarLabel="Calendar"
        minDate={january(1)}
        maxDate={january(31)}
      />
    );

    await user.click(screen.getByRole("button", { name: /keyboard/i }));

    await user.keyboard("{Tab}{Tab}");

    const activeDay = await screen.findByRole("button", {
      name: /January 10th, 2024/,
    });
    expect(activeDay).toHaveFocus();

    await user.keyboard("{ArrowRight}{ArrowRight}{Enter}");

    expect(handleChange).toHaveBeenCalledWith(january(12));
  });
});

describe("DateRangePicker", () => {
  it("allows selecting a start and end date", async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(
      <ControlledDateRangePicker
        onChange={handleChange}
        triggerLabel="Choose range"
        calendarLabel="Range calendar"
        minDate={january(1)}
        maxDate={january(31)}
      />
    );

    await user.click(screen.getByRole("button", { name: /choose range/i }));

    const start = await screen.findByRole("button", {
      name: /January 5th, 2024/,
    });
    await user.click(start);

    const end = await screen.findByRole("button", {
      name: /January 10th, 2024/,
    });
    await user.click(end);

    expect(handleChange).toHaveBeenCalledWith({
      from: january(5),
      to: january(10),
    });

    expect(
      screen.getByRole("button", { name: /choose range/i })
    ).toHaveTextContent("January 5th, 2024 – January 10th, 2024");
  });

  it("prevents selecting disabled dates", async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(
      <ControlledDateRangePicker
        onChange={handleChange}
        triggerLabel="Range"
        calendarLabel="Calendar"
        minDate={january(3)}
        maxDate={january(12)}
        disabled={{ dayOfWeek: [0, 6] }}
      />
    );

    await user.click(screen.getByRole("button", { name: /range/i }));

    const disabledDay = screen.getByRole("button", { name: /January 6th, 2024/ });
    expect(disabledDay).toBeDisabled();

    const start = screen.getByRole("button", { name: /January 3rd, 2024/ });
    await user.click(start);

    const tentativeEnd = screen.getByRole("button", { name: /January 7th, 2024/ });
    await user.click(tentativeEnd);

    expect(handleChange).toHaveBeenLastCalledWith({
      from: january(3),
      to: january(3),
    });

    const validEnd = screen.getByRole("button", { name: /January 9th, 2024/ });
    await user.click(validEnd);

    expect(handleChange).toHaveBeenLastCalledWith({
      from: january(3),
      to: january(9),
    });
  });

  it("updates display when only the start date is selected", async () => {
    render(
      <ControlledDateRangePicker
        initialValue={{ from: january(4) }}
        triggerLabel="Display"
        calendarLabel="Calendar"
        minDate={january(1)}
        maxDate={addDays(january(1), 30)}
      />
    );

    const trigger = screen.getByRole("button", { name: /display/i });
    expect(trigger).toHaveTextContent("January 4th, 2024 – …");
  });
});
