import { formatoMoneda } from './paymentCycle';

/**
 * Normaliza y formatea un número telefónico para WhatsApp.
 * Si es un número de República Dominicana (10 dígitos empezando en 809, 829, 849 u otros 10 dígitos),
 * añade el código de país '1' para el estándar internacional de WhatsApp.
 */
export function normalizarTelefonoWhatsApp(telefono: string | undefined | null): string {
  if (!telefono) return '';
  let digitos = String(telefono).replace(/\D/g, '');
  
  // Quitar ceros a la izquierda si los tiene
  while (digitos.startsWith('0')) {
    digitos = digitos.substring(1);
  }

  // Números dominicanos o de 10 dígitos (ej. 8095551234 -> 18095551234)
  if (digitos.length === 10) {
    return '1' + digitos;
  }

  return digitos;
}

/**
 * Valida si el teléfono tiene una cantidad razonable de dígitos para WhatsApp
 */
export function esTelefonoValidoWhatsApp(telefono: string | undefined | null): boolean {
  const norm = normalizarTelefonoWhatsApp(telefono);
  return norm.length >= 10 && norm.length <= 15;
}

/**
 * Genera el texto del recordatorio para WhatsApp con formato colmadero profesional
 */
export function generarMensajeRecordatorio(
  cliente: { nombre: string; saldo: number; diasPago?: string },
  nombreColmado: string = 'Súper Colmado DAVID'
): string {
  const saludo = `👋 ¡Hola *${cliente.nombre.trim()}*! Le saludamos de *${nombreColmado}* 🏪`;

  if (cliente.saldo > 0) {
    const textoDias = cliente.diasPago
      ? `📅 *Día(s) acordado(s) de pago:* ${cliente.diasPago}\n`
      : '';

    return (
      `${saludo}\n\n` +
      `Le escribimos para recordarle amablemente su balance pendiente de fiado:\n\n` +
      `💰 *Total a pagar:* *${formatoMoneda(cliente.saldo)}*\n` +
      textoDias +
      `\nAgradecemos pasar por el colmado cuando le sea posible para regularizar su cuenta. ¡Muchas gracias por su preferencia y confianza! 🙏`
    );
  }

  return (
    `${saludo}\n\n` +
    `Le informamos con mucho agrado que su cuenta se encuentra *al día* con balance en *RD$0.00*.\n\n` +
    `¡Agradecemos mucho su puntualidad y preferencia en nuestro colmado! ✨`
  );
}

/**
 * Genera el enlace directo a WhatsApp (usando el protocolo universal de WhatsApp)
 */
export function generarEnlaceWhatsApp(
  cliente: { nombre: string; telefono: string; saldo: number; diasPago?: string },
  nombreColmado: string = 'Súper Colmado DAVID'
): string {
  const telefonoNorm = normalizarTelefonoWhatsApp(cliente.telefono);
  const mensaje = generarMensajeRecordatorio(cliente, nombreColmado);
  
  // api.whatsapp.com es el estándar universal que abre directamente la app de WhatsApp en Android/iOS
  // y WhatsApp Web en computadoras sin bloqueos de redirección
  return `https://api.whatsapp.com/send?phone=${telefonoNorm}&text=${encodeURIComponent(mensaje)}`;
}

/**
 * Intenta abrir WhatsApp de forma segura garantizando compatibilidad con móviles,
 * navegadores Chrome, PWA e iframes evitando bloqueos de popups.
 */
export function ejecutarAperturaWhatsApp(
  cliente: { nombre: string; telefono: string; saldo: number; diasPago?: string },
  nombreColmado: string = 'Súper Colmado DAVID'
): { ok: boolean; url: string; error?: string } {
  if (!esTelefonoValidoWhatsApp(cliente.telefono)) {
    return {
      ok: false,
      url: '',
      error: 'El cliente no tiene un número telefónico válido para WhatsApp'
    };
  }

  const url = generarEnlaceWhatsApp(cliente, nombreColmado);

  try {
    // Método 1: Enlace nativo con target _blank (el más compatible en navegadores móviles)
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      try {
        if (link.parentNode) {
          link.parentNode.removeChild(link);
        }
      } catch {}
    }, 200);

    return { ok: true, url };
  } catch {
    // Método 2: Redirección directa como respaldo
    try {
      window.location.assign(url);
      return { ok: true, url };
    } catch (err: any) {
      return { ok: false, url, error: err?.message || 'No se pudo abrir WhatsApp' };
    }
  }
}
