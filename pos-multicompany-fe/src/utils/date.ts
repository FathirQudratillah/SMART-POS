export function formatDate(value?: string) {
  if (!value) return "-";

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Asia/Jakarta"
  }).format(new Date(value));
}

export function toJakartaISOString(date: Date): string {
  const jakartaDate = new Date(
    date.toLocaleString("en-US", {
      timeZone: "Asia/Jakarta",
    }),
  );

  const year = jakartaDate.getFullYear();
  const month = String(jakartaDate.getMonth() + 1).padStart(2, "0");
  const day = String(jakartaDate.getDate()).padStart(2, "0");
  const hours = String(jakartaDate.getHours()).padStart(2, "0");
  const minutes = String(jakartaDate.getMinutes()).padStart(2, "0");
  const seconds = String(jakartaDate.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}+07:00`;
}