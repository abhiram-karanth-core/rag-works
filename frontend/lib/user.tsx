export function getUserId(): string {
  if (typeof window === "undefined") return ""

  let id = localStorage.getItem("user_id")
  if (!id) {
    // Fallback for environments where crypto.randomUUID is not available
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      id = crypto.randomUUID();
    } else {
      // Simple UUID v4 polyfill
      id = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    }
    localStorage.setItem("user_id", id)
  }
  return id
}
