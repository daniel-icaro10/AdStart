/**
 * Rate limiting simples em memória para a rota de login.
 * Suficiente para o MVP (single-process). Em produção com múltiplas
 * instâncias, troque por Redis/Upstash.
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const WINDOW_MS = 15 * 60 * 1000; // 15 minutos
const MAX_ATTEMPTS = 5; // tentativas por janela, por IP

const buckets = new Map<string, Bucket>();

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

/**
 * Registra uma tentativa de login para o IP e diz se ela é permitida.
 * Deve ser chamada a cada tentativa (sucesso ou falha).
 */
export function checkLoginRateLimit(ip: string): RateLimitResult {
  const now = Date.now();
  const bucket = buckets.get(ip);

  if (!bucket || now > bucket.resetAt) {
    buckets.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, remaining: MAX_ATTEMPTS - 1, retryAfterSeconds: 0 };
  }

  if (bucket.count >= MAX_ATTEMPTS) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000),
    };
  }

  bucket.count += 1;
  return {
    allowed: true,
    remaining: MAX_ATTEMPTS - bucket.count,
    retryAfterSeconds: 0,
  };
}

/** Limpeza preguiçosa de buckets expirados (evita vazamento de memória). */
function sweep() {
  const now = Date.now();
  for (const [ip, bucket] of buckets) {
    if (now > bucket.resetAt) buckets.delete(ip);
  }
}

// Varredura periódica leve.
if (typeof setInterval !== "undefined") {
  setInterval(sweep, WINDOW_MS).unref?.();
}
