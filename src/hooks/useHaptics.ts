/**
 * useHaptics - Vibration API wrapper for mobile haptic feedback
 * Gracefully no-ops on unsupported browsers/devices
 */

const isSupported = typeof navigator !== 'undefined' && 'vibrate' in navigator;

function vibrate(pattern: number | number[]) {
    if (isSupported) {
        navigator.vibrate(pattern);
    }
}

export function useHaptics() {
    /** Short tap — for card taps, toggles */
    const triggerLight = () => vibrate(10);

    /** Medium pulse — for confirmations, selections */
    const triggerMedium = () => vibrate(20);

    /** Strong pulse — for destructive actions (delete) */
    const triggerHeavy = () => vibrate([30, 10, 30]);

    /** Success pattern — for completed actions (share, save) */
    const triggerSuccess = () => vibrate([10, 50, 10]);

    /** Error pattern — for failed actions */
    const triggerError = () => vibrate([50, 30, 50, 30, 50]);

    return { triggerLight, triggerMedium, triggerHeavy, triggerSuccess, triggerError };
}
