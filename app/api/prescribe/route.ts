import { NextRequest, NextResponse } from "next/server";
import { Metrics } from "@/types/metrics";
import { fallbackPrescription, Prescription } from "@/lib/prescription";
import Anthropic from "@anthropic-ai/sdk";

// In-memory cache for warm serverless instances
const prescriptionCache = new Map<string, Prescription>();

export async function POST(req: NextRequest) {
  let metrics: Metrics | null = null;
  let city: string | undefined = undefined;

  try {
    const body = await req.json();
    metrics = body?.metrics;
    city = body?.city;
  } catch {
    return NextResponse.json({ error: "Malformed JSON request body" }, { status: 400 });
  }

  // Strict validation: Reject missing/invalid metrics payload with 400 Bad Request
  if (
    !metrics ||
    typeof metrics.upliftC !== "number" ||
    typeof metrics.grade !== "string" ||
    !metrics.ground
  ) {
    return NextResponse.json(
      { error: "Invalid or missing metrics payload in request body" },
      { status: 400 }
    );
  }

  // Cache key based on rounded metrics
  const cacheKey = `${metrics.grade}_${metrics.upliftC.toFixed(1)}_${metrics.treesNeeded}_${city || "default"}`;
  if (prescriptionCache.has(cacheKey)) {
    return NextResponse.json(prescriptionCache.get(cacheKey)!);
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    // Deterministic template fallback when API key is not configured
    const templateResult = fallbackPrescription(metrics, city);
    return NextResponse.json(templateResult);
  }

  // Prepare prompt with strict numeric data (0 bytes of image data)
  const anthropic = new Anthropic({
    apiKey,
    timeout: 7000,
    maxRetries: 0,
  });

  const prompt = `You are an expert municipal urban forester and climate resilience planner advising a resident advocacy group.
Street Scan Metrics:
- Current Grade: ${metrics.grade}
- Estimated Afternoon Surface Heat Uplift: +${metrics.upliftC.toFixed(1)} °C vs shaded baseline
- Green View Index (GVI): ${(metrics.gvi * 100).toFixed(1)} %
- Ground Paved (Impervious): ${Math.round((metrics.ground.PAVED || 0) * 100)} %
- Ground Built Structure: ${Math.round((metrics.ground.BUILT || 0) * 100)} %
- Ground Existing Canopy: ${Math.round((metrics.ground.CANOPY || 0) * 100)} %
- Target Trees Needed for Grade B: ${metrics.treesNeeded} mature canopy trees (+${metrics.canopyGapPp.toFixed(1)}% canopy cover)
${city ? `- Municipality Context: ${city}` : ""}

Task: Return a realistic, highly specific municipal cooling prescription.
CRITICAL CONSTRAINT: Do not invent new measurements or temperatures not given above. Use the exact numbers provided.

Respond ONLY with valid raw JSON in this format:
{
  "headline": "Short impactful headline with the grade and °C",
  "steps": ["Action step 1", "Action step 2", "Action step 3"],
  "species": ["Species name 1 (trait/benefit)", "Species name 2 (trait/benefit)", "Species name 3 (trait/benefit)"],
  "costEstimate": "$X,XXX – $X,XXX (description)",
  "projectedGrade": "B",
  "caveat": "One sentence stating model assumption"
}`;

  // Hard 7.5-second timeout controller wired to client abort signal
  const controller = new AbortController();
  let timeoutId: NodeJS.Timeout | null = null;

  if (req.signal) {
    req.signal.addEventListener("abort", () => controller.abort());
  }

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      controller.abort();
      reject(new Error("Anthropic API request exceeded 7500ms timeout limit"));
    }, 7500);
  });

  try {
    const apiPromise = anthropic.messages.create(
      {
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 700,
        messages: [{ role: "user", content: prompt }],
      },
      {
        signal: controller.signal,
        timeout: 7000,
        maxRetries: 0,
      }
    );

    const message = await Promise.race([apiPromise, timeoutPromise]);
    if (timeoutId) clearTimeout(timeoutId);

    const content = message.content[0];
    if (content && content.type === "text") {
      let jsonText = content.text.trim();
      if (jsonText.includes("{")) {
        const startIdx = jsonText.indexOf("{");
        const endIdx = jsonText.lastIndexOf("}");
        if (startIdx >= 0 && endIdx >= startIdx) {
          jsonText = jsonText.substring(startIdx, endIdx + 1);
        }
      }

      const parsed = JSON.parse(jsonText);
      const result: Prescription = {
        headline: parsed.headline || `Street Cooling Action Plan (Grade ${metrics.grade})`,
        steps: Array.isArray(parsed.steps) ? parsed.steps : [],
        species: Array.isArray(parsed.species) ? parsed.species : [],
        costEstimate: parsed.costEstimate || `$${(metrics.treesNeeded * 500).toLocaleString()}`,
        projectedGrade: parsed.projectedGrade || "B",
        caveat: parsed.caveat || "Estimates based on standard urban forestry planting indices.",
        source: "claude",
      };

      prescriptionCache.set(cacheKey, result);
      return NextResponse.json(result);
    }
  } catch (apiErr) {
    if (timeoutId) clearTimeout(timeoutId);
    console.warn("Anthropic API call timed out or failed, using deterministic fallback:", apiErr);
  }

  // When Anthropic API times out or fails, deterministic template always succeeds
  const fallback = fallbackPrescription(metrics, city);
  return NextResponse.json(fallback);
}
