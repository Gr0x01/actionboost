import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { sendFeedbackRequestEmail } from '@/lib/email/resend'

export const dynamic = 'force-dynamic'

/**
 * Cron job to send feedback request emails 48 hours after run completion.
 * Protected by CRON_SECRET to prevent unauthorized access.
 *
 * Vercel cron schedule: runs every hour (0 * * * *)
 */
export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceClient()

  // Find runs completed 48-49 hours ago that haven't had feedback email sent
  const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
  const fortyNineHoursAgo = new Date(Date.now() - 49 * 60 * 60 * 1000).toISOString()

  const { data: runs, error } = await supabase
    .from('runs')
    .select('id, user_id')
    .eq('status', 'complete')
    .is('feedback_email_sent', null)
    .gte('completed_at', fortyNineHoursAgo)
    .lte('completed_at', fortyEightHoursAgo)

  if (error) {
    console.error('[FeedbackCron] Query failed:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!runs || runs.length === 0) {
    return NextResponse.json({ sent: 0, message: 'No eligible runs found' })
  }

  let sentCount = 0
  const errors: string[] = []

  for (const run of runs) {
    if (!run.user_id) continue

    // Get user email
    const { data: user } = await supabase
      .from('users')
      .select('email')
      .eq('id', run.user_id)
      .single()

    if (!user?.email) continue

    try {
      await sendFeedbackRequestEmail({ to: user.email, runId: run.id })

      // Mark as sent
      await supabase
        .from('runs')
        .update({ feedback_email_sent: new Date().toISOString() })
        .eq('id', run.id)

      sentCount++
      console.log(`[FeedbackCron] Sent feedback email for run ${run.id}`)
    } catch (err) {
      const errorMsg = `Run ${run.id}: ${err instanceof Error ? err.message : String(err)}`
      console.error(`[FeedbackCron] Failed:`, errorMsg)
      errors.push(errorMsg)
    }
  }

  return NextResponse.json({
    sent: sentCount,
    total: runs.length,
    errors: errors.length > 0 ? errors : undefined,
  })
}
