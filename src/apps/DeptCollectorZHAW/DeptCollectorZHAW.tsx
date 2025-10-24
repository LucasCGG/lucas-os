import React, { useState } from "react";
import dayjs from "dayjs";
import {AppButton, AppDropdown} from "../../components/"
import CalendarBackgroundImage from "../../assets/CalendarBackgroundImage.png";

const TEST_CALENDAR = {
  calendar: {
    "2025-10-16": {
      "08:00": { subject: "Math", duration: 45 },
      "09:00": { subject: "English", duration: 45 },
      "10:00": { subject: "History", duration: 45 }
    },
    "2025-10-17": {
      "08:00": { subject: "Biology", duration: 45 },
      "09:00": { subject: "Chemistry", duration: 45 },
      "11:00": { subject: "Physics", duration: 45 }
    },
    "2025-10-18": {
      "08:00": { subject: "Art", duration: 45 },
      "09:00": { subject: "Music", duration: 45 }
    },
    "2025-10-19": {
      "10:00": { subject: "Computer Science", duration: 90 },
      "13:00": { subject: "Mathematical Modeling", duration: 60 }
    },
    "2025-10-20": {
      "09:00": { subject: "Economics", duration: 45 },
      "11:00": { subject: "Statistics", duration: 45 },
      "14:00": { subject: "Finance", duration: 45 }
    },
    "2025-10-21": {
      "08:00": { subject: "Design Thinking", duration: 45 },
      "10:00": { subject: "UI/UX", duration: 45 }
    },
    "2025-10-22": {
      "09:00": { subject: "Machine Learning", duration: 90 },
      "13:00": { subject: "Deep Learning", duration: 60 }
    }
  }
};

export const DeptCollectorZHAW = () => {
  const [viewMode, setViewMode] = useState("week");
  const [currentDate, setCurrentDate] = useState(dayjs());

  const getVisibleDates = () => {
    if (viewMode === "day") return [currentDate];
    if (viewMode === "week") {
      const startOfWeek = currentDate.startOf("week");
      return Array.from({ length: 7 }, (_, i) => startOfWeek.add(i, "day"));
    }
  };

  const getStep = (mode) => {
    switch(mode){
      case "day": return 1;
      case "week": return 7;
      default: return 1;
    }
  }

  const changeDate = (step) => {
    const unit = viewMode === "month" ? "month" : "day";
    setCurrentDate(currentDate.add(step, unit));
  };

  const renderTimeColumn = () => (
    <div id="time-col" className="border-r-2 px-2 text-xs">
      <div className="h-12 flex justify-center items-center font-semibold">Time</div>
      {Array.from({ length: 24 }, (_, j) => {
        const hour = j.toString().padStart(2, "0") + ":00";
        return (
          <div key={j} className="border-b py-1 h-12 flex items-center justify-center h-20">
            {hour}
          </div>
        );
      })}
    </div>
  );

const renderCalendarCells = () => {
  const visibleDates = getVisibleDates();
  const minuteHeight = 1;

  return visibleDates.map((date, i) => {
    const dateKey = date.format("YYYY-MM-DD");
    const dayData = TEST_CALENDAR.calendar[dateKey] || {};

    const entries = Object.entries(dayData).map(([startTime, entry]) => {
      const [hour, minute] = startTime.split(":").map(Number);
      const top = (hour * 60 + minute) * minuteHeight;
      const height = entry.duration * minuteHeight;

      return (
        <div
          key={startTime}
          className="absolute left-1 right-1 bg-indigo-200 rounded p-1 text-center text-[10px] shadow-md"
          style={{
            top: `${top}px`,
            height: `${height}px`,
          }}
        >
          <div className="font-semibold">{entry.subject}</div>
          <div className="text-gray-600">
            {startTime} ({entry.duration}m)
          </div>
        </div>
      );
    });

    return (
      <div key={i} className="border-r-2 relative text-xs overflow-hidden">
        <div className="h-12 text-center font-semibold sticky top-0 bg-white/70 backdrop-blur">
          {date.format("ddd, MMM D")}
        </div>

        <div className="relative" style={{ height: `${24 * 60 * minuteHeight}px` }}>
          {Array.from({ length: 24 }, (_, j) => (
            <div
              key={j}
              className="border-b border-gray-300 text-[10px] text-gray-500 flex items-start justify-center"
              style={{ height: `${60 * minuteHeight}px` }}
            />
          ))}
          {entries}
        </div>
      </div>
    );
  });
};

  return (
    <div
        style={{
        backgroundImage: `url(${CalendarBackgroundImage})`,
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
    <div className="flex flex-col h-screen p-4 overflow-hidden bg-black/40">  
      <div className="flex justify-between items-center mb-4 z-10">
        <h1 className="text-2xl font-bold">Dept Collector For Missed Lectures in ZHAW</h1>

        <div className="flex items-center gap-2">
          <AppButton 
              onClick={() => changeDate(-getStep(viewMode))}
              text="Prev"
              //TODO: Maybe add an Arrow or chevron icon
          />

          <input
            type="date"
            value={currentDate.format("YYYY-MM-DD")}
            onChange={(e) => setCurrentDate(dayjs(e.target.value))}
            className="border rounded px-2 py-1"
          />

          <AppButton 
              onClick={() => changeDate(getStep(viewMode))}
              text="Next"
              //TODO: Maybe add an Arrow or chevron icon
          />
          <AppDropdown
            value={viewMode}
            onChange={setViewMode}
            options={[
              {label:"Day", value:"day"},
              {label:"Week", value:"week"}
            ]}
          />
        </div>
      </div>

      <div
        className="flex-1 grid overflow-auto z-10"
        style={{
          gridTemplateColumns: `auto repeat(${getVisibleDates().length}, 1fr)`
        }}
      >
          {renderTimeColumn()}
          {renderCalendarCells()}
        </div>
      </div>
    </div>
  )
};


