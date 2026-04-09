const DESKTOP_BREAKPOINT = 1024
const CART_FLY_DURATION_MS = 800
const CART_BUTTON_PRESS_CLASS = 'cart-add-button-press'
const MIN_SOURCE_VISIBLE_RATIO = 0.35

type FlightMode = 'image' | 'bubble'
type RectLike = Pick<DOMRect, 'left' | 'top' | 'right' | 'bottom' | 'width' | 'height'>
type CartTargetName = 'desktop' | 'mobile-header' | 'mobile-floating'

type SourceVisual = {
  imageContainer: HTMLElement | null
  imageElement: HTMLImageElement | null
  hasUsableImage: boolean
  imageIsVisible: boolean
}

type FlightSource = {
  ghost: HTMLDivElement
  rect: RectLike
  mode: FlightMode
}

const CART_TARGET_PRIORITY: Record<'desktop' | 'mobile', CartTargetName[]> = {
  desktop: ['desktop', 'mobile-header', 'mobile-floating'],
  mobile: ['mobile-floating', 'mobile-header', 'desktop'],
}

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function isVisibleElement(element: HTMLElement) {
  const styles = window.getComputedStyle(element)
  const rect = element.getBoundingClientRect()

  return (
    styles.display !== 'none' &&
    styles.visibility !== 'hidden' &&
    rect.width > 0 &&
    rect.height > 0
  )
}

function isUsableRect(rect: RectLike) {
  return rect.width >= 4 && rect.height >= 4
}

function createRect(left: number, top: number, width: number, height: number): RectLike {
  return {
    left,
    top,
    width,
    height,
    right: left + width,
    bottom: top + height,
  }
}

function getViewportIntersectionRatio(rect: RectLike) {
  const visibleWidth = Math.max(0, Math.min(rect.right, window.innerWidth) - Math.max(rect.left, 0))
  const visibleHeight = Math.max(0, Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0))
  const visibleArea = visibleWidth * visibleHeight
  const totalArea = rect.width * rect.height

  if (totalArea <= 0) {
    return 0
  }

  return visibleArea / totalArea
}

function isElementMostlyInViewport(element: HTMLElement, minVisibleRatio = MIN_SOURCE_VISIBLE_RATIO) {
  return getViewportIntersectionRatio(element.getBoundingClientRect()) >= minVisibleRatio
}

function getRectCenter(rect: RectLike) {
  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
  }
}

function createGhostShell(rect: RectLike, className: string, borderRadius: string) {
  const ghost = document.createElement('div')

  ghost.className = className
  ghost.setAttribute('aria-hidden', 'true')
  ghost.style.left = `${rect.left}px`
  ghost.style.top = `${rect.top}px`
  ghost.style.width = `${rect.width}px`
  ghost.style.height = `${rect.height}px`
  ghost.style.borderRadius = borderRadius

  return ghost
}

function getCartTargetByName(name: CartTargetName) {
  return document.querySelector<HTMLElement>(`[data-cart-feedback-target="${name}"]`)
}

function findPreferredCartTarget() {
  const viewportType = window.innerWidth >= DESKTOP_BREAKPOINT ? 'desktop' : 'mobile'

  for (const targetName of CART_TARGET_PRIORITY[viewportType]) {
    const target = getCartTargetByName(targetName)
    if (target && isVisibleElement(target)) {
      return target
    }
  }

  return null
}

function findSourceVisual(sourceElement: HTMLElement | null): SourceVisual | null {
  if (!sourceElement) {
    return null
  }

  const root = sourceElement.closest<HTMLElement>('[data-cart-feedback-root]')
  const imageContainer = root?.querySelector<HTMLElement>('[data-cart-feedback-image]')

  if (!imageContainer) {
    return {
      imageContainer: null,
      imageElement: null,
      hasUsableImage: false,
      imageIsVisible: false,
    }
  }

  const imageElement = imageContainer.querySelector<HTMLImageElement>('img')
  const hasUsableImage = !!imageElement?.currentSrc && imageElement.complete
  const imageIsVisible = !!imageElement && hasUsableImage && isElementMostlyInViewport(imageElement)

  return {
    imageContainer,
    imageElement,
    hasUsableImage,
    imageIsVisible,
  }
}

function createImageFlightSource(sourceImage: HTMLImageElement): FlightSource | null {
  const sourceRect = sourceImage.getBoundingClientRect()

  if (!isUsableRect(sourceRect)) {
    return null
  }

  const sourceStyles = window.getComputedStyle(sourceImage)
  const ghost = createGhostShell(sourceRect, 'cart-fly-clone', sourceStyles.borderRadius || '22px')
  const mediaClone = sourceImage.cloneNode(true) as HTMLImageElement

  mediaClone.classList.add('cart-fly-clone__media')
  mediaClone.setAttribute('aria-hidden', 'true')
  ghost.appendChild(mediaClone)
  document.body.appendChild(ghost)

  return {
    ghost,
    rect: sourceRect,
    mode: 'image',
  }
}

function createBubbleFlightSource(sourceElement: HTMLElement, sourceImage?: HTMLImageElement | null): FlightSource | null {
  const buttonRect = sourceElement.getBoundingClientRect()

  if (!isUsableRect(buttonRect)) {
    return null
  }

  const bubbleSize = Math.max(56, Math.min(68, buttonRect.height + 18))
  const startRect = createRect(
    buttonRect.left + buttonRect.width / 2 - bubbleSize / 2,
    buttonRect.top + buttonRect.height / 2 - bubbleSize / 2,
    bubbleSize,
    bubbleSize,
  )
  const ghost = createGhostShell(startRect, 'cart-fly-clone cart-fly-clone--bubble', '20px')
  const bubble = document.createElement('div')
  const count = document.createElement('span')

  bubble.className = 'cart-fly-bubble'
  count.className = 'cart-fly-bubble__count'
  count.textContent = '+1'

  if (sourceImage?.currentSrc && sourceImage.complete) {
    const mediaClone = sourceImage.cloneNode(true) as HTMLImageElement

    mediaClone.classList.add('cart-fly-bubble__media')
    mediaClone.setAttribute('aria-hidden', 'true')
    bubble.appendChild(mediaClone)
  } else {
    const iconShell = document.createElement('span')
    const iconClone = sourceElement.querySelector<SVGElement>('svg')?.cloneNode(true) ?? null

    iconShell.className = 'cart-fly-bubble__icon-shell'

    if (iconClone instanceof SVGElement) {
      iconClone.classList.add('cart-fly-bubble__icon')
      iconClone.setAttribute('aria-hidden', 'true')
      iconShell.appendChild(iconClone)
    } else {
      const dot = document.createElement('span')

      dot.className = 'cart-fly-bubble__dot'
      iconShell.appendChild(dot)
    }

    bubble.appendChild(iconShell)
  }

  bubble.appendChild(count)
  ghost.appendChild(bubble)
  document.body.appendChild(ghost)

  return {
    ghost,
    rect: startRect,
    mode: 'bubble',
  }
}

function buildFlightKeyframes(sourceRect: RectLike, targetRect: RectLike, mode: FlightMode) {
  const sourceCenter = getRectCenter(sourceRect)
  const targetCenter = getRectCenter(targetRect)
  const waypoint = {
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  }
  const approach = {
    x: waypoint.x + (targetCenter.x - waypoint.x) * 0.74,
    y: waypoint.y + (targetCenter.y - waypoint.y) * 0.72,
  }
  const waypointScale = mode === 'image' ? 0.78 : 1.06
  const approachScale = mode === 'image' ? 0.48 : 0.62
  const finalScale = mode === 'image' ? 0.3 : 0.36

  return [
    {
      transform: 'translate3d(0, 0, 0) scale(1)',
      opacity: 1,
      offset: 0,
    },
    {
      transform: `translate3d(${waypoint.x - sourceCenter.x}px, ${waypoint.y - sourceCenter.y}px, 0) scale(${waypointScale})`,
      opacity: 1,
      offset: 0.58,
    },
    {
      transform: `translate3d(${approach.x - sourceCenter.x}px, ${approach.y - sourceCenter.y}px, 0) scale(${approachScale})`,
      opacity: 0.58,
      offset: 0.86,
    },
    {
      transform: `translate3d(${targetCenter.x - sourceCenter.x}px, ${targetCenter.y - sourceCenter.y}px, 0) scale(${finalScale})`,
      opacity: 0.08,
      offset: 1,
    },
  ]
}

export function formatCartCount(itemCount: number) {
  return itemCount > 99 ? '99+' : `${itemCount}`
}

export function replayAnimationClass(element: HTMLElement | null, className: string) {
  if (!element) {
    return
  }

  element.classList.remove(className)
  void element.offsetWidth
  element.classList.add(className)
}

export function triggerCartAddFeedback(sourceElement?: HTMLElement | null) {
  if (
    typeof document === 'undefined' ||
    typeof window === 'undefined' ||
    !sourceElement ||
    prefersReducedMotion()
  ) {
    return
  }

  replayAnimationClass(sourceElement, CART_BUTTON_PRESS_CLASS)

  const sourceVisual = findSourceVisual(sourceElement)
  const targetElement = findPreferredCartTarget()

  if (!targetElement) {
    return
  }

  const targetRect = targetElement.getBoundingClientRect()

  if (!isUsableRect(targetRect)) {
    return
  }

  const flightSource = sourceVisual?.imageIsVisible && sourceVisual.imageElement
    ? createImageFlightSource(sourceVisual.imageElement)
    : createBubbleFlightSource(sourceElement, sourceVisual?.hasUsableImage ? sourceVisual.imageElement : null)

  if (!flightSource) {
    return
  }

  const animation = flightSource.ghost.animate(
    buildFlightKeyframes(flightSource.rect, targetRect, flightSource.mode),
    {
      duration: CART_FLY_DURATION_MS,
      easing: 'cubic-bezier(0.42, 0, 0.58, 1)',
      fill: 'forwards',
    },
  )

  const cleanup = () => {
    if (flightSource.ghost.isConnected) {
      flightSource.ghost.remove()
    }
  }

  animation.addEventListener('finish', cleanup)
  animation.addEventListener('cancel', cleanup)
  window.setTimeout(cleanup, CART_FLY_DURATION_MS + 160)
}
