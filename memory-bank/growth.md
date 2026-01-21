# Growth Tracking

Reference: [Full growth plan](../docs/growth-plan-actionboost.md)

## Current Status: Day 0 - Launch & Learn

### Completed
| Activity | Date | Result |
|----------|------|--------|
| Add founder to site | Jan 20 | ✅ Live |
| Create promo codes | Jan 20 | ✅ REDDIT, UNEED, PEERPUSH, TWITTERBIP |
| Submit to Uneed | Jan 20 | ⏳ Pending review |
| Submit to PeerPush | Jan 20 | 🔥 Live - #2 for Jan 21 |
| Post on r/sideprojects | Jan 20 | ❌ Dead (-3, spam DMs only) |
| Start X posting | Jan 20 | 🔄 Ongoing |
| Remove homepage click barrier | Jan 20 | ✅ Form starts on landing |
| Publish growth plan blog post | Jan 20 | ✅ Live at /blog |

### Blocked
| Activity | Blocker | Workaround |
|----------|---------|------------|
| r/indiehackers launch | Account can't post | Posted to r/sideprojects instead |

### Learnings
- Reddit: Launch subs are dead for this. Everyone's promoting, no one's engaging. DMs/emails all pitching their own products. Skip going forward.
- X: General posting not fun, but BIP groups giving better responses - focus there
- Homepage: Direct form start is a good conversion optimization

### Day 0 Bugs
1. **Feature flag left on prod** - `NEXT_PUBLIC_PRICING_ENABLED=false` blocked both $9.99 AND free mini-audit paths. Only promo codes worked. Lesson: clean up feature flags before launch.
2. **Serverless termination** - Runs stuck at "pending". Fire-and-forget doesn't work on Vercel. Fixed with `after()` API.
- 2 real users (used coupon codes) got stuck.

---

## Day 1 - Jan 21

### Completed
| Activity | Result |
|----------|--------|
| Fix feature flag bug | ✅ Removed flag, checkout works |
| Fix serverless termination | ✅ Using `after()` API now |
| Unstuck 2 user runs | ✅ Manually completed |
| Give free credits to stuck users | ✅ 1 credit each |
| Fix returning user context bug | ✅ Context delta now applied |
| Relax AI context limits | ✅ Better output quality |
| Extend free mini-audit | ✅ Now includes Channel Strategy |
| Add "Tell Us More" refinements | ✅ 2 free refinements per run |
| Build First Impressions pipeline | ✅ Internal tool for sharing |
| X posts (BIP threads) | ✅ Multiple posted |

### Wins
- **PeerPush #2** for today's launches
- **PeerPush testimonial** from @noahpraduns: "This is exactly what I needed! The competitor analysis feature is incredibly valuable. The 30-day playbook alone is worth the price. Highly recommend!"
- **BIP thread posted** - Better engagement than general X posting
- **First Impressions tool** - Can now demo the product without friction

### Product Improvements
- **Free tier extended** - 4 sections now (added Channel Strategy) to prove value before paywall
- **Refinements added** - Users can say "we already tried that" and get updated strategy
- **Context bug fixed** - Returning users' updates now properly applied
- **Quality improved** - More context sent to Claude = better output

### To Do
- [x] Contact stuck users - ✅ Sent apology emails with free credit info
- [x] First Twitter BIP thread - ✅ Posted
- [x] Build internal demo tool - ✅ First Impressions pipeline
- [ ] Respond to feedback (waiting for engagement)

### Spend
| Date | Item | Cost |
|------|------|------|
| Jan 20 | PeerPush | $25 |
| Jan 20 | Uneed | $15 |
| **Total** | | **$40** |

### Metrics (update weekly)
| Metric | Target (Day 30) | Actual |
|--------|-----------------|--------|
| Paid runs | 50-100 | ? |
| Visitors | 2,000 | ? |
| Form starts | 300 | ? |
| Revenue | $500-1000 | $0 |

---

## Next Actions
1. Monitor Uneed and PeerPush submissions
2. Continue X/BIP posting - better engagement than Reddit
3. Use First Impressions tool to demo for potential users
4. Watch for refinement usage patterns
