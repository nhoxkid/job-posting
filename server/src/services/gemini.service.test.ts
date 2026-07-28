import { describe, expect, it, vi } from 'vitest'
import {
  GeminiService,
  isCurrentRoleSummary,
  isLegacyRoleFallback,
} from './gemini.service'

function geminiResponse(payload: unknown): Response {
  return new Response(
    JSON.stringify({
      candidates: [{ content: { parts: [{ text: JSON.stringify(payload) }] } }],
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    },
  )
}

describe('GeminiService', () => {
  it('creates a detailed structured summary with compensation and dates', async () => {
    const fetchMock = vi.fn(async () =>
      geminiResponse({
        roleOverview:
          'Build production machine-learning systems with the data platform team. The intern will ship models and improve the services that support them.',
        responsibilities: [
          'Develop and evaluate machine-learning models.',
          'Collaborate with engineers to deploy reliable services.',
        ],
        qualifications: [
          'Currently pursuing a computer science degree.',
          'Experience with Python and SQL.',
        ],
        compensation: '$35-$42 CAD per hour.',
        datesAndDuration: 'The internship runs from May 4 to August 28, 2027.',
        companySummary:
          'Example Labs builds water-quality analytics software for municipalities and industrial customers. Its engineering teams develop data products that help operators monitor infrastructure and make informed decisions.',
      }),
    )
    const service = new GeminiService({
      apiKey: 'test-key',
      model: 'gemini-test',
      fetchImpl: fetchMock as unknown as typeof fetch,
    })
    const description =
      'This is a detailed internship posting. '.repeat(20) +
      'Pay is $35-$42 CAD per hour. The term runs from May 4 to August 28, 2027.'

    const result = await service.generateSummaries(
      'Example Labs',
      'Machine Learning Intern',
      description,
    )

    expect(result.roleSummary).toContain('Role overview')
    expect(result.roleSummary).toContain('Key responsibilities')
    expect(result.roleSummary).toContain('Qualifications')
    expect(result.roleSummary).toContain('Compensation\n$35-$42 CAD per hour.')
    expect(result.roleSummary).toContain(
      'Dates and duration\nThe internship runs from May 4 to August 28, 2027.',
    )
    expect(result.companySummary).toContain('water-quality analytics software')
    expect(isCurrentRoleSummary(result.roleSummary)).toBe(true)

    expect(fetchMock).toHaveBeenCalledOnce()
    const [url, options] = fetchMock.mock.calls[0]
    expect(String(url)).toContain('/models/gemini-test:generateContent')
    expect(options?.headers).toMatchObject({ 'x-goog-api-key': 'test-key' })

    const requestBody = JSON.parse(String(options?.body)) as {
      contents: Array<{ parts: Array<{ text: string }> }>
      generationConfig: {
        responseFormat: { text: { mimeType: string; schema: unknown } }
        temperature?: number
      }
    }
    expect(requestBody.contents[0].parts[0].text).toContain('$35-$42 CAD per hour')
    expect(requestBody.generationConfig.responseFormat.text.mimeType).toBe('APPLICATION_JSON')
    expect(requestBody.generationConfig.responseFormat.text.schema).toBeDefined()
    expect(requestBody.generationConfig.temperature).toBeUndefined()
  })

  it('returns null summaries instead of copying the description when no key exists', async () => {
    const fetchMock = vi.fn()
    const service = new GeminiService({
      apiKey: '',
      fetchImpl: fetchMock as unknown as typeof fetch,
    })
    const description = 'A full job description that must never become an AI fallback. '.repeat(5)

    await expect(
      service.generateSummaries('Example Labs', 'Software Intern', description),
    ).resolves.toEqual({
      roleSummary: null,
      companySummary: null,
    })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('returns null summaries for an invalid structured response', async () => {
    const fetchMock = vi.fn(async () => geminiResponse({ roleOverview: '' }))
    const service = new GeminiService({
      apiKey: 'test-key',
      fetchImpl: fetchMock as unknown as typeof fetch,
    })

    await expect(
      service.generateSummaries(
        'Example Labs',
        'Software Intern',
        'A detailed job description with enough source content for summarization. '.repeat(3),
      ),
    ).resolves.toEqual({
      roleSummary: null,
      companySummary: null,
    })
  })

  it('recognizes the old copied-description fallback', () => {
    const description = 'Opening source text. '.repeat(30)
    const oldFallback = `${description.slice(0, 300)}...`

    expect(
      isLegacyRoleFallback(oldFallback, description, 'Example Labs', 'Software Intern'),
    ).toBe(true)
  })
})
