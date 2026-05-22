import { useRef } from 'react'
import { Reorder, useDragControls } from 'framer-motion'

interface Props {
  value: unknown
  children: React.ReactNode
  onDragEnd?: () => void
  style?: React.CSSProperties
  className?: string
  initial?: false
  layout?: boolean
}

const LONG_PRESS_MS = 1500
const MOVE_CANCEL_PX = 8

export function LongPressReorderItem({
  value,
  children,
  onDragEnd,
  style,
  className,
  initial,
  layout,
}: Props) {
  const dragControls = useDragControls()
  const timer = useRef<ReturnType<typeof setTimeout>>()
  const startPos = useRef({ x: 0, y: 0 })
  const dragging = useRef(false)

  function onPointerDown(e: React.PointerEvent) {
    startPos.current = { x: e.clientX, y: e.clientY }
    dragging.current = false
    const nativeEvent = e.nativeEvent
    timer.current = setTimeout(() => {
      dragging.current = true
      navigator.vibrate?.(15)
      dragControls.start(nativeEvent)
    }, LONG_PRESS_MS)
  }

  function onPointerMove(e: React.PointerEvent) {
    if (dragging.current) return
    const dx = e.clientX - startPos.current.x
    const dy = e.clientY - startPos.current.y
    if (Math.sqrt(dx * dx + dy * dy) > MOVE_CANCEL_PX) {
      clearTimeout(timer.current)
    }
  }

  function cancel() {
    clearTimeout(timer.current)
  }

  return (
    <Reorder.Item
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      value={value as any}
      dragListener={false}
      dragControls={dragControls}
      onDragEnd={onDragEnd}
      dragMomentum={false}
      dragElastic={0}
      style={style}
      className={className}
      initial={initial}
      layout={layout}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={cancel}
      onPointerLeave={cancel}
      onPointerCancel={cancel}
    >
      {children}
    </Reorder.Item>
  )
}
