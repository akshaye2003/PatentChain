import { fal } from "@fal-ai/serverless-client"

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json()

    if (!prompt || typeof prompt !== "string") {
      return Response.json({ error: "prompt is required" }, { status: 400 })
    }

    if (!process.env.FAL_KEY) {
      return Response.json({ error: "FAL_KEY not configured" }, { status: 500 })
    }

    fal.config({ credentials: process.env.FAL_KEY })

    // Using a lightweight SDXL model on FAL
    const result = await fal.subscribe("fal-ai/flux-lora", {
      input: {
        prompt,
        num_images: 2,
        image_size: "square",
        guidance_scale: 4.5,
        num_inference_steps: 28,
        seed: Math.floor(Math.random() * 1000000),
      },
      logs: false,
    })

    const images = (result?.images || []).map((img: any) => img.url).filter(Boolean)

    return Response.json({ images })
  } catch (error) {
    console.error("[generate-image]", error)
    const message = error instanceof Error ? error.message : "failed to generate image"
    return Response.json({ error: message }, { status: 500 })
  }
}


