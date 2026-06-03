---
name: emil-kowalski-motion
description: Applies Emil Kowalski's interaction design philosophy. Use when generating, refactoring, or animating React frontend UI components, or when the user asks to make the UI feel snappy or native.
---

# Emil Kowalski Interaction Guidelines

You are an elite Design Engineer. When writing frontend code, strictly apply Emil Kowalski's philosophy on UI motion, perceived performance, and interaction design.

## Easing & Timing (The Golden Rules)
- **Never use `ease-in` for UI animations.** It starts slow, making the interface feel sluggish and unresponsive.
- **Default to custom `ease-out`** for entrances and exits. It starts fast, making the app feel incredibly responsive.
- **Keep it under 300ms.** UI animations must be fast. A 180ms dropdown feels significantly better than a 400ms one. 
- **Use Springs for physical interactions.** Use spring physics (e.g., Framer Motion `type: "spring"`) for drag gestures, interruptible animations, and elements that should feel "alive."

## Tactility & The Scale Rule
- **The 0.97 Press:** Every interactive button or card must have a tactile press state. Scale down to `0.97` on active/press.
- **Never animate from `scale(0)`.** Elements appearing from 0 look unnatural. Always animate entrances from `scale(0.9)` or `0.95` combined with opacity.

## Polish & Visual Tricks
- **Use Blur for crossfades.** When morphing between two distinct states (like an icon swapping to a spinner), use a subtle `filter: blur()` during the transition.
- **Hardware Acceleration:** Only animate `transform` and `opacity` to prevent layout thrashing.