"use client";

import { STUCK_TWEETS, type StuckTweet } from "@/data/stuck-tweets";

// X/Twitter-style icons (simplified SVG paths)
function ReplyIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01zm8.005-6c-3.317 0-6.005 2.69-6.005 6 0 3.37 2.77 6.08 6.138 6.01l.351-.01h1.761v2.3l5.087-2.81c1.951-1.08 3.163-3.13 3.163-5.36 0-3.39-2.744-6.13-6.129-6.13H9.756z" />
    </svg>
  );
}

function RetweetIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.79-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.79 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46 2.068 1.93V8c0-1.1-.896-2-2-2z" />
    </svg>
  );
}

function HeartIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z" />
    </svg>
  );
}

function ViewsIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M8.75 21V3h2v18h-2zM18 21V8.5h2V21h-2zM4 21l.004-10h2L6 21H4zm9.248 0v-7h2v7h-2z" />
    </svg>
  );
}

function BookmarkIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M4 4.5C4 3.12 5.119 2 6.5 2h11C18.881 2 20 3.12 20 4.5v18.44l-8-5.71-8 5.71V4.5zM6.5 4c-.276 0-.5.22-.5.5v14.56l6-4.29 6 4.29V4.5c0-.28-.224-.5-.5-.5h-11z" />
    </svg>
  );
}

function ShareIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M12 2.59l5.7 5.7-1.41 1.42L13 6.41V16h-2V6.41l-3.3 3.3-1.41-1.42L12 2.59zM21 15l-.02 3.51c0 1.38-1.12 2.49-2.5 2.49H5.5C4.11 21 3 19.88 3 18.5V15h2v3.5c0 .28.22.5.5.5h12.98c.28 0 .5-.22.5-.5L19 15h2z" />
    </svg>
  );
}

function TweetCard({ tweet }: { tweet: StuckTweet }) {
  // Generate avatar URL using DiceBear API
  const avatarUrl = `https://api.dicebear.com/7.x/notionists/svg?seed=${tweet.avatarSeed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;

  return (
    <div className="flex-shrink-0 w-[340px] h-[180px] mx-2 p-4 bg-white rounded-2xl border border-[#eff3f4] shadow-sm flex flex-col">
      {/* Header row: Avatar + Name + Handle + Time */}
      <div className="flex items-start gap-3 flex-1 min-h-0">
        {/* Avatar */}
        <img
          src={avatarUrl}
          alt=""
          className="w-10 h-10 rounded-full bg-[#2f3336] shrink-0"
        />

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Name row */}
          <div className="flex items-center gap-1 flex-wrap">
            <span className="font-bold text-[15px] text-[#0f1419] truncate">
              {tweet.displayName}
            </span>
            <span className="text-[15px] text-[#536471] truncate">
              {tweet.handle}
            </span>
            <span className="text-[#536471]">·</span>
            <span className="text-[15px] text-[#536471]">
              {tweet.timestamp}
            </span>
          </div>

          {/* Tweet text */}
          <p className="mt-1 text-[15px] text-[#0f1419] leading-[20px] line-clamp-3">
            {tweet.text}
          </p>
        </div>
      </div>

      {/* Engagement row - always at bottom */}
      <div className="flex items-center justify-between mt-3 pl-[52px]">
        {/* Reply */}
        <button className="group flex items-center gap-1 text-[#536471] hover:text-[#1d9bf0] transition-colors">
          <div className="p-1.5 rounded-full group-hover:bg-[#1d9bf0]/10 transition-colors">
            <ReplyIcon className="w-[18px] h-[18px]" />
          </div>
          <span className="text-[13px]">{tweet.replies}</span>
        </button>

        {/* Retweet */}
        <button className="group flex items-center gap-1 text-[#536471] hover:text-[#00ba7c] transition-colors">
          <div className="p-1.5 rounded-full group-hover:bg-[#00ba7c]/10 transition-colors">
            <RetweetIcon className="w-[18px] h-[18px]" />
          </div>
          <span className="text-[13px]">{tweet.retweets}</span>
        </button>

        {/* Like */}
        <button className="group flex items-center gap-1 text-[#536471] hover:text-[#f91880] transition-colors">
          <div className="p-1.5 rounded-full group-hover:bg-[#f91880]/10 transition-colors">
            <HeartIcon className="w-[18px] h-[18px]" />
          </div>
          <span className="text-[13px]">{tweet.likes}</span>
        </button>

        {/* Views */}
        <button className="group flex items-center gap-1 text-[#536471] hover:text-[#1d9bf0] transition-colors">
          <div className="p-1.5 rounded-full group-hover:bg-[#1d9bf0]/10 transition-colors">
            <ViewsIcon className="w-[18px] h-[18px]" />
          </div>
          <span className="text-[13px]">{tweet.views}</span>
        </button>

        {/* Bookmark & Share */}
        <div className="flex items-center">
          <button className="p-1.5 rounded-full text-[#536471] hover:text-[#1d9bf0] hover:bg-[#1d9bf0]/10 transition-colors">
            <BookmarkIcon className="w-[18px] h-[18px]" />
          </button>
          <button className="p-1.5 rounded-full text-[#536471] hover:text-[#1d9bf0] hover:bg-[#1d9bf0]/10 transition-colors">
            <ShareIcon className="w-[18px] h-[18px]" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function ProblemSection() {
  // Split tweets into two groups for the two rows
  const row1Tweets = STUCK_TWEETS.filter((_, i) => i % 2 === 0);
  const row2Tweets = STUCK_TWEETS.filter((_, i) => i % 2 !== 0);

  return (
    <section className="relative py-20 overflow-hidden bg-[#f7f9f9]">
      {/* Section header */}
      <div className="text-center mb-12 px-6">
        <span className="inline-block text-sm font-medium text-[#1d9bf0] tracking-wide mb-3">
          Sound familiar?
        </span>
        <h2 className="text-3xl sm:text-4xl font-bold text-[#0f1419] tracking-tight">
          You&apos;re not the only one{" "}
          <span className="text-[#1d9bf0]">stuck after launch</span>
        </h2>
        <p className="mt-4 text-lg text-[#536471] max-w-2xl mx-auto">
          Thousands of founders feel this every day. Here&apos;s the difference:
          you&apos;re about to do something about it.
        </p>
      </div>

      {/* Marquee container */}
      <div className="marquee-container space-y-4">
        {/* Row 1 - scrolls left */}
        <div className="flex animate-marquee-left">
          {[...row1Tweets, ...row1Tweets].map((tweet, i) => (
            <TweetCard key={`row1-${tweet.id}-${i}`} tweet={tweet} />
          ))}
        </div>

        {/* Row 2 - scrolls right */}
        <div className="flex animate-marquee-right">
          {[...row2Tweets, ...row2Tweets].map((tweet, i) => (
            <TweetCard key={`row2-${tweet.id}-${i}`} tweet={tweet} />
          ))}
        </div>
      </div>

      {/* Edge fades - match section background */}
      <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#f7f9f9] to-transparent pointer-events-none z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#f7f9f9] to-transparent pointer-events-none z-10" />
    </section>
  );
}
