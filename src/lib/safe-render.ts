/**
 * Safe render utility — prevents React error #310 ("Objects are not valid as a React child")
 * by ensuring any value rendered in JSX is a primitive (string/number/boolean/null/undefined).
 *
 * Usage: {safe(anyValue)} instead of {anyValue} in JSX
 */
export function safe(value: unknown): string {
  if (value === null || value === undefined) return ''
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)

  // Object/array leaked into JSX — log for debugging and stringify
  if (typeof value === 'object') {
    console.warn('[safe-render] Object passed to safe():', typeof value, Array.isArray(value) ? 'array' : 'object', JSON.stringify(value)?.slice(0, 300))
  }

  try {
    return JSON.stringify(value)
  } catch {
    return '[object]'
  }
}

/**
 * Extract readable text from a content value that may be a string, an array
 * of content blocks (OpenClaw gateway format), or a nested object.
 */
function flattenToString(value: unknown): string {
  if (value === null || value === undefined) return ''
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)

  // Array of content blocks: [{type:"text", text:"..."}, {type:"toolCall",...}, ...]
  if (Array.isArray(value)) {
    const textParts = value
      .filter((block: any) => block && typeof block === 'object' && (block.type === 'text' || (!block.type && typeof block.text === 'string')))
      .map((block: any) => typeof block.text === 'string' ? block.text : String(block.text ?? ''))
    if (textParts.length > 0) return textParts.join('')

    // Array of primitives — join them
    if (value.every((item: any) => item === null || item === undefined || typeof item !== 'object')) {
      return value.map(String).join(', ')
    }

    // Fallback: stringify the whole array
    try { return JSON.stringify(value) } catch { return '[array]' }
  }

  // Plain object with a text/content property
  if (typeof value === 'object') {
    const obj = value as any
    if (typeof obj.text === 'string') return obj.text
    if (typeof obj.content === 'string') return obj.content
    if (typeof obj.label === 'string') return obj.label
    if (typeof obj.name === 'string') return obj.name
    if (typeof obj.display === 'string') return obj.display
    if (typeof obj.expr === 'string') return obj.expr
    try { return JSON.stringify(value) } catch { return '[object]' }
  }

  return String(value)
}

/**
 * Check if an array contains only primitive values (no objects/arrays).
 */
function isSimpleArray(arr: unknown[]): boolean {
  return arr.every(item => item === null || item === undefined || typeof item !== 'object')
}

/**
 * STRUCTURAL_FIELDS — fields that must remain as objects/arrays because
 * components consume them structurally (iterate, access nested props, etc.)
 *
 * Everything else gets flattened to a string to prevent React #310.
 */
const STRUCTURAL_FIELDS = new Set([
  'attachments',   // Message.attachments — array of {type, mimeType, content}
  'requirements',  // Skill.requirements — {bins, env, config, os}
  'missing',       // Skill.missing — {bins, env, config, os}
  'install',       // Skill.install — array of {id, kind, label, bins}
])

/**
 * Deep sanitize an object — NUCLEAR version.
 *
 * Strategy: flatten ANY object/array value to a string UNLESS:
 * 1. It's at the top level (the array of messages/sessions/etc.)
 * 2. It's an element of that top-level array (individual message/session/etc.)
 * 3. Its key is in STRUCTURAL_FIELDS (components need the structure)
 * 4. It's a simple array of primitives (e.g., triggers: ["run", "test"])
 *
 * Everything else → flattenToString()
 */
export function deepSanitize<T>(obj: T): T {
  if (obj === null || obj === undefined) return obj
  if (typeof obj === 'string' || typeof obj === 'number' || typeof obj === 'boolean') return obj

  // Top-level array (e.g., array of messages) — recurse into each element
  if (Array.isArray(obj)) {
    return obj.map(item => deepSanitize(item)) as unknown as T
  }

  // Object — sanitize each field
  if (typeof obj === 'object') {
    const result: any = {}
    for (const [k, v] of Object.entries(obj as any)) {
      // Primitive values pass through unchanged
      if (v === null || v === undefined || typeof v !== 'object') {
        result[k] = v
        continue
      }

      // Array values
      if (Array.isArray(v)) {
        if (STRUCTURAL_FIELDS.has(k)) {
          // Known structural array — recurse into each element
          result[k] = v.map((item: any) => deepSanitize(item))
        } else if (isSimpleArray(v)) {
          // Array of primitives (strings, numbers) — safe to keep as array
          result[k] = v
        } else {
          // Array of complex objects in a NON-structural field — FLATTEN TO STRING
          // This catches content blocks, origin arrays, usage arrays, etc.
          result[k] = flattenToString(v)
        }
        continue
      }

      // Object values
      if (STRUCTURAL_FIELDS.has(k)) {
        // Known structural object — recurse to sanitize nested fields
        result[k] = deepSanitize(v)
      } else {
        // Unknown object field — FLATTEN TO STRING
        // This catches origin, usage, cost, deliveryContext, etc.
        result[k] = flattenToString(v)
      }
    }
    return result as T
  }

  return String(obj) as unknown as T
}
