# Prefrontal

A daily planning interface designed for brains that struggle with open-ended task lists. Prefrontal is the decision-making layer for [Cortex](https://cortex-display.vercel.app), a minimal ambient display that shows only what matters right now.

**Live:** [prefrontal-swart.vercel.app](https://prefrontal-swart.vercel.app)

## The Problem

Traditional task managers present everything at once. For people managing ADHD or variable cognitive capacity, an unbounded list creates decision paralysis before the real work even starts. The question isn't "what needs to get done" — it's "what am I committing to today, given how I'm doing right now?"

## How It Works

Prefrontal splits task management into two deliberate steps:

1. **Backlog** — Capture tasks without pressure. Everything lands here first with no date, no priority, no urgency. Just a list of things that exist.

2. **Plan Today** — Each morning (or whenever you're ready), review the backlog and pull specific tasks into today's plan. This is the approval step — a conscious commitment to a short list.

Once approved, tasks appear on Cortex, a passive display that shows only today's commitments. Completing a task in either interface marks it done in both.

The separation is the point. Capturing and planning are different cognitive modes. Prefrontal keeps them apart.

## Tech Stack

- **Next.js** with App Router
- **Supabase** for auth (anonymous) and data
- **TypeScript**
- **Tailwind CSS**
- **Vercel** for deployment
