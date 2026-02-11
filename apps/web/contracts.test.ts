import { describe, expect, it } from "vitest";
import { createIssueSchema } from "@hive/shared";

describe("shared contracts", () => {
  it("validates issue creation payload", () => {
    const parsed = createIssueSchema.parse({
      title: "Test",
      description: "Details",
      category: "Maintenance & Facilities",
    });

    expect(parsed.title).toBe("Test");
  });
});
