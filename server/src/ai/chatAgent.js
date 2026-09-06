import prisma from '../config/prisma.js';
import { getFlashModel, withRetry } from '../config/gemini.js';
import { schedulingToolDeclarations, executeToolCall } from './tools.js';

const MAX_TOOL_ITERATIONS = 3;

/**
 * AI Conversational Schedule & Task Agent
 *
 * Orchestration loop:
 * 1. Prepares system instructions with faculty context and current date
 * 2. Starts a Gemini chat session configured with scheduling function declarations
 * 3. Enforces MAX_TOOL_ITERATIONS = 3 tool roundtrips
 * 4. Executes requested tools against Prisma via executeToolCall
 * 5. Returns final conversational reply and array of executed tool calls
 *
 * @param {object} params
 * @param {string} params.message - User prompt
 * @param {string} params.facultyId - Faculty ID context (e.g. "fac-001")
 * @param {string} [params.currentDate] - Current date context YYYY-MM-DD
 * @param {Array} [params.history] - Prior chat history messages
 * @returns {Promise<{ reply: string, toolCalls: Array }>}
 */
export async function processChatMessage({
  message,
  facultyId,
  currentDate = '2026-09-06',
  history = [],
}) {
  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    throw new Error('Message is required');
  }

  // 1. Fetch faculty context
  let facultyInfo = { name: 'Faculty Member', designation: 'Professor' };
  if (facultyId) {
    const faculty = await prisma.faculty.findUnique({
      where: { id: facultyId },
      select: { name: true, designation: true },
    });
    if (faculty) {
      facultyInfo = faculty;
    }
  }

  // 2. System prompt
  const systemInstruction = `You are ScholarSync AI, an intelligent scheduling and task assistant for university faculty.
You are assisting ${facultyInfo.name} (${facultyInfo.designation}, ID: ${facultyId || 'unknown'}).
Today's date is ${currentDate}.

Domain Rules:
1. Bangladesh Academic Week: Classes and university schedules occur Sunday through Thursday (SUN, MON, TUE, WED, THU).
2. Friday and Saturday (FRI, SAT) are the academic weekend with no regular class periods.
3. You have access to scheduling tools:
   - get_schedule(facultyId, date): inspect class slots (free and busy), tasks, and bookings.
   - find_free_slot(facultyId, date, durationMinutes): find available open gaps between classes and commitments.
   - create_task(facultyId, title, startTime, endTime, description): create a new scheduled task/block on the calendar.
   - update_task(taskId, title, startTime, endTime, status, description): update or modify an existing task.
   - delete_task(taskId): remove a task.
4. When asked to schedule something, check or find an appropriate free time slot first, then call create_task.
5. Provide clear, concise, and helpful responses. When confirming appointments or tasks, state the exact day and time.
6. When referencing facultyId in tool calls, use "${facultyId}". Always format dates as YYYY-MM-DD and times as ISO-8601 strings (e.g., "${currentDate}T10:00:00Z").`;

  // 3. Format history for Gemini chat
  const formattedHistory = [];
  if (Array.isArray(history) && history.length > 0) {
    for (const item of history) {
      if (item.sender === 'user' || item.role === 'user') {
        formattedHistory.push({
          role: 'user',
          parts: [{ text: item.text || item.message || '' }],
        });
      } else if (
        item.sender === 'ai' ||
        item.sender === 'bot' ||
        item.role === 'model' ||
        item.role === 'assistant'
      ) {
        formattedHistory.push({
          role: 'model',
          parts: [{ text: item.text || item.message || item.reply || '' }],
        });
      }
    }
  }

  // 4. Initialize Gemini Chat
  const model = getFlashModel({
    systemInstruction,
    tools: [
      {
        functionDeclarations: schedulingToolDeclarations,
      },
    ],
  });

  const chat = model.startChat({
    history: formattedHistory,
  });

  const executedTools = [];
  let iteration = 0;

  // Initial user message
  let currentResponse = await withRetry(async () => {
    return await chat.sendMessage(message.trim());
  });

  // Orchestration tool loop capped at MAX_TOOL_ITERATIONS
  while (iteration < MAX_TOOL_ITERATIONS) {
    const functionCalls = currentResponse.response.functionCalls();

    // If no function call, model generated its final text response
    if (!functionCalls || functionCalls.length === 0) {
      break;
    }

    iteration++;
    const toolResponses = [];

    for (const call of functionCalls) {
      const toolName = call.name;
      const toolArgs = call.args || {};

      // Ensure facultyId defaults to current faculty if omitted
      if (!toolArgs.facultyId && facultyId) {
        toolArgs.facultyId = facultyId;
      }
      if (!toolArgs.date) {
        toolArgs.date = currentDate;
      }

      console.log(`[ChatAgent] Iteration ${iteration}: Executing tool "${toolName}" with args:`, toolArgs);

      const toolResult = await executeToolCall(toolName, toolArgs);

      executedTools.push({
        iteration,
        name: toolName,
        args: toolArgs,
        result: toolResult,
      });

      toolResponses.push({
        functionResponse: {
          name: toolName,
          response: toolResult,
        },
      });
    }

    // Send tool execution results back to Gemini
    currentResponse = await withRetry(async () => {
      return await chat.sendMessage(toolResponses);
    });
  }

  // If exceeded max iterations, return graceful clarification
  if (iteration >= MAX_TOOL_ITERATIONS && currentResponse.response.functionCalls()?.length > 0) {
    return {
      reply: 'I have checked your schedule and processed the available details. Could you please clarify or confirm the exact action you would like me to finalize?',
      toolCalls: executedTools,
    };
  }

  const finalReply = currentResponse.response.text();

  return {
    reply: finalReply,
    toolCalls: executedTools,
  };
}
