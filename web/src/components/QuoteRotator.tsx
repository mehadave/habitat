import { useState, useEffect, useRef } from 'react'
import { QUOTES, type Quote } from '../lib/quotes'

interface QuoteRotatorProps {
  intervalMs?: number
}

export function QuoteRotator({ intervalMs = 600000 }: QuoteRotatorProps) {
  const [quote, setQuote] = useState<Quote>(() => QUOTES[Math.floor(Math.random() * QUOTES.length)])
  const [key, setKey] = useState(0)
  const idxRef = useRef(Math.floor(Math.random() * QUOTES.length))

  useEffect(() => {
    const timer = setInterval(() => {
      idxRef.current = (idxRef.current + 1) % QUOTES.length
      setQuote(QUOTES[idxRef.current])
      setKey((k) => k + 1)
    }, intervalMs)
    return () => clearInterval(timer)
  }, [intervalMs])

  return (
    <div
      className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-center"
      style={{
        background: 'rgba(255,255,255,0.07)',
        border: '1px solid rgba(255,255,255,0.12)',
        maxWidth: '90vw',
      }}
    >
      <p
        key={key}
        className="quote-fade text-xs italic leading-relaxed"
        style={{ color: 'rgba(255,255,255,0.75)' }}
      >
        "{quote.text}"
        <span className="not-italic ml-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
          — {quote.author}
        </span>
      </p>
    </div>
  )
}
