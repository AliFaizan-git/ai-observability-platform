// 1. Use clean ESM import syntax for your package
// ✅ New Default Import
import Tracer from 'ali-ai-agent-tracer';
async function runSystemIntegrationTest() {
  console.log("🚀 Starting Full Backend Integration Test...");

  // Initialize your custom telemetry Tracer SDK
const tracer = new Tracer({
    apiKey: 'ak_test_123456789012abcdefghijklmnopqrstuvwxyz1234', 
    baseUrl: 'http://localhost:5000' 
  });
  
  const promptText = "Explain the difference between SQL and NoSQL databases in one sentence.";
  const messagesPayload = [{ role: 'user', content: promptText }];

  console.log("\n📡 Sending simulated LLM request through tracer wrapper...");

  try {
    const tracedResponse = await tracer.trace({
      fn: async () => {
        await new Promise(resolve => setTimeout(resolve, 300));
        return {
          response: {
            text: () => "SQL databases are structured and table-based, while NoSQL databases are unstructured and document-based."
          }
        };
      },
      model: 'gemini-1.5-flash-simulated',
      messages: messagesPayload,
      tags: ['test-suite', 'integration-debug'],
      metadata: { environment: 'local-test' }
    });

    console.log("✅ Simulated LLM response successfully captured by SDK wrapper!");
    console.log(`🤖 Model Output: "${tracedResponse.response.text()}"`);
    console.log("\n⚡ Ingestion payload fired asynchronously. Check your server terminal window logs to observe the evaluation worker running!");

  } catch (error) {
    console.error("❌ Test pipeline failed during execution:", error.message);
  }
}

runSystemIntegrationTest();