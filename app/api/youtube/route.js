import { NextResponse } from "next/server";
import { runWorkFlow } from "./workflow";

export async function GET() {
    try {
        const result = await runWorkFlow("startThubnailGeneration");

        return Response.json({
            status: "success",
            ...result,
        });

    } catch (error) {
        console.log(error);

        return Response.json(
            {
                status: "error",
                error: err.message,
            },
            { status: 500 }
        );
    }
}