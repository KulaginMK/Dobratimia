import { useCallback, useEffect, useRef, useState } from 'react'

type SpeechCtor = typeof window.SpeechRecognition

export type SpeechErrorCode =
  | 'not-supported'
  | 'not-allowed'
  | 'no-speech'
  | 'network'
  | 'aborted'
  | 'unknown'

function getRecognitionCtor(): SpeechCtor | null {
  const w = window as Window & {
    SpeechRecognition?: SpeechCtor
    webkitSpeechRecognition?: SpeechCtor
  }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}

function mapSpeechError(code: string): SpeechErrorCode {
  if (code === 'not-allowed' || code === 'service-not-allowed') return 'not-allowed'
  if (code === 'no-speech') return 'no-speech'
  if (code === 'network') return 'network'
  if (code === 'aborted') return 'aborted'
  return 'unknown'
}

export function speechErrorMessage(code: SpeechErrorCode | null): string | null {
  switch (code) {
    case 'not-supported':
      return 'Голосовой ввод недоступен. Используйте Chrome или Edge либо введите текст вручную.'
    case 'not-allowed':
      return 'Нет доступа к микрофону. Разрешите микрофон в настройках браузера.'
    case 'no-speech':
      return 'Речь не распознана. Попробуйте громче или ближе к микрофону.'
    case 'network':
      return 'Для распознавания речи нужен интернет. Или введите текст вручную.'
    case 'unknown':
      return 'Не удалось распознать речь. Попробуйте ещё раз или введите текст.'
    default:
      return null
  }
}

async function ensureMicPermission(): Promise<boolean> {
  if (!navigator.mediaDevices?.getUserMedia) return true
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    stream.getTracks().forEach((track) => track.stop())
    return true
  } catch {
    return false
  }
}

export function useSpeechRecognition(onTranscript: (text: string, isFinal: boolean) => void) {
  const [listening, setListening] = useState(false)
  const [supported, setSupported] = useState(true)
  const [error, setError] = useState<SpeechErrorCode | null>(null)
  const [voiceUsed, setVoiceUsed] = useState(false)
  const recRef = useRef<InstanceType<SpeechCtor> | null>(null)
  const wantListen = useRef(false)
  const onTranscriptRef = useRef(onTranscript)

  useEffect(() => {
    onTranscriptRef.current = onTranscript
  }, [onTranscript])

  useEffect(() => {
    const Ctor = getRecognitionCtor()
    if (!Ctor) {
      setSupported(false)
      setError('not-supported')
      return
    }

    const rec = new Ctor()
    rec.lang = 'ru-RU'
    rec.continuous = true
    rec.interimResults = true

    rec.onresult = (event: SpeechRecognitionEvent) => {
      setError(null)
      let interim = ''
      let final = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript
        if (event.results[i].isFinal) final += t
        else interim += t
      }
      if (final) {
        setVoiceUsed(true)
        onTranscriptRef.current(final, true)
      } else if (interim) {
        setVoiceUsed(true)
        onTranscriptRef.current(interim, false)
      }
    }

    rec.onerror = (event) => {
      const mapped = mapSpeechError((event as SpeechRecognitionErrorEvent).error)
      if (mapped !== 'aborted' && mapped !== 'no-speech') {
        setError(mapped)
      }
      if (mapped === 'not-allowed') {
        wantListen.current = false
        setListening(false)
      }
    }

    rec.onend = () => {
      if (wantListen.current) {
        try {
          rec.start()
        } catch {
          wantListen.current = false
          setListening(false)
        }
      } else {
        setListening(false)
      }
    }

    recRef.current = rec
    return () => {
      wantListen.current = false
      rec.onresult = null
      rec.onerror = null
      rec.onend = null
      rec.stop()
    }
  }, [])

  const start = useCallback(async () => {
    setError(null)
    if (!recRef.current) {
      setError('not-supported')
      return false
    }

    const permitted = await ensureMicPermission()
    if (!permitted) {
      setError('not-allowed')
      return false
    }

    wantListen.current = true
    setVoiceUsed(true)
    try {
      recRef.current.start()
      setListening(true)
      return true
    } catch {
      try {
        recRef.current.stop()
        recRef.current.start()
        setListening(true)
        return true
      } catch {
        wantListen.current = false
        setListening(false)
        setError('unknown')
        return false
      }
    }
  }, [])

  const stop = useCallback(() => {
    wantListen.current = false
    recRef.current?.stop()
    setListening(false)
  }, [])

  const resetVoice = useCallback(() => {
    setVoiceUsed(false)
    setError(null)
  }, [])

  return { listening, supported, error, voiceUsed, start, stop, resetVoice }
}
