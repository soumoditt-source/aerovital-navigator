/**
 * AEROVITAL v5.0 — Client-Side Rate Limiter
 * FullStack Shinobi · Soumoditya Das & Team
 *
 * Guards ALL Gemini API calls from per-session abuse.
 * Max 10 requests per 60 seconds (sliding window per call type).
 * Competition security requirement: prevents API key exhaustion during demo.
 */

interface RateLimitEntry {
    timestamps: number[]
    maxPerMinute: number
}

const limiters: Record<string, RateLimitEntry> = {}

/**
 * Checks and records an API call attempt.
 * @returns `{ allowed: boolean, retryAfterSec: number }`
 */
export function checkRateLimit(
    key: string,
    maxPerMinute = 10
): { allowed: boolean; retryAfterSec: number } {
    const now = Date.now()
    const windowMs = 60_000

    if (!limiters[key]) {
        limiters[key] = { timestamps: [], maxPerMinute }
    }

    const entry = limiters[key]
    // Evict timestamps older than 60 s
    entry.timestamps = entry.timestamps.filter((t) => now - t < windowMs)

    if (entry.timestamps.length >= maxPerMinute) {
        const oldest = entry.timestamps[0]
        const retryAfterSec = Math.ceil((windowMs - (now - oldest)) / 1000)
        return { allowed: false, retryAfterSec }
    }

    entry.timestamps.push(now)
    return { allowed: true, retryAfterSec: 0 }
}

/**
 * Sanitizes text before sending to any AI model.
 * Removes potential prompt-injection payloads.
 */
export function sanitizeAiInput(text: string): string {
    return text
        .slice(0, 800)                              // Hard cap at 800 chars
        .replaceAll(/[<>{}]/g, '')                  // Strip HTML/JSON injection
        .replaceAll(/ignore previous instructions?/gi, '') // Prompt injection guard
        .replaceAll(/system prompt/gi, '')
        .trim()
}
