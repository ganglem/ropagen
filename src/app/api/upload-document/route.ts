import {NextRequest, NextResponse} from "next/server";
import {sql} from "@/lib/db";

export async function POST(request: NextRequest) {
    try {
        const { userId, aiMode, markdownDocument } = await request.json();

        console.log('iNPUTS', { userId, aiMode, markdownDocument });

        const result = await sql(
            `INSERT INTO Documents (user_id, ai_mode, document) VALUES ($1, $2, $3)`,
            [userId, aiMode, markdownDocument]
        )

        console.log("Record inserted:", result);

        return NextResponse.next()

    } catch (error) {
        console.error('Could not upload document', error);
        return NextResponse.json(
            { error: 'Failed to upload document' },
            { status: 500 }
        );
    }
}