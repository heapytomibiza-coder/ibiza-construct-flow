import { corsHeaders } from './cors.ts';

export function json(body: unknown, init: number | ResponseInit = 200) {
  const status = typeof init === 'number' ? init : init.status ?? 200;
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}
