import { NextRequest, NextResponse } from "next/server";
import { db } from "@/src/lib/db";
import { hashApiKey } from "@/src/lib/security";



export async function GET(request: NextRequest) {
    try {
        //1 Extract x-api-key header from incoming request
        const apiKeyHeader = request.headers.get("x-api-key");

        if (!apiKeyHeader) {
            return NextResponse.json(
                { error: "Unauthorized: Missing 'x-api-key' header" },
                { status: 401 }
            );
        }
        //2 Hash the incoming API key to search in the db 
        const incomingKeyHash = hashApiKey(apiKeyHeader);

        // 3. Find matching active key in Database
        const apiKeyRecord = await db.apiKey.findUnique({
            where: { keyHash: incomingKeyHash },
            include: { user: true },
        });

        if (!apiKeyRecord || !apiKeyRecord.isActive) {
            return NextResponse.json(
                { error: "Unauthorized: Invalid or revoked API key" },
                { status: 401 }
            );
        }

        //4 Rate limiting check: Max 5 request per minute

        const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
        const recentRequestCount = await db.apiLog.count({
            where: {
                apiKeyId: apiKeyRecord.id,
                createdAt: { gte: oneMinuteAgo },
            },
        });

        if (recentRequestCount >= 5) {
            // Record rate-limit error log (Status 429)
            await db.apiLog.create({
                data: {
                    apiKeyId: apiKeyRecord.id,
                    endpoint: "/api/v1/data",
                    status: 429,
                },
            });

            return NextResponse.json(
                { error: "Rate Limit Exceeded: Max 5 requests per minute allowed." },
                { status: 429 }
            );
        }

        // 5. Success! Record successful API call log (Status 200)
        await db.apiLog.create({
            data: {
                apiKeyId: apiKeyRecord.id,
                endpoint: "/api/v1/data",
                status: 200,
            },
        });

        // 6 Return data response 
        return NextResponse.json({
            message: "Access Granted! Welcome to NexusEngine Protected API.",
            owner: apiKeyRecord.user.name,
            keyNickname: apiKeyRecord.name,
            timeStamp: new Date().toString(),
        },
            { status: 200 }
        );
    } catch (error) {
        console.log("API Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        )

    }
}