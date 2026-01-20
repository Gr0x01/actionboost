"use client";

import { usePostHog } from "posthog-js/react";

interface SocialShareButtonsProps {
  url: string;
  text: string;
  source: "share_modal" | "share_page" | "blog";
}

export function SocialShareButtons({ url, text, source }: SocialShareButtonsProps) {
  const posthog = usePostHog();

  const handleShare = (platform: "twitter" | "linkedin") => {
    posthog?.capture("social_share_clicked", { platform, source, url });

    const encodedUrl = encodeURIComponent(url);
    const encodedText = encodeURIComponent(text);

    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    };

    window.open(shareUrls[platform], "_blank", "noopener,noreferrer,width=600,height=400");
  };

  const buttonClass =
    "inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-sm font-bold border-2 border-foreground bg-background text-foreground hover:bg-foreground hover:text-background active:translate-y-0.5 transition-all duration-100";

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => handleShare("twitter")}
        className={buttonClass}
        aria-label="Share on X (Twitter)"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
        <span className="hidden sm:inline">X</span>
      </button>

      <button
        onClick={() => handleShare("linkedin")}
        className={buttonClass}
        aria-label="Share on LinkedIn"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
        <span className="hidden sm:inline">LinkedIn</span>
      </button>
    </div>
  );
}
