/**
 * Enrichment service: lightweight, dependency-free HTML scraper that fetches
 * application links (e.g. Ashby, Greenhouse, Lever) and extracts clean job description text.
 */

export class EnrichmentService {
  /**
   * Fetch the application link and extract plain text job description.
   */
  async fetchJobDescription(url: string): Promise<string | null> {
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 8000) // 8s timeout

      const response = await fetch(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
        signal: controller.signal,
      })
      clearTimeout(timeout)

      if (!response.ok) {
        return null
      }

      const html = await response.text()
      return this.extractTextFromHtml(html)
    } catch {
      // Catch network timeouts, DNS errors, or CORS/SSL failures gracefully
      return null
    }
  }

  /**
   * Extract clean text from HTML without requiring heavy DOM parsers like cheerio.
   */
  private extractTextFromHtml(html: string): string | null {
    // 1. Try JSON-LD structured data first (common on Ashby, Workday, Greenhouse, SmartRecruiters)
    const jsonLdRegex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
    let match: RegExpExecArray | null
    while ((match = jsonLdRegex.exec(html)) !== null) {
      try {
        const data = JSON.parse(match[1])
        const item = Array.isArray(data) ? data[0] : data
        if (item && typeof item.description === 'string' && item.description.trim().length > 50) {
          return this.stripHtmlTags(item.description)
        }
      } catch {
        // Continue if json parse fails
      }
    }

    // 2. Remove script, style, svg, nav, footer, header tags
    let clean = html
      .replace(/<(script|style|svg|nav|footer|header|noscript)[^>]*>[\s\S]*?<\/\1>/gi, ' ')
      .replace(/<!--[\s\S]*?-->/g, ' ')

    // 3. Try to isolate main job content container if present
    const containerRegex = /<div[^>]*(id|class)=["'][^"']*(job-description|description|posting-content|content|section-wrapper)[^"']*["'][^>]*>([\s\S]*?)<\/div>/i
    const containerMatch = containerRegex.exec(clean)
    if (containerMatch && containerMatch[3].length > 200) {
      clean = containerMatch[3]
    } else {
      // Fallback to body content
      const bodyMatch = /<body[^>]*>([\s\S]*?)<\/body>/i.exec(clean)
      if (bodyMatch) clean = bodyMatch[1]
    }

    const text = this.stripHtmlTags(clean)
    return text.length > 50 ? text : null
  }

  private stripHtmlTags(htmlOrText: string): string {
    return htmlOrText
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>|<\/div>|<\/li>|<\/h[1-6]>/gi, '\n')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/gi, ' ')
      .replace(/&amp;/gi, '&')
      .replace(/&lt;/gi, '<')
      .replace(/&gt;/gi, '>')
      .replace(/&quot;/gi, '"')
      .replace(/&#39;/gi, "'")
      .replace(/\n\s*\n/g, '\n\n')
      .replace(/[ \t]+/g, ' ')
      .trim()
  }
}

export const enrichmentService = new EnrichmentService()
