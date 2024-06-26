import { checkApiLimit, increaseApiLimit } from "@/lib/api-limit";
import { checkSubscription } from "@/lib/subscription";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { CreateChatCompletionRequestMessage } from 'openai/resources/chat/index.mjs';

const openAi = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
})

const instructionMessage: CreateChatCompletionRequestMessage = {
    role: "system",
    content: "You are a code generator. You must answer only in markdown code snippets. Use code comments for explanations."
}

export async function POST(req: Request) {
    try {
        const { userId } = auth()
        const body = await req.json()
        const { messages } = body

        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        if (!openAi.apiKey) {
            return new NextResponse("OpenAi API key not required", { status: 400 })
        }

        if (!messages) {
            return new NextResponse("Message are required", { status: 400 })
        }

        const freeTrial = await checkApiLimit()
        const isPro = await checkSubscription()

        if (!freeTrial && !isPro) {
            return new NextResponse("Free Trial has expired.", { status: 403 })
        }

        const response = await openAi.chat.completions.create({
            model: "gpt-4-turbo",
            messages: [instructionMessage, ...messages],
        })

        if (!isPro) {
            await increaseApiLimit()
        }

        return NextResponse.json(response.choices[0].message)

    } catch (error: any) {
        console.log("Code error", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}