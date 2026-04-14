export const sanitizeTitleText = (value: string) => {
    const stripped = Array.from(value)
        .filter(char => {
            const code = char.charCodeAt(0)
            return code > 31 && code !== 127
        })
        .join('')

    return stripped.trim().slice(0, 255)
}
