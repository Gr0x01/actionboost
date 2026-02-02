-- WS2: Boost Weekly Subscription tables
-- New tables: subscriptions, task_completions, weekly_checkins
-- Extended: runs (subscription_id, week_number, parent_plan_id, thesis)

-- =============================================================================
-- 1. SUBSCRIPTIONS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT UNIQUE NOT NULL,
  stripe_customer_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'past_due', 'canceled', 'paused', 'trialing')),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  current_week INTEGER NOT NULL DEFAULT 1,
  original_run_id UUID REFERENCES public.runs(id),
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_business_id ON public.subscriptions(business_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id ON public.subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);

-- RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own subscriptions"
  ON public.subscriptions FOR SELECT
  USING ((SELECT auth.uid()) = (SELECT auth_id FROM public.users WHERE id = user_id));

-- =============================================================================
-- 2. TASK_COMPLETIONS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.task_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID NOT NULL REFERENCES public.runs(id) ON DELETE CASCADE,
  task_index INTEGER NOT NULL,
  track TEXT NOT NULL DEFAULT 'sprint'
    CHECK (track IN ('sprint', 'build')),
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  note TEXT,
  outcome TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(run_id, task_index)
);

CREATE INDEX IF NOT EXISTS idx_task_completions_run_id ON public.task_completions(run_id);

-- RLS
ALTER TABLE public.task_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own task completions"
  ON public.task_completions FOR SELECT
  USING (
    run_id IN (
      SELECT r.id FROM public.runs r
      JOIN public.users u ON r.user_id = u.id
      WHERE u.auth_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Users can insert own task completions"
  ON public.task_completions FOR INSERT
  WITH CHECK (
    run_id IN (
      SELECT r.id FROM public.runs r
      JOIN public.users u ON r.user_id = u.id
      WHERE u.auth_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Users can update own task completions"
  ON public.task_completions FOR UPDATE
  USING (
    run_id IN (
      SELECT r.id FROM public.runs r
      JOIN public.users u ON r.user_id = u.id
      WHERE u.auth_id = (SELECT auth.uid())
    )
  );

-- =============================================================================
-- 3. WEEKLY_CHECKINS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.weekly_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID NOT NULL REFERENCES public.subscriptions(id) ON DELETE CASCADE,
  week_number INTEGER NOT NULL,
  sentiment TEXT CHECK (sentiment IN ('great', 'okay', 'rough')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(subscription_id, week_number)
);

CREATE INDEX IF NOT EXISTS idx_weekly_checkins_subscription_id ON public.weekly_checkins(subscription_id);

-- RLS
ALTER TABLE public.weekly_checkins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own weekly checkins"
  ON public.weekly_checkins FOR SELECT
  USING (
    subscription_id IN (
      SELECT s.id FROM public.subscriptions s
      JOIN public.users u ON s.user_id = u.id
      WHERE u.auth_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Users can insert own weekly checkins"
  ON public.weekly_checkins FOR INSERT
  WITH CHECK (
    subscription_id IN (
      SELECT s.id FROM public.subscriptions s
      JOIN public.users u ON s.user_id = u.id
      WHERE u.auth_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Users can update own weekly checkins"
  ON public.weekly_checkins FOR UPDATE
  USING (
    subscription_id IN (
      SELECT s.id FROM public.subscriptions s
      JOIN public.users u ON s.user_id = u.id
      WHERE u.auth_id = (SELECT auth.uid())
    )
  );

-- =============================================================================
-- 4. EXTEND RUNS TABLE
-- =============================================================================
ALTER TABLE public.runs
  ADD COLUMN IF NOT EXISTS subscription_id UUID REFERENCES public.subscriptions(id),
  ADD COLUMN IF NOT EXISTS week_number INTEGER,
  ADD COLUMN IF NOT EXISTS parent_plan_id UUID REFERENCES public.runs(id),
  ADD COLUMN IF NOT EXISTS thesis TEXT;

CREATE INDEX IF NOT EXISTS idx_runs_subscription_id ON public.runs(subscription_id);

-- Prevent duplicate weekly runs for the same subscription+week
CREATE UNIQUE INDEX IF NOT EXISTS idx_runs_subscription_week
  ON public.runs(subscription_id, week_number)
  WHERE subscription_id IS NOT NULL AND week_number IS NOT NULL;
