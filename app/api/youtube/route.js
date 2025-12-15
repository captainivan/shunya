import { runWorkFlow } from "./workflow";

export async function POST() {
  try {
    // 🔥 Do NOT await the workflow
    runWorkFlow("startSubtitlesGeneration");

    // Respond immediately to avoid retries
    return Response.json({
      status: "started",
      message: "Workflow started successfully",
    });
  } catch (error) {
    console.error("❌ Failed to start workflow:", error);

    return Response.json(
      {
        status: "error",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
