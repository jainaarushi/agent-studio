import { tool } from "ai";
import { z } from "zod";

export function createCalculatorTool() {
  return tool({
    description:
      "Perform mathematical calculations. Supports basic arithmetic, percentages, exponents, and common financial formulas. Use this for precise number crunching.",
    parameters: z.object({
      expression: z
        .string()
        .describe(
          "Math expression to evaluate. Examples: '1500 * 12 * 0.07', '(500000 * 0.04) / 12', '100000 * Math.pow(1.08, 10)'"
        ),
      label: z
        .string()
        .optional()
        .describe("A label for this calculation (e.g., 'Monthly mortgage payment')"),
    }),
    execute: async ({ expression, label }) => {
      try {
        // Sanitize: only allow safe math characters and Math functions
        const sanitized = expression.replace(/[^0-9+\-*/().,%\s^eE]/g, (match) => {
          // Allow Math.xxx functions
          if (/[a-zA-Z.]/.test(match)) return match;
          return "";
        });

        // Validate no dangerous patterns
        if (/import|require|eval|Function|process|global|window|document/.test(expression)) {
          return { error: "Invalid expression: contains disallowed keywords" };
        }

        // Replace common patterns
        const prepared = sanitized
          .replace(/\^/g, "**") // caret to exponent
          .replace(/(\d)%/g, "$1/100"); // percentage

        // Evaluate using Function (sandboxed to Math only)
        const fn = new Function(
          "Math",
          `"use strict"; return (${prepared});`
        );
        const result = fn(Math);

        if (typeof result !== "number" || !isFinite(result)) {
          return { error: "Expression did not produce a valid number" };
        }

        return {
          expression,
          result: Number(result.toFixed(6)),
          formatted: result.toLocaleString("en-US", {
            maximumFractionDigits: 2,
          }),
          ...(label ? { label } : {}),
        };
      } catch (err) {
        return {
          error: `Calculation failed: ${err instanceof Error ? err.message : "Invalid expression"}`,
        };
      }
    },
  });
}
