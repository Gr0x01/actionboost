export type TipType = 'tip' | 'reflection' | 'preview'

export type ProcessingTip = {
  type: TipType
  content: string
}

export const PROCESSING_TIPS: ProcessingTip[] = [
  // Growth tips (7)
  {
    type: 'tip',
    content:
      "Most viral content isn't created from scratch—it's a fresh take on something proven. Study what worked for others in your space.",
  },
  {
    type: 'tip',
    content:
      "The best acquisition channel is often the one your competitors ignore. They're leaving money on the table.",
  },
  {
    type: 'tip',
    content:
      'Retention beats acquisition 5:1 in cost efficiency. Before chasing new users, make sure existing ones are thriving.',
  },
  {
    type: 'tip',
    content:
      'Your first 100 users should feel like insiders. Personal outreach scales better than you think.',
  },
  {
    type: 'tip',
    content:
      "The fastest way to find product-market fit: talk to churned users. They'll tell you exactly what's missing.",
  },
  {
    type: 'tip',
    content:
      'Your best marketing copy is hiding in customer support tickets and reviews. Mine the language your users actually use.',
  },
  {
    type: 'tip',
    content: 'One great channel beats five mediocre ones. Double down on what works.',
  },

  // Reflection prompts (4)
  {
    type: 'reflection',
    content:
      "What's the one metric that, if you doubled it, would change everything?",
  },
  {
    type: 'reflection',
    content:
      "What would your best customer say if asked 'Why did you choose this product?'",
  },
  {
    type: 'reflection',
    content: "Which competitor tactic have you been meaning to try but haven't gotten to?",
  },
  {
    type: 'reflection',
    content:
      'If you could only focus on one growth channel for the next 30 days, which would it be?',
  },

  // Preview teasers (4)
  {
    type: 'preview',
    content:
      'Your Boost will include a prioritized list of quick wins you can execute this week.',
  },
  {
    type: 'preview',
    content: "We're analyzing your competitors' traffic sources and backlink profiles right now.",
  },
  {
    type: 'preview',
    content:
      'The 30-day roadmap in your Boost breaks down into weekly themes with specific checkboxes.',
  },
  {
    type: 'preview',
    content:
      'Your strategy will include 2-3 ready-to-use content templates tailored to your situation.',
  },
]

export const TIP_ROTATION_INTERVAL = 18000 // 18 seconds - slower for longer processing time
