import { useEffect, useMemo, useRef, useState, useCallback } from 'react'

function random(min, max) {
    return Math.random() * (max - min) + min
}

function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)]
}

function useReducedMotion() {
    const [reduced, setReduced] = useState(false)
    useEffect(() => {
        const media = window.matchMedia('(prefers-reduced-motion: reduce)')
        const update = () => setReduced(media.matches)
        update()
        media.addEventListener('change', update)
        return () => media.removeEventListener('change', update)
    }, [])
    return reduced
}

/* ── Audio ──────────────────────────────────────────────────── */
function playChime() {
    const Context = window.AudioContext || window.webkitAudioContext
    if (!Context) return
    const ctx = new Context()
    const now = ctx.currentTime
    // Sparkly ascending arpeggio
    const notes = [523.25, 659.25, 783.99, 987.77, 1174.66, 1318.51]
    notes.forEach((freq, i) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sine'
        osc.frequency.value = freq
        gain.gain.setValueAtTime(0.001, now + i * 0.06)
        gain.gain.exponentialRampToValueAtTime(0.07, now + i * 0.06 + 0.02)
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.18)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(now + i * 0.06)
        osc.stop(now + i * 0.06 + 0.20)
    })
    window.setTimeout(() => ctx.close(), 800)
}

function playPop() {
    const Context = window.AudioContext || window.webkitAudioContext
    if (!Context) return
    const ctx = new Context()
    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(520, now)
    osc.frequency.exponentialRampToValueAtTime(280, now + 0.10)
    gain.gain.setValueAtTime(0.001, now)
    gain.gain.exponentialRampToValueAtTime(0.07, now + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(now)
    osc.stop(now + 0.14)
    window.setTimeout(() => ctx.close(), 300)
}

/* ── Emoji pools ─────────────────────────────────────────────── */
const HEART_POOL    = ['♥','🩷','💗','💕','💖','💞','💓','💝','🫀','❣️']
const SPARKLE_POOL  = ['✦','✿','❀','✸','✺','⁕','⊹','✩']
const RIBBON_POOL   = ['🎀','🎗️','🎁']
const CANDY_POOL    = ['🍭','🍬','🍡','🍧','🍰','🧁','🍩','🍪']
const FLOWER_POOL   = ['🌸','🌺','🌼','💐','🌷','🏵️']
const BUTTERFLY_POOL= ['🦋','🫧','🪷']
const STAR_POOL     = ['⭐','🌟','💫','✨','🌠']
const CLOUD_POOL    = ['🌸','☁️','🌤️']

// Full click burst pool
const BURST_POOL = ['✦','♡','🌸','✿','💖','🎀','⭐','💫','✨','🩷']

/* ── Shooting star ───────────────────────────────────────────── */
function ShootingStar({ id, onDone }) {
    useEffect(() => {
        const t = setTimeout(onDone, 1200)
        return () => clearTimeout(t)
    }, [onDone])
    const top  = `${random(5, 40)}vh`
    const left = `${random(10, 80)}vw`
    return (
        <span
            className="shooting-star"
            style={{ top, left }}
            aria-hidden="true"
        >✨</span>
    )
}

/* ── Floating bubble ─────────────────────────────────────────── */
function FloatingBubble({ bubble }) {
    return (
        <span
            className="pookie-bubble"
            style={{
                left: bubble.left,
                fontSize: bubble.size,
                animationDuration: bubble.duration,
                animationDelay: bubble.delay,
                '--drift-x': bubble.drift,
            }}
            aria-hidden="true"
        >{bubble.symbol}</span>
    )
}

/* ── Rainbow text ticker ─────────────────────────────────────── */
function PookieTicker() {
    const words = ['bestie 🩷', 'slay ✦', 'cutie 🌸', 'girly 🎀', 'iconic 💅', 'vibes 🦋', 'baby 💖', 'omg ✨']
    const [idx, setIdx] = useState(0)
    useEffect(() => {
        const id = setInterval(() => setIdx(i => (i + 1) % words.length), 2000)
        return () => clearInterval(id)
    }, [])
    return (
        <div className="pookie-ticker" aria-hidden="true">
            <span className="pookie-ticker-word">{words[idx]}</span>
        </div>
    )
}

/* ── Main component ──────────────────────────────────────────── */
export default function HeartSnowfall({ active }) {
    const reducedMotion = useReducedMotion()
    const [entranceKey, setEntranceKey]     = useState(0)
    const [showEntrance, setShowEntrance]   = useState(false)
    const [cursor, setCursor]               = useState({ x: -200, y: -200 })
    const [trail, setTrail]                 = useState([])
    const [clickParticles, setClickParticles] = useState([])
    const [shootingStars, setShootingStars] = useState([])
    const counterRef = useRef(0)
    const shootTimerRef = useRef(null)
    const cursorTargetRef = useRef({ x: -200, y: -200 })
    const rafRef = useRef(null)

    /* ── Snowfall elements ──────────────────────────────────── */
    const hearts = useMemo(() => Array.from({ length: 22 }, (_, i) => ({
        id: `heart-${i}`,
        left: `${random(0, 100)}vw`,
        size: `${random(16, 30)}px`,
        duration: `${random(6, 13)}s`,
        delay: `${random(0, 9)}s`,
        opacity: random(0.4, 0.9),
        drift: `${random(-70, 70)}px`,
        symbol: pick(HEART_POOL),
        rotate: random(-20, 20),
    })), [active])

    const sparkles = useMemo(() => Array.from({ length: 14 }, (_, i) => ({
        id: `sparkle-${i}`,
        left: `${random(0, 100)}vw`,
        size: `${random(8, 18)}px`,
        duration: `${random(2, 5.5)}s`,
        delay: `${random(0, 5)}s`,
        opacity: random(0.5, 1),
        drift: `${random(-50, 50)}px`,
        symbol: pick(SPARKLE_POOL),
    })), [active])

    const extras = useMemo(() => Array.from({ length: 12 }, (_, i) => ({
        id: `extra-${i}`,
        left: `${random(0, 100)}vw`,
        size: `${random(12, 28)}px`,
        duration: `${random(9, 16)}s`,
        delay: `${random(0, 12)}s`,
        opacity: random(0.4, 0.9),
        drift: `${random(-80, 80)}px`,
        symbol: pick([...CANDY_POOL, ...FLOWER_POOL, ...BUTTERFLY_POOL, ...RIBBON_POOL]),
        wobble: Math.random() > 0.5,
    })), [active])

    const twinkles = useMemo(() => Array.from({ length: 12 }, (_, i) => ({
        id: `twinkle-${i}`,
        left: `${random(3, 97)}vw`,
        top: `${random(5, 92)}vh`,
        size: `${random(10, 22)}px`,
        duration: `${random(1.5, 5)}s`,
        delay: `${random(0, 4)}s`,
        symbol: pick(STAR_POOL),
    })), [active])

    const bubbles = useMemo(() => Array.from({ length: 8 }, (_, i) => ({
        id: `bubble-${i}`,
        left: `${random(5, 95)}vw`,
        size: `${random(14, 26)}px`,
        duration: `${random(7, 15)}s`,
        delay: `${random(0, 8)}s`,
        drift: `${random(-40, 40)}px`,
        symbol: pick([...FLOWER_POOL, '🫧', '🌈']),
    })), [active])

    /* ── Entrance animation ─────────────────────────────────── */
    // Timing budget:
    //   bowPop          = 1700ms
    //   burstItem       = 1200ms
    //   exit-fade class = added at 1650ms, CSS transition 850ms
    //   unmount         = 2600ms (after fade completes)
    const [entranceExiting, setEntranceExiting] = useState(false)

    useEffect(() => {
        if (!active) return
        setEntranceKey(k => k + 1)
        setShowEntrance(true)
        setEntranceExiting(false)
        document.body.classList.add('pookie-entering')
        const tFade = setTimeout(() => setEntranceExiting(true), 1650)
        const tHide = setTimeout(() => {
            setShowEntrance(false)
            setEntranceExiting(false)
        }, 2600)
        const tClass = setTimeout(() => document.body.classList.remove('pookie-entering'), 1250)
        return () => { clearTimeout(tFade); clearTimeout(tHide); clearTimeout(tClass) }
    }, [active])

    /* ── Chime on enter ─────────────────────────────────────── */
    useEffect(() => {
        if (!active || reducedMotion) return
        if (localStorage.getItem('pookie-sounds') === 'true') playChime()
    }, [active, reducedMotion])

    /* ── Cursor + trail ─────────────────────────────────────── */
    useEffect(() => {
        if (!active) return
        const move = (e) => {
            cursorTargetRef.current = { x: e.clientX, y: e.clientY }
            counterRef.current++
            if (counterRef.current % 2 !== 0) return
            const id = `${Date.now()}-${Math.random()}`
            const sym = pick(['✦', '🌸', '♡', '✿', '💖', '✨', '🎀'])
            setTrail(t => [...t.slice(-18), { id, x: e.clientX, y: e.clientY, sym }])
            setTimeout(() => setTrail(t => t.filter(i => i.id !== id)), 500)
        }
        document.addEventListener('mousemove', move)
        return () => document.removeEventListener('mousemove', move)
    }, [active])

    useEffect(() => {
        if (!active) return
        const animate = () => {
            setCursor((prev) => ({
                x: prev.x + (cursorTargetRef.current.x - prev.x) * 0.18,
                y: prev.y + (cursorTargetRef.current.y - prev.y) * 0.18,
            }))
            rafRef.current = requestAnimationFrame(animate)
        }
        rafRef.current = requestAnimationFrame(animate)
        return () => cancelAnimationFrame(rafRef.current)
    }, [active])

    /* ── Click burst ────────────────────────────────────────── */
    useEffect(() => {
        if (!active) return
        const onClick = (e) => {
            const count = Math.floor(random(7, 13))
            const burst = Array.from({ length: count }, (_, i) => ({
                id: `${Date.now()}-${i}-${Math.random()}`,
                x: e.clientX,
                y: e.clientY,
                vx: random(-60, 60),
                vy: random(-100, -25),
                symbol: pick(BURST_POOL),
                size: random(10, 20),
                life: random(500, 1000),
            }))
            setClickParticles(p => [...p, ...burst])
            burst.forEach(particle => {
                setTimeout(() => setClickParticles(p => p.filter(i => i.id !== particle.id)), particle.life)
            })
            if (!reducedMotion && localStorage.getItem('pookie-sounds') === 'true') playPop()
        }
        document.addEventListener('click', onClick)
        return () => document.removeEventListener('click', onClick)
    }, [active, reducedMotion])

    /* ── Periodic shooting stars ────────────────────────────── */
    useEffect(() => {
        if (!active || reducedMotion) return
        const schedule = () => {
            shootTimerRef.current = setTimeout(() => {
                const id = `star-${Date.now()}`
                setShootingStars(s => [...s, id])
                schedule()
            }, random(3000, 8000))
        }
        schedule()
        return () => clearTimeout(shootTimerRef.current)
    }, [active, reducedMotion])

    /* ── Button text mutation ───────────────────────────────── */
    useEffect(() => {
        if (!active) return
        const apply = () => {
            document.querySelectorAll('button').forEach(btn => {
                const v = btn.textContent?.trim()
                if (!v) return
                if (v === 'Confirm' && !btn.dataset.pookieOriginal) {
                    btn.dataset.pookieOriginal = v
                    btn.textContent = 'Yes bestie! 💖'
                }
                if (v === 'Cancel' && !btn.dataset.pookieOriginal) {
                    btn.dataset.pookieOriginal = v
                    btn.textContent = 'Nope 🙅‍♀️'
                }
            })
            document.querySelectorAll('p, span').forEach(node => {
                const v = node.textContent?.trim()
                if (!v || node.dataset.pookieEmptyState) return
                if (/^No\s.+/i.test(v)) {
                    node.dataset.pookieEmptyState = v
                    node.textContent = '🌸 Nothing here yet, bestie~'
                    node.classList.add('pookie-empty-state')
                }
            })
        }
        apply()
        const obs = new MutationObserver(apply)
        obs.observe(document.body, { childList: true, subtree: true })
        return () => {
            obs.disconnect()
            document.querySelectorAll('button[data-pookie-original]').forEach(btn => {
                btn.textContent = btn.dataset.pookieOriginal
                delete btn.dataset.pookieOriginal
            })
            document.querySelectorAll('[data-pookie-empty-state]').forEach(node => {
                node.textContent = node.dataset.pookieEmptyState
                node.classList.remove('pookie-empty-state')
                delete node.dataset.pookieEmptyState
            })
            document.body.classList.remove('pookie-entering')
        }
    }, [active])

    /* ── favicon + title ────────────────────────────────────── */
    useEffect(() => {
        if (!active) return
        const prevTitle = document.title
        document.title = `🩷 ${document.title.replace(/^🩷\s*/, '')}`
        let link = document.querySelector("link[rel~='icon']")
        const prevHref = link?.href
        if (!link) { link = document.createElement('link'); link.rel = 'icon'; document.head.appendChild(link) }
        link.href = "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🎀</text></svg>"
        return () => {
            document.title = prevTitle
            if (prevHref) link.href = prevHref
        }
    }, [active])

    if (!active) return null

    return (
        <>
            {/* ── Entrance ── */}
            {showEntrance && (
                <div key={entranceKey} className={`pookie-entrance ${entranceExiting ? 'pookie-entrance--exiting' : ''} ${reducedMotion ? 'reduce-motion' : ''}`} aria-hidden="true">
                    <span className="pookie-flash" />
                    <span className="pookie-entrance-halo" />
                    <span className="pookie-bow">🎀</span>
                    <span className="pookie-bow-secondary pookie-bow-left">🌸</span>
                    <span className="pookie-bow-secondary pookie-bow-right">💖</span>
                    <div className="pookie-entrance-burst">
                        {Array.from({ length: 16 }, (_, i) => (
                            <span key={i} className="pookie-burst-item"
                                style={{
                                    '--angle': `${i * 22.5}deg`,
                                    '--distance': `${random(80, 200)}px`,
                                }}>
                                {pick([...BURST_POOL, ...RIBBON_POOL])}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Corner decorations ── */}
            <div className="pookie-corner pookie-corner-tl" aria-hidden="true">🎀</div>
            <div className="pookie-corner pookie-corner-tr" aria-hidden="true">🌸</div>
            <div className="pookie-corner pookie-corner-bl" aria-hidden="true">💖</div>
            <div className="pookie-corner pookie-corner-br" aria-hidden="true">✨</div>

            {/* ── Rotating ticker ── */}
            <PookieTicker />

            <div className={`heart-snowfall ${reducedMotion ? 'reduce-motion' : ''}`} aria-hidden="true">
                <div className="pookie-ambient-gradient" />
                <div className="pookie-vignette" />
                <span className="pookie-orb orb-a">🩷</span>
                <span className="pookie-orb orb-b">🌸</span>
                <span className="pookie-orb orb-c">✨</span>

                {/* Hearts */}
                <div className="heart-layer">
                    {hearts.map((h, i) => (
                        <span key={h.id}
                            className={`heart-snowfall-item ${i % 2 === 0 ? 'drift-alt' : ''} ${i % 3 === 0 ? 'wobble' : ''}`}
                            style={{
                                left: h.left, top: '-60px',
                                fontSize: h.size,
                                animationDuration: h.duration,
                                animationDelay: h.delay,
                                opacity: h.opacity,
                                '--drift-x': h.drift,
                                '--rotate': `${h.rotate}deg`,
                            }}>
                            {h.symbol}
                        </span>
                    ))}
                </div>

                {/* Sparkles */}
                <div className="sparkle-layer">
                    {sparkles.map(s => (
                        <span key={s.id} className="sparkle-snowfall-item"
                            style={{
                                left: s.left, top: '-40px',
                                fontSize: s.size,
                                animationDuration: s.duration,
                                animationDelay: s.delay,
                                opacity: s.opacity,
                                '--drift-x': s.drift,
                            }}>
                            {s.symbol}
                        </span>
                    ))}
                </div>

                {/* NEW: extras — candy, flowers, butterflies, ribbons */}
                <div className="extras-layer">
                    {extras.map(e => (
                        <span key={e.id}
                            className={`extras-snowfall-item ${e.wobble ? 'wobble' : ''}`}
                            style={{
                                left: e.left, top: '-50px',
                                fontSize: e.size,
                                animationDuration: e.duration,
                                animationDelay: e.delay,
                                opacity: e.opacity,
                                '--drift-x': e.drift,
                            }}>
                            {e.symbol}
                        </span>
                    ))}
                </div>

                {/* Twinkle stars (fixed position, pulse only) */}
                <div className="twinkle-layer">
                    {twinkles.map(s => (
                        <span key={s.id} className="twinkle-star"
                            style={{
                                left: s.left, top: s.top,
                                fontSize: s.size,
                                animationDuration: s.duration,
                                animationDelay: s.delay,
                            }}>
                            {s.symbol}
                        </span>
                    ))}
                </div>

                {/* NEW: rising bubbles (float upward) */}
                <div className="bubbles-layer">
                    {bubbles.map(b => <FloatingBubble key={b.id} bubble={b} />)}
                </div>

                {/* NEW: shooting stars */}
                {shootingStars.map(id => (
                    <ShootingStar key={id} id={id}
                        onDone={() => setShootingStars(s => s.filter(i => i !== id))} />
                ))}

                {/* Custom sparkle cursor — outer positions, inner animates */}
                <div className="pookie-cursor-positioner"
                    style={{ transform: `translate3d(${cursor.x}px,${cursor.y}px,0)` }}>
                    <span className="pookie-cursor">🌸</span>
                </div>

                {/* Cursor trail — varied emojis */}
                {trail.map((item, idx) => (
                    <div key={item.id} className="pookie-cursor-trail-positioner"
                        style={{ transform: `translate3d(${item.x}px,${item.y}px,0)` }}>
                        <span className="pookie-cursor-trail"
                            style={{
                                opacity: 1 - idx / trail.length,
                                fontSize: `${10 + idx * 0.5}px`,
                            }}>
                            {item.sym}
                        </span>
                    </div>
                ))}

                {/* Click burst particles */}
                {clickParticles.map(p => (
                    <span key={p.id} className="pookie-click-particle"
                        style={{
                            left: p.x, top: p.y,
                            '--vx': `${p.vx}px`,
                            '--vy': `${p.vy}px`,
                            '--life': `${p.life}ms`,
                            fontSize: `${p.size}px`,
                        }}>
                        {p.symbol}
                    </span>
                ))}
            </div>
        </>
    )
}
