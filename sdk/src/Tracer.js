import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

class Tracer {
  constructor({ apiKey, baseUrl = 'http://localhost:5000', sessionId = null } = {}) {
    if (!apiKey) throw new Error('Tracer requires an apiKey to initialize');
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
    this.sessionId = sessionId || uuidv4();
  }

  /**
   * Wraps an LLM call function, tracks timing metadata, and relays telemetry.
   */
  async trace({ fn, model, messages, tags = [], metadata = {}, experimentId = null, variantId = null }) {
    const startTime = Date.now();
    let result;

    try {
      // 1. Execute the actual LLM function passed by the developer
      result = await fn();
      const latencyMs = Date.now() - startTime;

      // 2. Safely parse the response depending on whether they used Gemini or OpenAI structures
      let responseText = '';
      let promptTokens = 0;
      let completionTokens = 0;
      let totalTokens = 0;

      if (result.response?.text) {
        // Standard Google Gemini structure
        responseText = result.response.text();
        promptTokens = result.response.usageMetadata?.promptTokenCount || 0;
        completionTokens = result.response.usageMetadata?.candidatesTokenCount || 0;
        totalTokens = result.response.usageMetadata?.totalTokenCount || 0;
      } else if (result.choices?.[0]?.message?.content) {
        // Standard OpenAI structure
        responseText = result.choices[0].message.content;
        promptTokens = result.usage?.prompt_tokens || 0;
        completionTokens = result.usage?.completion_tokens || 0;
        totalTokens = result.usage?.total_tokens || 0;
      } else {
        // Fallback string capture
        responseText = typeof result === 'string' ? result : JSON.stringify(result);
      }

      // 3. Assemble the observability payload
      const payload = {
        provider: this._detectProvider(model),
        model,
        messages,
        response: responseText,
        latencyMs,
        promptTokens,
        completionTokens,
        totalTokens,
        sessionId: this.sessionId,
        experimentId,
        variantId,
        tags,
        metadata,
      };

      // 4. CRITICAL: Non-blocking async fire-and-forget relay back to ingestion API
      this._sendTrace(payload).catch(err =>
        console.warn('[Tracer] Telemetry logging failed in background:', err.message)
      );

      // Return the native response cleanly to the app code as if we were never here
      return result;

    } catch (err) {
      // If the model call itself failed, throw it up the chain to the app developer
      throw err;
    }
  }

  /**
   * Manual logging fallback for custom API structures or unsupported models
   */
  async record(payload) {
    return this._sendTrace(payload);
  }

  /**
   * Internal telemetry delivery mechanism matching server auth routes
   */
 async _sendTrace(payload) {
    // 🚀 Update the endpoint path to include /ingest
    return axios.post(`${this.baseUrl}/api/traces/ingest`, payload, {
      headers: {
        'x-api-key': this.apiKey, // Verified matching secure header
        'Content-Type': 'application/json',
      },
      timeout: 3000,
    });
  }

  _detectProvider(model = '') {
    const name = model.toLowerCase();
    if (name.includes('gemini')) return 'google';
    if (name.includes('gpt') || name.includes('o1') || name.includes('o3')) return 'openai';
    if (name.includes('claude')) return 'anthropic';
    return 'other';
  }
}

// Export named Tracer using ES Module architecture
export { Tracer };