let current = 0;

/**
 * Generate a unique ID
 * @param {string} prefix
 */
export default function uniqueId(prefix = "unique-") {
    return `${prefix.toString(16)}${current++}`
}