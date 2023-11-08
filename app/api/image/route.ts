import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import OpenAI from "openai";

import { checkApiLimit, increaseApiLimit } from "@/lib/api-limit";
import { checkSubscription } from "@/lib/subscription";

const openAi = new OpenAI({
    apiKey:process.env.OPENAI_API_KEY
})

export async function POST(req:Request) {
    try{
        const { userId } = auth()
        const body = await req.json()
        const { prompt, amount = 1, resolution = "512x512" } = body

        if(!userId){
            return new NextResponse("Unauthorized",{ status: 401})
        }

        if(!openAi.apiKey){
            return new NextResponse("OpenAi API key not required", {status: 400})
        }

        if(!prompt){
            return new NextResponse("Promps is required",{status:400})
        }

        const freeTrial = await checkApiLimit()
        const isPro = await checkSubscription()

        if(!freeTrial && !isPro){
            return new NextResponse("Free Trial has expired.",{status: 403})
        }

        const response = await openAi.images.generate({
            prompt,
            n: parseInt(amount, 10),
            size: resolution
        });

        if(!isPro){
            await increaseApiLimit()
        }

        return NextResponse.json(response.data)

    }catch(error: any){
        console.log("Image error",error)
        return new NextResponse("Internal Error",{status:500})
    }
}