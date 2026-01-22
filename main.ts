import OpenAI from "openai";
import { config } from "dotenv";

config();

//Initializing openAI client
const openai = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY!,
    baseURL: process.env.OPENROUTER_API_BASE_URL || 'https://openrouter.ai/api/v1'
})

const MODEL_NAME = 'nvidia/nemotron-3-nano-30b-a3b:free'

//Define the tools
const tools: OpenAI.Chat.Completions.ChatCompletionTool[] = [
    {
        type: "function",
        function: {
            name: "get_flight_schedule",
            description: "Returns flight schedule and pricing in USD",
            parameters: {
                type: "object",
                properties: {
                    origin: { type: "string" },
                    destination: { type: "string" },
                    tripType: {
                        type: "string",
                        enum: ["one-way", "round-trip"],
                    },
                },
                required: ["origin", "destination", "tripType"],
            },
        },
    },
    {
        type: "function",
        function: {
            name: "get_hotel_booking",
            description: "Returns hotel cost per night in USD",
            parameters: {
                type: "object",
                properties: {
                    city: { type: "string" },
                    nights: { type: "number" },
                },
                required: ["city", "nights"],
            },
        },
    },
    {
        type: "function",
        function: {
            name: "convert_currency",
            description: "Converts an amount from one currency to another",
            parameters: {
                type: "object",
                properties: {
                    amount: { type: "number" },
                    from: { type: "string" },
                    to: { type: "string" },
                },
                required: ["amount", "from", "to"],
            },
        },
    },
];

//flight tool
function getFlightSchedule(origin: string, destination: string, tripType: string) {
    const oneWayDurationHours = 5.5;
    const oneWayCost = 420;

    return {
        origin,
        destination,
        tripType,
        totalFlightTimeHours:
            tripType === "round-trip" ? oneWayDurationHours * 2 : oneWayDurationHours,
        totalCostUSD:
            tripType === "round-trip" ? oneWayCost * 2 : oneWayCost,
    };
}

//hotel tool
function getHotelBooking(city: string, nights: number) {
    const costPerNightUSD = 120;

    return {
        city,
        nights,
        costPerNightUSD,
        totalHotelCostUSD: costPerNightUSD * nights,
    };
}

//currency tool
function convertCurrency(amount: number, from: string, to: string) {
    const rate = 1.0;

    return {
        from,
        to,
        originalAmount: amount,
        convertedAmount: amount * rate,
    };
}

//tool dispatcher
async function executeTool(
    name: string,
    args: Record<string, any>
) {
    switch (name) {
        case "get_flight_schedule":
            return getFlightSchedule(
                args.origin,
                args.destination,
                args.tripType
            );

        case "get_hotel_booking":
            return getHotelBooking(
                args.city,
                args.nights
            );

        case "convert_currency":
            return convertCurrency(
                args.amount,
                args.from,
                args.to
            );

        default:
            throw new Error(`Unknown tool: ${name}`);
    }
}

async function runBookingAgent() {
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        {
            role: "user",
            content:
                "I'm taking a flight from Lagos to Nairobi for a conference. I would like to know the total flight time back and forth, and the total cost of logistics for this conference if I'm staying for three days.",
        },
    ];

    let response = await openai.chat.completions.create({
        model: MODEL_NAME,
        messages: messages,
        tools: tools,
        tool_choice: "auto",
    });

    let responseMessage = response.choices[0].message;
    console.log('Model Response:');
    console.log('Finish Reason:', response.choices[0].finish_reason);

    messages.push(responseMessage);

    if (responseMessage.tool_calls) {
        console.log('\nTools Called:');
        for (const call of responseMessage.tool_calls) {
            if (call.type !== 'function' || !call.function) {
                continue;
            }

            console.log(`\nCalling: ${call.function.name}`);
            console.log(`Arguments:`, JSON.parse(call.function.arguments));


            const result = await executeTool(
                call.function.name,
                JSON.parse(call.function.arguments)
            );

            console.log(`Result:`, result);

            messages.push({
                role: "tool",
                tool_call_id: call.id,
                content: JSON.stringify(result),
            });
        }

        // Final reasoning pass
        response = await openai.chat.completions.create({
            model: 'openai/gpt-4o-mini',
            messages: messages,
        });

        console.log("\nFinal Answer:\n");
        console.log(response.choices[0].message.content);

    } else {
        // No tools were called, just print the response
        console.log('Direct Response:');
        console.log(responseMessage.content);
    }
}

runBookingAgent();
