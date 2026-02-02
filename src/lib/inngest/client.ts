import { Inngest, EventSchemas } from "inngest";
import type { RunInput } from "@/lib/ai/types";

// Event types for full type safety
export type Events = {
  "run/created": {
    data: {
      runId: string;
    };
  };
  "run/refinement.requested": {
    data: {
      runId: string;
    };
  };
  "free-audit/created": {
    data: {
      freeAuditId: string;
      input: RunInput;
    };
  };
  "marketing-audit/created": {
    data: {
      auditId: string;
    };
  };
  "target-audience/created": {
    data: {
      resultId: string;
    };
  };
  "landing-page-roaster/created": {
    data: {
      resultId: string;
    };
  };
  "subscription/created": {
    data: {
      subscriptionId: string;
      businessId: string;
      userId: string;
    };
  };
};

// Create the Inngest client with typed events
// This ensures inngest.send() calls are type-checked
export const inngest = new Inngest({
  id: "boost",
  schemas: new EventSchemas().fromRecord<Events>(),
});
