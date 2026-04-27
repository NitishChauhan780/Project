/**
 * Standardizes time formatting across the MindBridge platform.
 */

/**
 * Converts a 24-hour time string (HH:mm) to 12-hour format with AM/PM (h:mm A)
 * @param {string} time24 - Time in "HH:mm" format (e.g., "14:00")
 * @returns {string} - Formatted time (e.g., "2:00 PM")
 */
export const formatTimeTo12h = (time24) => {
  if (!time24) return "";
  const [hour, minute] = time24.split(":");
  let h = parseInt(hour, 10);
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12;
  h = h ? h : 12; // the hour '0' should be '12'
  return `${h}:${minute} ${ampm}`;
};

/**
 * Normalizes a time string to HH:mm format.
 * @param {string} time - Time string in various formats
 * @returns {string} - Standardized HH:mm format
 */
export const normalizeTime = (time) => {
  if (!time) return "";
  
  // If already in HH:mm or H:mm format
  if (time.includes(":") && !time.includes(" ")) {
    const [h, m] = time.split(":");
    return `${h.padStart(2, "0")}:${m}`;
  }
  
  // If in 12-hour format (e.g., "9:00 AM")
  const match = time.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (match) {
    let [_, h, m, ampm] = match;
    h = parseInt(h, 10);
    if (ampm.toUpperCase() === "PM" && h < 12) h += 12;
    if (ampm.toUpperCase() === "AM" && h === 12) h = 0;
    return `${h.toString().padStart(2, "0")}:${m}`;
  }
  
  return time;
};
