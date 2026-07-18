export const formatRetrievedEntry = (entry: any) => {
  const formatCode = (code?: any) =>
    typeof code === "string" ? code.toUpperCase() : "";

  const formatVenue = (venue?: any) =>
    typeof venue === "string" && venue.length > 0
      ? venue.charAt(0).toUpperCase() + venue.slice(1)
      : "";

  const formatName = (name?: any) =>
    typeof name === "string" && name.length > 0
      ? name.charAt(0).toUpperCase() + name.slice(1)
      : "";

  const formatTitle = (title?: any) =>
    typeof title === "string" && title.length > 0
      ? title.charAt(0).toUpperCase() + title.slice(1)
      : "";

  const formatRoom = (room?: any) =>
    typeof room === "string" && room.length > 0
      ? room.charAt(0).toUpperCase() + room.slice(1)
      : "";

  const formatSubject = (subject?: any) => {
    if (!subject) return { name: "", code: "", room: "" };

    if (typeof subject === "string") {
      return { name: formatName(subject), code: "", room: "" };
    }

    if (typeof subject === "object") {
      return {
        name: formatName(subject.name),
        code: formatCode(subject.code),
        room: formatRoom(subject.room) 
      };
    }

    return { name: "", code: "", room: "" };
  };

  return {
    ...entry,
    code: formatCode(entry.code),
    venue: formatVenue(entry.venue),
    name: formatName(entry.name),
    title: formatTitle(entry.title),
    subject: formatSubject(entry.subject)
  };
};
export const capitalize = (value: string = "") =>
  value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();