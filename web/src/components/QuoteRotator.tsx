import { useState, useEffect, useRef } from 'react'
import { QUOTES, type Quote } from '../lib/quotes'

interface QuoteRotatorProps {
  intervalMs?: number
  darkMode?: boolean
}

export function QuoteRotator({ intervalMs = 600000, darkMode = true }: QuoteRotatorProps) {
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

  const pillBg = darkMode ? 'rgba(255,255,255,0.07)' : 'rgba(11,20,55,0.06)'
  const pillBorder = darkMode ? 'rgba(255,255,255,0.12)' : 'rgba(11,20,55,0.1)'
  const textColor = darkMode ? 'rgba(255,255,255,0.75)' : 'rgba(11,20,55,0.65)'
  const authorColor = darkMode ? 'rgba(255,255,255,0.4)' : 'rgba(11,20,55,0.4)'

  return (
    <div
      className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-center"
      style={{
        background: pillBg,
        border: `1px solid ${pillBorder}`,
        maxWidth: '90vw',
      }}
    >
      <p
        key={key}
        className="quote-fade text-xs italic leading-relaxed"
        style={{ color: textColor }}
      >
        "{quote.text}"
        <span className="not-italic ml-1" style={{ color: authorColor }}>
          — {quote.author}
        </span>
      </p>
    </div>
  )
}
