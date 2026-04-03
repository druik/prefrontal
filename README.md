# Prefrontal

A daily planning interface for brains that don't work well with open-ended task lists.

**Live:** [prefrontal-swart.vercel.app](https://prefrontal-swart.vercel.app)

## The Problem

Traditional task managers present everything at once. For people managing ADHD or variable cognitive capacity, an unbounded list creates decision paralysis before the real work starts. The question isn't "what needs to get done" — it's "what am I committing to today, given how I'm doing right now?"

## How It Works

Prefrontal splits task management into two deliberate steps:

1. **Backlog** — Capture tasks without pressure. No dates, no priorities, no urgency. Just a list of things that exist.

2. **Plan Today** — Review the backlog and pull specific tasks into today's plan. This is the approval step — a conscious commitment to a short list.

A **capacity selector** (Low, Moderate, High, Rest) sets how many tasks appear on the companion display. The selection syncs instantly — no confirmation, no friction.

Once approved, tasks appear on [Cortex](https://cortex-display.vercel.app), a passive ambient display that shows only today's commitments filtered by your current capacity. Completing a task in either interface marks it done in both.

The separation is the point. Capturing and planning are different cognitive modes. Prefrontal keeps them apart.

## System Architecture

```
Backlog → Approve → Plan Today → Supabase → Cortex displays
                         ↑
                   Capacity selector
```

Prefrontal is the input layer. Cortex is the output layer. Supabase sits between them as shared state. Both apps are independent deployments that read and write to the same database.

## Tech Stack

- **Next.js** with App Router
- **Supabase** for anonymous auth and Postgres storage
- **TypeScript**
- **Tailwind CSS**
- **Vercel** for deployment

## Companion

This app pairs with **Cortex**, a read-only ambient display:
[cortex-display.vercel.app](https://cortex-display.vercel.app)
