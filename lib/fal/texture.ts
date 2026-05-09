import { fal } from "@fal-ai/client";
import type { ModeKey } from "@/lib/modes/catalog";
import { describeModeForFal } from "@/lib/modes/fal-mood";

export async function generateBackgroundTexture(input: {
  primaryColor: string;
  secondaryColor: string;
  modeKey: ModeKey;
}): Promise<Buffer> {
  const key = process.env.FAL_KEY;
  if (!key) {
    throw new Error("FAL_KEY is not set");
  }

  fal.config({ credentials: key });

  const mood = describeModeForFal(input.modeKey);
  const prompt = [
    "Full frame abstract background for Instagram carousel slide, portrait 4:5 composition.",
    "Absolutely no text, no letters, no numbers, no logos, no watermarks, no UI, no interface.",
    `Brand palette anchored on ${input.primaryColor} and ${input.secondaryColor}, cohesive gradients and soft shapes.`,
    `Visual direction: ${mood}.`,
    "Sharp, commercial photography energy, no people, no hands.",
  ].join(" ");

  const result = await fal.subscribe("fal-ai/flux/schnell", {
    input: {
      prompt,
      image_size: "portrait_4_3",
      num_inference_steps: 4,
      output_format: "jpeg",
      enable_safety_checker: true,
    },
  });

  const url = result.data.images?.[0]?.url;
  if (!url) {
    throw new Error("fal.ai did not return an image URL");
  }

  const imgRes = await fetch(url);
  if (!imgRes.ok) {
    throw new Error(`Failed to download fal image: ${imgRes.status}`);
  }

  return Buffer.from(await imgRes.arrayBuffer());
}
