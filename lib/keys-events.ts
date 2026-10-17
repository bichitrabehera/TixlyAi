export const KEYS_CHANGED_EVENT = "tixly:keys-changed";

export function notifyKeysChanged() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(KEYS_CHANGED_EVENT));
  }
}
