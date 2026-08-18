/**
 * Adaptador de envio de WhatsApp via serviço próprio `wa-service` (whatsmeow).
 * Contrato (main.go): POST /send · header `X-Secret: <WA_SECRET>` ·
 * corpo `{ "to": "5511999999999", "message": "..." }`.
 *
 * Configuração por variáveis de ambiente:
 *   - WHATSMEOW_API_URL   → endpoint completo de envio (ex.: http://IP:8080/send)
 *   - WHATSMEOW_API_TOKEN → valor do WA_SECRET (enviado no header X-Secret)
 */

export interface SendResult {
  ok: boolean;
  error?: string;
}

/**
 * Normaliza um contato em telefone só-dígitos com DDI (Brasil = 55).
 * Retorna null se não parecer um telefone (ex.: e-mail).
 */
export function normalizePhone(
  contato: string | null | undefined,
): string | null {
  if (!contato) return null;
  let d = contato.replace(/\D/g, "");
  if (d.length < 10) return null; // provavelmente não é um telefone
  // DDI+DDD+número nunca dá 10 ou 11 dígitos (só DDD+número, sem DDI, dá).
  // Não checar se já "começa com 55": um DDD 55 (Santa Maria/RS) faz um
  // número local de 11 dígitos começar com "55" por coincidência, e isso
  // fazia a função pular o DDI achando que ele já estava lá.
  if (d.length === 10 || d.length === 11) d = "55" + d;
  return d;
}

/** Monta a requisição HTTP para o wa-service (POST /send + X-Secret + {to, message}). */
function montarRequisicao(
  url: string,
  token: string | undefined,
  phone: string,
  message: string,
): { url: string; init: RequestInit } {
  return {
    url,
    init: {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { "X-Secret": token } : {}),
      },
      body: JSON.stringify({ to: phone, message }),
    },
  };
}

/** Envia uma mensagem de texto. Timeout de 10s para não travar o cron. */
export async function sendWhatsapp(
  phone: string,
  message: string,
): Promise<SendResult> {
  const url = process.env.WHATSMEOW_API_URL;
  const token = process.env.WHATSMEOW_API_TOKEN;
  if (!url) return { ok: false, error: "WHATSMEOW_API_URL não configurado" };

  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 10_000);
  try {
    const req = montarRequisicao(url, token, phone, message);
    const res = await fetch(req.url, { ...req.init, signal: ctrl.signal });
    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      return { ok: false, error: `HTTP ${res.status} ${txt.slice(0, 140)}` };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  } finally {
    clearTimeout(t);
  }
}
