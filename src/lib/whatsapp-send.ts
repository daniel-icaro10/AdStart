/**
 * Adaptador de envio de WhatsApp via instância whatsmeow (HTTP).
 *
 * Configuração por variáveis de ambiente:
 *   - WHATSMEOW_API_URL   → endpoint de envio (ex.: https://meu-zap.com/send)
 *   - WHATSMEOW_API_TOKEN → token de autenticação (opcional)
 *
 * ⚠️ AJUSTE `montarRequisicao` conforme a SUA API. O default cobre os wrappers
 * mais comuns (corpo JSON { phone, message } + token via Bearer e header `token`).
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
  if (!d.startsWith("55") && (d.length === 10 || d.length === 11)) d = "55" + d;
  return d;
}

/** Monta a requisição HTTP para a API. Ponto único para adaptar ao seu wrapper. */
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
        ...(token ? { Authorization: `Bearer ${token}`, token } : {}),
      },
      // ⚠️ Ajuste os nomes dos campos conforme a sua API whatsmeow.
      body: JSON.stringify({ phone, message }),
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
