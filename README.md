# AI Booking Agent with Function Calling

## Overview

This project demonstrates how to build an AI-powered booking agent using function calling (also known as tool use). The agent can intelligently interact with multiple tools to help users plan trips by calculating flight costs, hotel expenses, and currency conversions - all through natural language conversation.

## What It Does

The booking agent accepts a natural language query like:
> "I'm taking a flight from Lagos to Nairobi for a conference. I would like to know the total flight time back and forth, and the total cost of logistics for this conference if I'm staying for three days."

The agent then:
1. **Understands the request** - Parses what information is needed (flight details, hotel booking)
2. **Calls the right tools** - Automatically invokes `get_flight_schedule` and `get_hotel_booking` with the correct parameters
3. **Processes the results** - Combines data from multiple tool calls
4. **Provides a comprehensive answer** - Returns total flight time and complete cost breakdown

## Available Tools

The agent has access to three tools:

### 1. `get_flight_schedule`
Returns flight duration and pricing for one-way or round-trip flights.

**Parameters:**
- `origin` - Departure city
- `destination` - Arrival city  
- `tripType` - Either "one-way" or "round-trip"

### 2. `get_hotel_booking`
Calculates hotel accommodation costs based on number of nights.

**Parameters:**
- `city` - Hotel location
- `nights` - Number of nights to stay

### 3. `convert_currency`
Converts amounts between different currencies.

**Parameters:**
- `amount` - Amount to convert
- `from` - Source currency code
- `to` - Target currency code

## Technical Approach

### 1. **Tool Definition**
Each tool is defined using OpenAI's function calling schema, which tells the LLM:
- What the function does (description)
- What parameters it accepts (with types and requirements)
- What values are valid (using enums where applicable)

```typescript
const tools: OpenAI.Chat.Completions.ChatCompletionTool[] = [
    {
        type: "function",
        function: {
            name: "get_flight_schedule",
            description: "Returns flight schedule and pricing in USD",
            parameters: { /* schema */ }
        }
    },
    // ... more tools
]
```

### 2. **Agentic Workflow**
The agent follows a multi-step reasoning process:

1. **Initial Request** - User query is sent to the LLM with available tools
2. **Tool Selection** - LLM decides which tools to call and with what arguments
3. **Tool Execution** - The selected tools run and return results
4. **Result Integration** - Tool outputs are fed back to the LLM
5. **Final Response** - LLM synthesizes all information into a natural language answer

### 3. **Two-Model Approach**
- **Nvidia Nemotron** for initial tool calling (lightweight and efficient)
- **GPT-4o-mini** for final answer generation (better at natural language synthesis)

This hybrid approach balances cost and quality.

### 4. **Message History Management**
The conversation maintains a complete message history including:
- User messages
- Assistant responses (including tool calls)
- Tool results

This ensures the LLM has full context when generating the final answer.

## Why This Is Helpful

### For Learning
- **Understand Function Calling**: See how LLMs can interact with external functions/APIs
- **Observe Agentic Behavior**: Watch how the AI decides which tools to use and in what order
- **Message Flow**: Learn how conversation context is maintained across multiple turns
- **Tool Design**: Understand how to structure tool definitions for optimal LLM usage

### For Real-World Applications
This pattern is the foundation for:
- **Travel booking assistants** that interact with real flight/hotel APIs
- **E-commerce agents** that search products and process orders
- **Data analysis tools** that query databases and visualize results
- **Customer service bots** that look up account information and make updates

The same architecture scales from simple mock functions (like this project) to complex production systems with dozens of tools.

## How It Works (Step-by-Step)

1. User sends a natural language query
2. Query is sent to the LLM along with tool definitions
3. LLM analyzes the query and determines it needs flight and hotel information
4. LLM generates tool calls with extracted parameters:
   - `get_flight_schedule("Lagos", "Nairobi", "round-trip")`
   - `get_hotel_booking("Nairobi", 3)`
5. Tools execute and return mock data
6. Results are appended to the conversation
7. A second LLM call synthesizes all information into a coherent answer
8. User receives: "Your round-trip flight will take 11 hours total and cost $840. With 3 nights accommodation at $120/night ($360), your total conference logistics cost is $1,200."

## Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn
- An OpenRouter API key (get one at [openrouter.ai](https://openrouter.ai))

## Setup & Installation

### 1. Clone and Install Dependencies

```bash
# Install all dependencies
npm install
```

**Dependencies:**
- `openai` - OpenAI SDK (works with OpenRouter)
- `dotenv` - Environment variable management

**Dev Dependencies:**
- `typescript` - TypeScript compiler
- `ts-node` - Run TypeScript files directly
- `@types/node` - TypeScript definitions for Node.js

### 2. Configure Environment Variables

Create a `.env` file in the project root:

```bash
OPENROUTER_API_KEY=your_api_key_here
OPENROUTER_API_BASE_URL=https://openrouter.ai/api/v1
```

**Getting your API key:**
1. Visit [openrouter.ai](https://openrouter.ai)
2. Sign up or log in
3. Navigate to API Keys section
4. Generate a new key
5. Copy it to your `.env` file

### 3. TypeScript Configuration

The project uses TypeScript with ES modules. Make sure your `tsconfig.json` includes:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true
  }
}
```

### 4. Run the Agent

```bash
# Run with ts-node
npx ts-node main.ts

# Or add to package.json scripts:
# "dev": "ts-node main.ts"
```

## Project Structure

```
tools-llm/
├── main.ts           # Main agent code
├── .env              # Environment variables (don't commit!)
├── .gitignore        # Git ignore file
├── package.json      # Dependencies and scripts
├── package-lock.json # Auto-generated dependency lock file
└── README.md         # This file
```

## Key Takeaways

- **Function calling bridges AI and traditional programming** - LLMs can now trigger real code
- **Tool design matters** - Clear descriptions and well-structured parameters help the LLM make better decisions
- **Agentic systems chain multiple operations** - The LLM orchestrates complex workflows automatically
- **Context management is crucial** - Maintaining conversation history ensures coherent multi-step reasoning

## Future Enhancements

- Add conversation loops for follow-up questions
- Implement real API integrations (flight search, hotel booking)
- Add error handling and validation
- Support more currencies with live exchange rates
- Include date/time handling for specific booking dates
- Add more tools (car rentals, activity booking, weather checks)

# Project

Created with Forjex CLI
