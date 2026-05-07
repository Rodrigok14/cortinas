import { NextResponse } from "next/server";
import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { aiPostSchema } from "@/modules/ai/schemas/api";
import { buildSystemPrompt } from "@/modules/ai/prompts/system-prompt";
import { ensureOrganizationForUser } from "@/modules/ai/services/org";
import { pickAgentInstructions } from "@/modules/ai/services/intent-router";
import { buildAiTools } from "@/modules/ai/tools";
import { createConversation, getConversationById, insertMessage, listConversationMessages } from "@/modules/ai/queries/conversations";
import type { AiServerContext } from "@/modules/ai/types/context";

export const runtime = "nodejs";

async function requireApiUser() {
  const supabase = getSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error) throw new Error(error.message);
  if (!user) return null;

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profileError) throw new Error(profileError.message);

  return { userId: user.id, role: (profile?.role as string) ?? "vendedor" };
}

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const input = aiPostSchema.parse(json);

    const user = await requireApiUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { organizationId, organizationName } = await ensureOrganizationForUser(user.userId);

    const ctx: AiServerContext = {
      ...input.context,
      currentUserId: user.userId,
      organizationId,
      role: user.role,
    };

    const agentInstructions = pickAgentInstructions({ message: input.message, context: ctx });
    const system = [buildSystemPrompt({ orgName: organizationName, role: user.role }), "", agentInstructions].join("\n");

    const conversation = input.conversationId
      ? await getConversationById(input.conversationId)
      : await createConversation({ organizationId, userId: user.userId });

    await insertMessage({
      organizationId,
      conversationId: conversation.id,
      role: "user",
      content: input.message,
      metadata: { context: input.context },
    });

    const history = await listConversationMessages(conversation.id, 30);
    const messages = history
      .filter((m) => m.role === "user" || m.role === "assistant")
      .map((m) => ({ role: m.role, content: m.content })) as Array<{ role: "user" | "assistant"; content: string }>;

    const tools = buildAiTools({ organizationId, userId: user.userId });

    const result = streamText({
      model: openai("gpt-4.1-mini"),
      system,
      messages,
      tools,
      onFinish: async ({ text, usage }) => {
        await insertMessage({
          organizationId,
          conversationId: conversation.id,
          role: "assistant",
          content: text,
          metadata: {
            usage,
          },
        });
      },
    });

    return result.toTextStreamResponse({
      headers: {
        "x-ai-conversation-id": conversation.id,
      },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

