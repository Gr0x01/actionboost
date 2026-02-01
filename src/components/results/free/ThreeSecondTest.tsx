'use client'

import type { ThreeSecondTest as ThreeSecondTestType } from '@/lib/ai/formatter-types'

interface ThreeSecondTestProps {
  test: ThreeSecondTestType
}

const QUESTIONS: { key: keyof Omit<ThreeSecondTestType, 'verdict'>; label: string }[] = [
  { key: 'whatYouSell', label: 'What do you sell?' },
  { key: 'whoItsFor', label: 'Who is it for?' },
  { key: 'whyYou', label: 'Why you over alternatives?' },
]

/**
 * ThreeSecondTest - What a stranger sees in 3 seconds.
 * Bold question, plain answers. No badges, no decorations.
 */
export function ThreeSecondTest({ test }: ThreeSecondTestProps) {
  return (
    <section>
      <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-foreground/40 block mb-4">
        3-SECOND TEST
      </span>

      <div
        className="bg-background border-2 border-foreground/20 rounded-md p-6"
        style={{ boxShadow: '4px 4px 0 rgba(44, 62, 80, 0.08)' }}
      >
        <h3 className="text-[17px] font-bold leading-[1.4] text-foreground mb-6">
          Can a stranger tell what you do in 3 seconds?
        </h3>

        <div className="space-y-5">
          {QUESTIONS.map(({ key, label }) => (
            <div key={key}>
              <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-foreground/40 block mb-1.5">
                {label}
              </span>
              <p className="text-[15px] leading-[1.6] text-foreground">
                {test[key]}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
