/** Utilitários de data puros e sem dependências — seguros pra client e server. */

/**
 * Avança uma data em 1 mês (em UTC), mantendo o dia (com clamp no fim do mês).
 * Única fonte de verdade — usada tanto na Server Action que registra o
 * pagamento quanto no texto de confirmação exibido antes de confirmar,
 * pra nunca divergir do que o servidor vai de fato calcular.
 */
export function avancarUmMes(d: Date): Date {
  const dia = d.getUTCDate();
  const r = new Date(d);
  r.setUTCDate(1);
  r.setUTCMonth(r.getUTCMonth() + 1);
  const ultimoDia = new Date(
    Date.UTC(r.getUTCFullYear(), r.getUTCMonth() + 1, 0),
  ).getUTCDate();
  r.setUTCDate(Math.min(dia, ultimoDia));
  return r;
}
