import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";
import { functions } from "@/lib/inngest/functions";

// Serve the Inngest functions
// This endpoint is called by Inngest to execute your functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions,
});
