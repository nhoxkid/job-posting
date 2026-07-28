/**
 * Gemini AI service: on-demand summary generation using Google's Gemini REST API
 * (dependency-free via standard Node fetch).
 */

import { env } from '../config/env'

export interface JobSummaries {
  roleSummary: string
  companySummary: string
}

export class GeminiService {
  /**
   * Generates AI role and company summaries from raw job description text.
   * If GEMINI_API_KEY is not configured or an error occurs, returns clean fallback summaries.
   */
  async generateSummaries(
    employerName: string,
    position: string,
    descriptionRaw?: string | null,
  ): Promise<JobSummaries> {
    if (!env.geminiApiKey) {
      return {
        roleSummary: `[AI Summary Unavailable - Please set GEMINI_API_KEY in server/.env to enable automated Gemini 2.0 Flash summaries] ${
          descriptionRaw
            ? 'Preview: ' + descriptionRaw.slice(0, 300) + (descriptionRaw.length > 300 ? '...' : '')
            : `An exciting ${position} opportunity at ${employerName}.`
        }`,
        companySummary: `[Company Summary Unavailable - Please set GEMINI_API_KEY in server/.env] ${employerName} is hiring for engineering and technical roles.`,
      }
    }

    const fallback: JobSummaries = {
      roleSummary: descriptionRaw
        ? descriptionRaw.slice(0, 300) + (descriptionRaw.length > 300 ? '...' : '')
        : `An exciting ${position} opportunity at ${employerName}. Check the application link for full technical requirements and responsibilities.`,
      companySummary: `${employerName} is hiring for engineering and technical roles. Visit their careers page for more details about company culture and mission.`,
    }

    if (!descriptionRaw || descriptionRaw.trim().length < 50) {
      return fallback
    }

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${env.geminiApiKey}`
      const prompt = `You are an expert technical recruiting AI. Analyze the following job posting text for the "${position}" role at "${employerName}".
Provide your response as a valid JSON object with exactly two string keys:
1. "roleSummary": A clear, compelling 2-3 sentence summary of what the candidate will work on, tech stack mentioned, and key responsibilities.
2. "companySummary": A concise 1-2 sentence overview of what ${employerName} does, its industry, and engineering culture if mentioned.
Return ONLY valid JSON without markdown formatting or code blocks.

Job Posting Text:
${descriptionRaw.slice(0, 4000)}`

      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 10000) // 10s timeout

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.3,
            responseMimeType: 'application/json',
          },
        }),
        signal: controller.signal,
      })
      clearTimeout(timeout)

      if (!response.ok) {
        return fallback
      }

      const data = (await response.json()) as {
        candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>
      }
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text
      if (!rawText) return fallback

      const parsed = JSON.parse(rawText) as Record<string, string>
      return {
        roleSummary: parsed.roleSummary?.trim() || fallback.roleSummary,
        companySummary: parsed.companySummary?.trim() || fallback.companySummary,
      }
    } catch {
      return fallback
    }
  }
}

export const geminiService = new GeminiService()
