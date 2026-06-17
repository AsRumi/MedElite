import { NextRequest, NextResponse } from "next/server";
import { fetchFacilityByCcn, NotFoundError } from "@/lib/cms";

export async function GET(req: NextRequest) {
  const ccn = req.nextUrl.searchParams.get("ccn")?.trim() ?? "";

  if (!ccn) {
    return NextResponse.json(
      { error: "Missing required parameter: ccn" },
      { status: 400 }
    );
  }

  try {
    const data = await fetchFacilityByCcn(ccn);
    return NextResponse.json({ data });
  } catch (err) {
    if (err instanceof NotFoundError) {
      return NextResponse.json({ error: err.message }, { status: 404 });
    }
    console.error("CMS fetch error:", err);
    return NextResponse.json(
      { error: "Failed to fetch facility data. Please try again." },
      { status: 502 }
    );
  }
}
