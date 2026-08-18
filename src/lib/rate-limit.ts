import { prisma } from "@/lib/prisma";

/**
 * Rate limiting da rota de login, persistido no Postgres (reaproveita a
 * tabela `Setting`, chave/valor, já usada para outras configs — sem
 * precisar de migration nem de um serviço novo como Redis/Upstash).
 *
 * Antes era um `Map` em memória por processo: funcionava num único servidor,
 * mas a Vercel roda funções serverless em múltiplas instâncias que não
 * compartilham memória — cada uma tinha seu próprio contador, então um
 * ataque de força bruta podia se espalhar entre instâncias e nunca bater o
 * limite. Persistindo no banco, o limite vale de verdade por IP.
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const WINDOW_MS = 15 * 60 * 1000; // 15 minutos
const MAX_ATTEMPTS = 5; // tentativas por janela, por IP

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

function keyFor(ip: string): string {
  return `ratelimit:login:${ip}`;
}

/**
 * Registra uma tentativa de login para o IP e diz se ela é permitida.
 * Deve ser chamada a cada tentativa (sucesso ou falha).
 */
export async function checkLoginRateLimit(
  ip: string,
): Promise<RateLimitResult> {
  const now = Date.now();
  const key = keyFor(ip);

  const row = await prisma.setting.findUnique({ where: { key } });
  const bucket: Bucket | null = row
    ? (JSON.parse(row.value) as Bucket)
    : null;

  if (!bucket || now > bucket.resetAt) {
    const fresh: Bucket = { count: 1, resetAt: now + WINDOW_MS };
    await prisma.setting.upsert({
      where: { key },
      update: { value: JSON.stringify(fresh) },
      create: { key, value: JSON.stringify(fresh) },
    });
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
  await prisma.setting.upsert({
    where: { key },
    update: { value: JSON.stringify(bucket) },
    create: { key, value: JSON.stringify(bucket) },
  });
  return {
    allowed: true,
    remaining: MAX_ATTEMPTS - bucket.count,
    retryAfterSeconds: 0,
  };
}
