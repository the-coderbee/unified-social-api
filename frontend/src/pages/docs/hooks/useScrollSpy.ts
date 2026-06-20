import { useEffect, useRef, useState } from 'react'

export function useScrollSpy(ids: string[], rootMargin = '-64px 0px -55% 0px') {
  const [activeId, setActiveId] = useState<string>(ids[0] ?? '')
  const observerRef = useRef<IntersectionObserver | null>(null)
  const idsKey = ids.join(',')

  useEffect(() => {
    if (ids.length === 0) return

    function setup() {
      observerRef.current?.disconnect()

      observerRef.current = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              setActiveId(entry.target.id)
            }
          }
        },
        { rootMargin },
      )

      const observer = observerRef.current
      let observed = 0
      for (const id of ids) {
        const el = document.getElementById(id)
        if (el) { observer.observe(el); observed++ }
      }
      return observed
    }

    // Try immediately, then retry after a tick (for lazy-loaded sections)
    const immediate = setup()
    let retryId: ReturnType<typeof setTimeout> | undefined
    if (immediate === 0) {
      retryId = setTimeout(setup, 150)
    }

    return () => {
      clearTimeout(retryId)
      observerRef.current?.disconnect()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idsKey, rootMargin])

  return activeId
}
