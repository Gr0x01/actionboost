import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #E67E22 0%, #D4A574 100%)",
          borderRadius: "102px",
        }}
      >
        <svg width="280" height="280" viewBox="0 0 24 24" fill="none">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="white" />
        </svg>
      </div>
    ),
    { width: 512, height: 512 }
  );
}
