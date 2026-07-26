/**
 * Suscripción de la empresa inactiva (gate HTTP 402 `subscription_inactive` de la API).
 *
 * El bloqueo puede llegar por dos caminos: el login del trabajador (fetch, en
 * `auth.ts`) y cualquier acción posterior (axios, interceptor en `api.ts`).
 * Ambos emiten la misma señal global para que `App` muestre `AccessDenied`.
 */
export const SUBSCRIPTION_BLOCKED_MESSAGE =
  'Su empresa no permite el acceso a su cuenta. Contacte con su empresa.';

export class SubscriptionBlockedError extends Error {
  constructor(message: string = SUBSCRIPTION_BLOCKED_MESSAGE) {
    super(message);
    this.name = 'SubscriptionBlockedError';
  }
}

type Listener = () => void;
const listeners = new Set<Listener>();

/** Suscribe una callback al bloqueo de suscripción. Devuelve la función de baja. */
export function onSubscriptionBlocked(cb: Listener): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

/** Notifica a todos los suscriptores que la suscripción está bloqueada. */
export function emitSubscriptionBlocked(): void {
  listeners.forEach((cb) => cb());
}
