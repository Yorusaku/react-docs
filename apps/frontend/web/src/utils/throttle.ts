/**
 * Throttle function - limits execution frequency
 * @param func Function to throttle
 * @param wait Wait time in milliseconds
 * @returns Throttled function
 */
export const throttle = <T extends (...args: any[]) => any>(func: T, wait = 300): ((...args: Parameters<T>) => void) => {
    let timeout: NodeJS.Timeout | null = null
    let lastRun = 0

    return (...args: Parameters<T>) => {
        const now = Date.now()

        if (!lastRun || now - lastRun >= wait) {
            func(...args)
            lastRun = now
        } else {
            if (timeout) {
                clearTimeout(timeout)
            }
            timeout = setTimeout(
                () => {
                    func(...args)
                    lastRun = Date.now()
                },
                wait - (now - lastRun)
            )
        }
    }
}
