/**
 * Replace placeholder variables in a template string with values from a lead.
 * Valid placeholders are `{{name}}`, `{{company}}`, `{{email}}` and `{{phone}}`.
 * Missing values are replaced with an empty string.
 */
export function renderTemplate(html: string, lead: Record<string, any>) {
  return html
    .replace(/{{\s*name\s*}}/g, lead.name ?? '')
    .replace(/{{\s*company\s*}}/g, lead.company ?? '')
    .replace(/{{\s*email\s*}}/g, lead.email ?? '')
    .replace(/{{\s*phone\s*}}/g, lead.phone ?? '')
}

/**
 * Remove duplicate recipients based on the `email` field. The input may contain
 * either lead objects or objects with `to_email`/`email`. Returns an array
 * preserving original order but without duplicates.
 */
export function dedupeRecipients<T extends { email?: string; to_email?: string }>(items: T[]): T[] {
  const seen = new Set<string>()
  const result: T[] = []
  for (const item of items) {
    const email = (item as any).email || (item as any).to_email
    if (!email) continue
    const key = email.toLowerCase()
    if (!seen.has(key)) {
      seen.add(key)
      result.push(item)
    }
  }
  return result
}