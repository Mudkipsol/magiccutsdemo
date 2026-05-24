// Provider-agnostic Qwen client. Targets Groq and Cerebras (both OpenAI-compatible
// /chat/completions with tool calling). Keys are server-only; if none are set the
// layer reports disabled and callers degrade gracefully (mirrors hasSupabase).

const PROVIDERS = {
  groq: { base: 'https://api.groq.com/openai/v1', key: () => process.env.GROQ_API_KEY },
  cerebras: { base: 'https://api.cerebras.ai/v1', key: () => process.env.CEREBRAS_API_KEY },
}

// Per-task model map. Override via AI_FAST_MODEL / AI_SMART_MODEL env if desired.
const MODELS = {
  fast: process.env.AI_FAST_MODEL || 'qwen/qwen3-32b',
  smart: process.env.AI_SMART_MODEL || 'qwen/qwen3-32b',
}

export function aiEnabled() {
  return !!(process.env.GROQ_API_KEY || process.env.CEREBRAS_API_KEY)
}

// Ordered list of providers to try: preferred first, the other as failover.
function providerOrder(preferred) {
  const pref = preferred || process.env.AI_PROVIDER || 'groq'
  return [pref, pref === 'groq' ? 'cerebras' : 'groq'].filter((p) => PROVIDERS[p]?.key())
}

async function callProvider(provider, { model, messages, tools, temperature }) {
  const cfg = PROVIDERS[provider]
  const res = await fetch(`${cfg.base}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${cfg.key()}` },
    body: JSON.stringify({
      model,
      messages,
      temperature: temperature ?? 0.4,
      ...(tools?.length ? { tools, tool_choice: 'auto' } : {}),
    }),
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    const err = new Error(`${provider} ${res.status}: ${text.slice(0, 200)}`)
    err.retryable = res.status >= 500 || res.status === 429
    throw err
  }
  return res.json()
}

// Single completion. Returns the raw assistant message ({ content, tool_calls }).
export async function chat({ messages, tools, task = 'smart', temperature, provider }) {
  if (!aiEnabled()) throw new Error('AI disabled: no GROQ_API_KEY or CEREBRAS_API_KEY')
  const model = MODELS[task] || MODELS.smart
  const order = providerOrder(provider)
  let lastErr
  for (const p of order) {
    try {
      const data = await callProvider(p, { model, messages, tools, temperature })
      return data.choices?.[0]?.message ?? { content: '' }
    } catch (e) {
      lastErr = e
      if (!e.retryable) throw e // auth/4xx — failover won't help
    }
  }
  throw lastErr || new Error('All AI providers failed')
}

// Tool-calling loop. `executors` maps tool name → async (args) => result object.
// Returns the final assistant text once the model stops requesting tools.
export async function runTools({ messages, tools, executors, task = 'smart', maxSteps = 6 }) {
  const convo = [...messages]
  for (let step = 0; step < maxSteps; step++) {
    const msg = await chat({ messages: convo, tools, task })
    convo.push(msg)
    if (!msg.tool_calls?.length) {
      return { text: msg.content || '', messages: convo }
    }
    for (const call of msg.tool_calls) {
      let args = {}
      try { args = JSON.parse(call.function.arguments || '{}') } catch { /* tolerate */ }
      const exec = executors[call.function.name]
      const result = exec ? await exec(args) : { error: `unknown tool ${call.function.name}` }
      convo.push({ role: 'tool', tool_call_id: call.id, content: JSON.stringify(result) })
    }
  }
  // Ran out of steps — ask for a final answer with no tools.
  const final = await chat({ messages: convo, task })
  return { text: final.content || '', messages: convo }
}
