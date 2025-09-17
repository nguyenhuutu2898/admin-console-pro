import React from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import { DatePicker } from "../DatePicker";
import { DateRangePicker } from "../DateRangePicker";
import { formatPartsToLocalISOString } from "../../../lib/datetime";

function getLocalISO(date: string, hour: string, minute: string) {
  const formatted = formatPartsToLocalISOString(date, hour, minute);
  if (!formatted) {
    throw new Error("Unable to format local ISO");
  }
  return formatted;
}

describe("DatePicker", () => {
  it("returns date-only value when showTime is false", () => {
    const handleChange = vi.fn();
    render(<DatePicker onChange={handleChange} />);

    const dateInput = screen.getByLabelText("Date");
    fireEvent.change(dateInput, { target: { value: "2024-03-19" } });

    expect(handleChange).toHaveBeenCalledWith("2024-03-19");
  });

  it("returns ISO string with timezone when time is selected", () => {
    const handleChange = vi.fn();
    render(<DatePicker showTime onChange={handleChange} />);

    const dateInput = screen.getByLabelText("Date");
    const hourSelect = screen.getByLabelText("Hours");
    const minuteSelect = screen.getByLabelText("Minutes");

    fireEvent.change(dateInput, { target: { value: "2024-03-19" } });
    fireEvent.change(hourSelect, { target: { value: "14" } });
    fireEvent.change(minuteSelect, { target: { value: "30" } });

    expect(handleChange).toHaveBeenLastCalledWith(getLocalISO("2024-03-19", "14", "30"));
  });
});

describe("DateRangePicker", () => {
  it("emits ISO strings for both start and end when showTime is enabled", () => {
    const handleChange = vi.fn();
    render(<DateRangePicker showTime onChange={handleChange} />);

    const startDateInput = screen.getByLabelText("Start date");
    const startHourSelect = screen.getByLabelText("Start hour");
    const startMinuteSelect = screen.getByLabelText("Start minute");
    const endDateInput = screen.getByLabelText("End date");
    const endHourSelect = screen.getByLabelText("End hour");
    const endMinuteSelect = screen.getByLabelText("End minute");

    fireEvent.change(startDateInput, { target: { value: "2024-04-10" } });
    fireEvent.change(startHourSelect, { target: { value: "09" } });
    fireEvent.change(startMinuteSelect, { target: { value: "15" } });

    expect(handleChange).toHaveBeenLastCalledWith({
      start: getLocalISO("2024-04-10", "09", "15"),
      end: null,
    });

    fireEvent.change(endDateInput, { target: { value: "2024-04-12" } });
    fireEvent.change(endHourSelect, { target: { value: "18" } });
    fireEvent.change(endMinuteSelect, { target: { value: "45" } });

    expect(handleChange).toHaveBeenLastCalledWith({
      start: getLocalISO("2024-04-10", "09", "15"),
      end: getLocalISO("2024-04-12", "18", "45"),
    });
  });
});
