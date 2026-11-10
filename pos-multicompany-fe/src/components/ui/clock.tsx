import { useEffect, useState } from "react";
import { Clock3 } from "lucide-react";

export default function ClockElement() {
  const [currentTime, setCurrentTime] = useState(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formattedTime = new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Jakarta",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(currentTime);

  return (
    <div className="flex shrink-0 items-center gap-2">
      <Clock3 className="size-4 text-blue-600 dark:text-blue-400" />

      <span className="font-mono text-lg font-semibold tracking-wider tabular-nums text-slate-800 dark:text-slate-100">
        {formattedTime}
      </span>

      <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
        WIB
      </span>
    </div>
  );
}
