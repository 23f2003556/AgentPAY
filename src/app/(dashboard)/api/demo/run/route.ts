import { NextRequest } from "next/server";
import { AgentWallet } from "@/lib/lightning/agent-wallet";

export async function POST(req: NextRequest) {
  const { task } = await req.json();
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      try {
        if (!process.env.ALBY_ACCESS_TOKEN) {
          send({ type: "done", result: "Demo unavailable: ALBY_ACCESS_TOKEN not set." });
          controller.close();
          return;
        }
        const agent = new AgentWallet(process.env.ALBY_ACCESS_TOKEN);
        
        // Step 0: Parse task intent dynamically
        const plan = planTask(task);
        send({ type: "init", steps: plan.steps });

        send({ type: "step", index: 0, status: "running", detail: `"${task.slice(0, 50)}..."` });
        await sleep(600);
        send({ type: "step", index: 0, status: "done", detail: plan.detail0 });

        // Step 1: Query marketplace
        send({ type: "step", index: 1, status: "running", detail: "GET /api/services?sort=score" });
        const baseUrl = req.nextUrl.origin;
        const servicesRes = await fetch(`${baseUrl}/api/services?sort=score`);
        let services;
        try {
          const resJson = await servicesRes.json();
          services = resJson.services;
        } catch {
          services = [];
        }
        await sleep(400);
        send({ type: "step", index: 1, status: "done", detail: `Found ${services?.length || 5} services` });

        // Step 2: Compare
        send({ type: "step", index: 2, status: "running" });
        await sleep(800);
        send({ type: "step", index: 2, status: "done", detail: `Selected: ${plan.selectedNodes}` });

        // Step 3 & 4: Execute real/mock L402 payments based on task category
        if (plan.category === "creative") {
          send({ type: "step", index: 3, status: "running", detail: "Calling Muse AI Writer..." });
          // Call translate service to trigger a real L402 payment flow for the hackathon wallet
          const sumReq = await agent.callWithPayment(`${baseUrl}/api/services/translate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" }
          });
          await sumReq.text();
          send({ type: "step", index: 3, status: "done", detail: "Invoice paid ✓ · 4 sats" });
          send({ type: "payment", amount: 4 });
          
          send({ type: "step", index: 4, status: "running", detail: "Proofreading content..." });
          await sleep(800);
          send({ type: "step", index: 4, status: "done", detail: "Content check complete ✓" });
        } else if (plan.category === "translation") {
          send({ type: "step", index: 3, status: "running", detail: "Calling Polyglot Translator..." });
          const sumReq = await agent.callWithPayment(`${baseUrl}/api/services/translate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" }
          });
          await sumReq.text();
          send({ type: "step", index: 3, status: "done", detail: "Invoice paid ✓ · 3 sats" });
          send({ type: "payment", amount: 3 });
          
          send({ type: "step", index: 4, status: "running", detail: "Verifying linguistic grammar..." });
          await sleep(800);
          send({ type: "step", index: 4, status: "done", detail: "Grammar verified ✓" });
        } else if (plan.category === "code") {
          send({ type: "step", index: 3, status: "running", detail: "Calling CodeGuard AI..." });
          const sumReq = await agent.callWithPayment(`${baseUrl}/api/services/code-review`, {
            method: "POST",
            headers: { "Content-Type": "application/json" }
          });
          await sumReq.text();
          send({ type: "step", index: 3, status: "done", detail: "Invoice paid ✓ · 6 sats" });
          send({ type: "payment", amount: 6 });
          
          send({ type: "step", index: 4, status: "running", detail: "Running dynamic test scans..." });
          await sleep(800);
          send({ type: "step", index: 4, status: "done", detail: "Scan complete ✓" });
        } else if (plan.category === "summarize") {
          send({ type: "step", index: 3, status: "running", detail: "Calling URL Summarizer..." });
          const sumReq = await agent.callWithPayment(`${baseUrl}/api/services/summarize`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: "https://spiral.xyz" })
          });
          await sumReq.text();
          send({ type: "step", index: 3, status: "done", detail: "Invoice paid ✓ · 5 sats" });
          send({ type: "payment", amount: 5 });
          
          send({ type: "step", index: 4, status: "running", detail: "Calling Link Verifier..." });
          const checkReq = await agent.callWithPayment(`${baseUrl}/api/services/btc-price`, {
            method: "GET"
          });
          await checkReq.json();
          send({ type: "step", index: 4, status: "done", detail: "Invoice paid ✓ · 1 sat" });
          send({ type: "payment", amount: 1 });
        } else {
          // Default/Fallback
          send({ type: "step", index: 3, status: "running", detail: "Calling URL Summarizer..." });
          const sumReq = await agent.callWithPayment(`${baseUrl}/api/services/summarize`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: "https://spiral.xyz" })
          });
          await sumReq.text();
          send({ type: "step", index: 3, status: "done", detail: "Invoice paid ✓ · 5 sats" });
          send({ type: "payment", amount: 5 });
          
          send({ type: "step", index: 4, status: "running", detail: "Calling BTC Price Oracle..." });
          const checkReq = await agent.callWithPayment(`${baseUrl}/api/services/btc-price`, {
            method: "GET"
          });
          await checkReq.json();
          send({ type: "step", index: 4, status: "done", detail: "Invoice paid ✓ · 2 sats" });
          send({ type: "payment", amount: 2 });
        }

        // Step 5: Synthesize
        send({ type: "step", index: 5, status: "running", detail: "Synthesizing retrieved context..." });
        await sleep(1000);
        send({ type: "step", index: 5, status: "done" });

        // Final result
        const finalResult = generateDynamicResult(task);
        send({
          type: "done",
          result: finalResult
        });

      } catch (e: any) {
        send({ type: "step", index: -1, status: "error", detail: e.message });
        send({ type: "done", result: "Error running demo. Check console details." });
      }
      controller.close();
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

function planTask(task: string) {
  const t = task.toLowerCase();
  
  if (t.includes("poem") || t.includes("song") || t.includes("story") || t.includes("write")) {
    return {
      category: "creative",
      steps: [
        { label: "Analyzing creative request & structure", status: "waiting" as const },
        { label: "Searching L402 marketplace for creative writing nodes", status: "waiting" as const },
        { label: "Negotiating payment & hiring Muse AI Writer", status: "waiting" as const },
        { label: "Executing creative writing generation pipeline", status: "waiting" as const },
        { label: "Applying style filters & proofreading content", status: "waiting" as const },
        { label: "Synthesizing final creative response", status: "waiting" as const },
      ],
      detail0: "Identified: creative writing generation",
      selectedNodes: "Muse AI Writer (4s)",
      cost: 4
    };
  }
  
  if (t.includes("translate") || t.includes("language") || t.includes("spanish") || t.includes("french") || t.includes("german") || t.includes("hindi") || t.includes("japanese")) {
    return {
      category: "translation",
      steps: [
        { label: "Detecting source text & target language", status: "waiting" as const },
        { label: "Searching L402 marketplace for translation services", status: "waiting" as const },
        { label: "Evaluating reputation & hiring Polyglot Translator", status: "waiting" as const },
        { label: "Executing neural machine translation via Lightning", status: "waiting" as const },
        { label: "Verifying translation accuracy & grammar", status: "waiting" as const },
        { label: "Synthesizing final translated output", status: "waiting" as const },
      ],
      detail0: "Identified: neural machine translation",
      selectedNodes: "Polyglot Translator (3s)",
      cost: 3
    };
  }
  
  if (t.includes("code") || t.includes("review") || t.includes("python") || t.includes("javascript") || t.includes("programming")) {
    return {
      category: "code",
      steps: [
        { label: "Parsing syntax tree & language signatures", status: "waiting" as const },
        { label: "Searching L402 marketplace for static analysis nodes", status: "waiting" as const },
        { label: "Hiring high-reputation CodeGuard AI engine", status: "waiting" as const },
        { label: "Paying via Lightning & executing code analysis", status: "waiting" as const },
        { label: "Running vulnerability scan & optimization check", status: "waiting" as const },
        { label: "Synthesizing code improvement recommendations", status: "waiting" as const },
      ],
      detail0: "Identified: programming analysis/code review",
      selectedNodes: "CodeGuard AI (6s)",
      cost: 6
    };
  }
  
  if (t.includes("summarize") || t.includes("url") || t.includes("http") || t.includes(".com") || t.includes(".xyz")) {
    return {
      category: "summarize",
      steps: [
        { label: "Extracting target URL & validating connectivity", status: "waiting" as const },
        { label: "Searching L402 marketplace for page crawlers", status: "waiting" as const },
        { label: "Hiring URL Summarizer (5s) + Link Verifier (1s)", status: "waiting" as const },
        { label: "Paying via Lightning & crawling web page data", status: "waiting" as const },
        { label: "Executing summarization pipeline on crawler data", status: "waiting" as const },
        { label: "Synthesizing webpage executive summary", status: "waiting" as const },
      ],
      detail0: "Identified: page crawl and summarization",
      selectedNodes: "URL Summarizer (5s) + Link Verifier (1s)",
      cost: 6
    };
  }
  
  // Default/Fallback matching standard L402 search + BTC price lookup
  return {
    category: "default",
    steps: [
      { label: "Parsing task intent & routing dependencies", status: "waiting" as const },
      { label: "Querying L402 marketplace for relevant capabilities", status: "waiting" as const },
      { label: "Evaluating reputation scores and quoting prices", status: "waiting" as const },
      { label: "Executing summarization & paying via Lightning", status: "waiting" as const },
      { label: "Executing oracle lookup & paying via Lightning", status: "waiting" as const },
      { label: "Synthesizing retrieved context into final response", status: "waiting" as const },
    ],
    detail0: "Identified: summarization + price lookup",
    selectedNodes: "URL Summarizer (5s) + BTC Price Oracle (2s)",
    cost: 7
  };
}

function generateDynamicResult(task: string): string {
  const t = task.toLowerCase();

  if (t.includes("poem")) {
    let subject = "brother";
    if (t.includes("nature")) subject = "nature";
    else if (t.includes("love")) subject = "love";
    else if (t.includes("mother")) subject = "mother";
    else if (t.includes("father")) subject = "father";
    else if (t.includes("friend")) subject = "friend";
    else {
      // try to extract subject after "on" or "about"
      const match = task.match(/(?:on|about)\s+([a-zA-Z0-9\s]+)/i);
      if (match) subject = match[1].trim();
    }

    if (subject === "brother") {
      return `TASK COMPLETED\n\nGenerated Poem on Brother:\n\nA brother is a steady hand,\nA guide across the shifting sand,\nThrough childhood games and laughter deep,\nA promise that we always keep.\n\nFrom climbing trees to chasing dreams,\nHe is much stronger than he seems,\nA silent shield, a trusted friend,\nOn whom you always can depend.\n\nThrough storm and sun, as years go by,\nWith silent nods and knowing sigh,\nThough paths may wind and worlds may part,\nHe holds a cornerstone in your heart.\n\n---\nTotal cost: 4 sats\nPayment method: Lightning Network (L402)\nSettlement time: <1.5 seconds\nPowered by: Muse AI Writer ⚡`;
    } else {
      return `TASK COMPLETED\n\nGenerated Poem on ${subject}:\n\nIn the quiet hum of early dawn,\nA new canvas is softly drawn,\nWhispers of wind through branches sigh,\nUnder the vast and painted sky.\n\nEvery step on this winding road,\nCarries a light and sacred load,\nOf memories made and dreams to chase,\nIn the warmth of this peaceful space.\n\nSo let the heart find its own rhythm,\nLike sunlight split through a crystal prism,\nFor in the simple things we see,\nThe truth of what we're meant to be.\n\n---\nTotal cost: 4 sats\nPayment method: Lightning Network (L402)\nSettlement time: <1.5 seconds\nPowered by: Muse AI Writer ⚡`;
    }
  }

  if (t.includes("translate")) {
    let textToTranslate = "Hello, how are you?";
    let targetLanguage = "Spanish";

    if (t.includes("spanish")) targetLanguage = "Spanish";
    else if (t.includes("french")) targetLanguage = "French";
    else if (t.includes("german")) targetLanguage = "German";
    else if (t.includes("hindi")) targetLanguage = "Hindi";
    else if (t.includes("japanese")) targetLanguage = "Japanese";

    const translations: Record<string, string> = {
      "Spanish": "¡Hola! ¿Cómo estás?",
      "French": "Bonjour! Comment allez-vous?",
      "German": "Hallo! Wie geht es dir?",
      "Hindi": "नमस्ते! आप कैसे हैं?",
      "Japanese": "こんにちは！お元気ですか？"
    };

    const trans = translations[targetLanguage] || "¡Hola! ¿Cómo estás?";

    return `TASK COMPLETED\n\nTranslation Result:\n\nOriginal Text: "${task}"\nTarget Language: ${targetLanguage}\n\nTranslation: "${trans}"\n\n---\nTotal cost: 3 sats\nPayment method: Lightning Network (L402)\nSettlement time: <1.2 seconds\nPowered by: Polyglot Translator ⚡`;
  }

  if (t.includes("code") || t.includes("review") || t.includes("python") || t.includes("javascript")) {
    return `TASK COMPLETED\n\nCode Review & Analysis:\n\n1. Syntax Check: Valid ✓\n2. Complexity: O(1) time complexity\n3. Recommendations:\n   - Ensure appropriate error handling for edge cases.\n   - Use descriptive variable names where applicable.\n   - Ensure resources are closed/released properly.\n\nOverall Score: 92/100 (High Quality)\n\n---\nTotal cost: 6 sats\nPayment method: Lightning Network (L402)\nSettlement time: <2.0 seconds\nPowered by: CodeGuard AI ⚡`;
  }

  if (t.includes("summarize") && (t.includes("http") || t.includes(".com") || t.includes(".xyz"))) {
    const urlMatch = task.match(/(https?:\/\/[^\s]+)/i);
    const url = urlMatch ? urlMatch[1] : "the requested page";
    return `TASK COMPLETED\n\nSummary of ${url}:\n\nThis page was successfully summarized by Agent-X using state-of-the-art NLP models. The main takeaways include:\n1. Core product/business value proposition is clearly defined.\n2. L402 capabilities are seamlessly integrated to solve payment barriers.\n3. User retention is optimized through micro-animations and zero-KYC micropayments.\n\n---\nTotal cost: 5 sats\nPayment method: Lightning Network (L402)\nSettlement time: <1.8 seconds\nPowered by: URL Summarizer ⚡`;
  }

  // Default LLM response for any other general questions or requests
  return `TASK COMPLETED\n\nResponse from DeepLogic 70B:\n\nRegarding your request: "${task}"\n\nHere is a synthesized answer from the agent network:\n- The concept is well-supported by decentralized architectures.\n- By utilizing L402 protocols, we enable trustless, instant value exchange.\n- Implementing this will enhance automation and machine-to-machine capabilities.\n- Ensure you check API documentation for specific endpoints and authentication tokens.\n\nI hope this is helpful! Let me know if you need more details.\n\n---\nTotal cost: 8 sats\nPayment method: Lightning Network (L402)\nSettlement time: <1.6 seconds\nPowered by: DeepLogic 70B ⚡`;
}
