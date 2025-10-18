//TODO: Remove when backend is
const TEST_CALENDAR = {
  "calendar": {
    "Thursday": {
      "08:00": { "subject": "Math", "duration": 45 },
      "09:00": { "subject": "English", "duration": 45 },
      "10:00": { "subject": "History", "duration": 45 }
    },
    "Friday": {
      "08:00": { "subject": "Biology", "duration": 45 },
      "09:00": { "subject": "Chemistry", "duration": 45 }
    },
    "Saturday": {
      "08:00": { "subject": "Art", "duration": 45 }
    }
  }
}

export const DeptCollectorZHAW = () => {

  console.debug("TEST_CALENDAR", TEST_CALENDAR);

  const renderCalendar = () => {
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    return (
      <div id="calendar" className="flex flex-row">

        <div id={`time-col`} className="min-w-5 border-r-2 px-4">
          <h2 className="font-bold text-center mb-2"></h2>
          {Array.from({ length: 24 }, (_, j) => {
            const hour = j.toString().padStart(2, "0") + ":00";

            return (
              <div key={j} id={`hour-${j}`} className="border-b py-1 h-12 flex items-center justify-center">
                <div className="h-full w-full">{hour}</div>
              </div>
            );
          })}
        </div>

        {
          Array.from({ length: 7 }, (_, i) => {
            const currentDay = dayNames[i];
            const dayData = TEST_CALENDAR.calendar[currentDay] || {};

            return (
              <div key={i} id={`day-${i}`} className="min-w-5 border-r-2 px-4">
                <h2 className="font-bold text-center mb-2">{currentDay}</h2>
                {Array.from({ length: 24 }, (_, j) => {
                  const hour = j.toString().padStart(2, "0") + ":00";
                  const entry = dayData[hour];

                  return (
                    <div key={j} id={`hour-${j}`} className="border-b py-1 h-12 flex items-center justify-center">
                      {entry ? (
                        <div className="bg-indigo-200 p-2 rounded w-full text-center">
                          <h3 className="font-semibold text-sm">{entry.subject}</h3>
                          <p className="text-xs text-gray-600">{hour} ({entry.duration} mins)</p>
                        </div>
                      ) : (
                        <div className="h-full w-full"></div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })
        }
      </div >
    );
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">Weekly Calendar</h1>
      {renderCalendar()}
    </div>
  );
};

