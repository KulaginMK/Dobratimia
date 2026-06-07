import { useCallback, useEffect, useRef, useState } from 'react'

type SpeechCtor = typeof window.SpeechRecognition

function getRecognitionCtor(): SpeechCtor | null {
  const w = window as Window & {
    SpeechRecognition?: SpeechCtor
    webkitSpeechRecognition?: SpeechCtor
  }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}

export function useSpeechRecognition(onTranscript: (text: string, isFinal: boolean) => void) {
  const [listening, setListening] = useState(false)
  const [supported, setSupported] = useState(true)
  const recRef = useRef<InstanceType<SpeechCtor> | null>(null)
  const wantListen = useRef(false)

  useEffect(() => {
    const Ctor = getRecognitionCtor()
    if (!Ctor) {
      setSupported(false)
      return
    }

    const rec = new Ctor()
    rec.lang = 'ru-RU'
    rec.continuous = true
    rec.interimResults = true

    rec.onresult = (event: SpeechRecognitionEvent) => {
      let interim = ''
      let final = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript
        if (event.results[i].isFinal) final += t
        else interim += t
      }
      if (final) onTranscript(final, true)
      else if (interim) onTranscript(interim, false)
    }

    rec.onerror = () => setListening(false)
    rec.onend = () => {
      if (wantListen.current) {
        try {
          rec.start()
        } catch {
          /* already started */
        }
      } else {
        setListening(false)
      }
    }

    recRef.current = rec
    return () => {
      wantListen.current = false
      rec.stop()
    }
  }, [onTranscript])

  const start = useCallback(() => {
    if (!recRef.current) return false
    wantListen.current = true
    try {
      recRef.current.start()
      setListening(true)
      return true
    } catch {
      setListening(true)
      return true
    }
  }, [])

  const stop = useCallback(() => {
    wantListen.current = false
    recRef.current?.stop()
    setListening(false)
  }, [])

  return { listening, supported, start, stop }
}
