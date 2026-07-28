/**
 * Google Identity Services integration.
 *
 * Loads the GIS script once, then renders Google's own button into a container
 * ref. Using their rendered button (rather than a custom one) keeps the mark
 * and interaction compliant with Google's branding requirements, and hands us
 * the ID token via callback.
 *
 * The credential is passed straight to the server, which is the only party that
 * verifies it — nothing here treats the token as proof of anything.
 */

import { useEffect, useRef, useState } from 'react'
import { env } from '../../../lib/env'

const GIS_SRC = 'https://accounts.google.com/gsi/client'

interface CredentialResponse {
  credential?: string
}

interface GoogleIdentityApi {
  accounts: {
    id: {
      initialize: (config: {
        client_id: string
        callback: (res: CredentialResponse) => void
      }) => void
      renderButton: (parent: HTMLElement, options: Record<string, unknown>) => void
    }
  }
}

declare global {
  interface Window {
    google?: GoogleIdentityApi
  }
}

let scriptPromise: Promise<void> | null = null

/** Load the GIS script once per page, reusing the promise on later calls. */
function loadGisScript(): Promise<void> {
  if (scriptPromise) return scriptPromise

  scriptPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${GIS_SRC}"]`)
    if (existing) {
      existing.addEventListener('load', () => resolve())
      existing.addEventListener('error', () => reject(new Error('Failed to load Google sign-in')))
      if (window.google) resolve()
      return
    }

    const script = document.createElement('script')
    script.src = GIS_SRC
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Google sign-in'))
    document.head.appendChild(script)
  })

  return scriptPromise
}

export interface UseGoogleSignInOptions {
  /** Whether the server has Google sign-in configured. */
  enabled: boolean
  /** Receives the Google ID token to exchange for a session. */
  onCredential: (idToken: string) => void
  /** Rendered button width in pixels; GIS requires an explicit value. */
  width?: number
}

/**
 * Returns a ref to attach to the container that should hold Google's button,
 * plus whether it is ready and any load failure.
 */
export function useGoogleSignIn({ enabled, onCredential, width = 340 }: UseGoogleSignInOptions) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Keep the latest callback without re-rendering the Google button, which
  // would otherwise tear down and rebuild it on every keystroke in the form.
  const callbackRef = useRef(onCredential)
  useEffect(() => {
    callbackRef.current = onCredential
  }, [onCredential])

  useEffect(() => {
    if (!enabled || !env.googleClientId) return

    let cancelled = false

    loadGisScript()
      .then(() => {
        if (cancelled || !containerRef.current || !window.google) return
        window.google.accounts.id.initialize({
          client_id: env.googleClientId,
          callback: (res) => {
            if (res.credential) callbackRef.current(res.credential)
          },
        })
        window.google.accounts.id.renderButton(containerRef.current, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text: 'continue_with',
          shape: 'rectangular',
          logo_alignment: 'center',
          width,
        })
        setReady(true)
      })
      .catch(() => {
        if (!cancelled) setError('Could not load Google sign-in.')
      })

    return () => {
      cancelled = true
    }
  }, [enabled, width])

  return { containerRef, ready, error }
}
