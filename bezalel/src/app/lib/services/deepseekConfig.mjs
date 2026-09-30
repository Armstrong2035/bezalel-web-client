export const DEEPSEEK_URL = "https://api.deepseek.com/chat/completions";

// One server-side override for generation, chat, memory, actions, and targets.
export const getDeepSeekModel = () => process.env.DEEPSEEK_MODEL?.trim() || "deepseek-flash";
