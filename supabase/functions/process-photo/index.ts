import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-tester-auth',
};

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 1;
const rateLimitByIp = new Map<string, number[]>();

const getClientIp = (req: Request) => {
  const xff = req.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0]?.trim() || 'unknown';
  const cf = req.headers.get('cf-connecting-ip');
  if (cf) return cf.trim();
  const realIp = req.headers.get('x-real-ip');
  if (realIp) return realIp.trim();
  return 'unknown';
};

const isRateLimited = (ip: string, nowMs: number) => {
  const existing = rateLimitByIp.get(ip) ?? [];
  const windowStart = nowMs - RATE_LIMIT_WINDOW_MS;
  const recent = existing.filter((t) => t > windowStart);
  if (recent.length >= RATE_LIMIT_MAX_REQUESTS) {
    rateLimitByIp.set(ip, recent);
    return true;
  }
  recent.push(nowMs);
  rateLimitByIp.set(ip, recent);
  return false;
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const TESTER_ACCESS_TOKEN = Deno.env.get('TESTER_ACCESS_TOKEN');
    if (!TESTER_ACCESS_TOKEN) {
      return new Response(
        JSON.stringify({ error: 'Server auth not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const url = new URL(req.url);
    const tokenFromQuery = url.searchParams.get('access') || '';
    const tokenFromHeader = req.headers.get('x-tester-auth') || '';
    const providedToken = tokenFromHeader || tokenFromQuery;
    if (!providedToken || providedToken !== TESTER_ACCESS_TOKEN) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const ip = getClientIp(req);
    const nowMs = Date.now();
    if (isRateLimited(ip, nowMs)) {
      return new Response(
        JSON.stringify({ error: 'Too Many Requests' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { image, photoType, includeShoulders, mimeType } = await req.json();

    if (!image) {
      return new Response(
        JSON.stringify({ error: 'No image provided. Please include base64 encoded image in request body.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const N8N_WEBHOOK_URL = Deno.env.get('N8N_WEBHOOK_URL');
    if (!N8N_WEBHOOK_URL) {
      console.error('N8N_WEBHOOK_URL is not configured');
      return new Response(
        JSON.stringify({ error: 'Webhook URL not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing ${photoType || 'photo'}, sending to n8n workflow...`);

    // Call the n8n webhook with the expected format
    const n8nResponse = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image,
        photoType: photoType || 'Passport (40x60mm)',
        includeShoulders: includeShoulders !== false,
        mimeType: mimeType || 'image/png',
      }),
    });

    if (!n8nResponse.ok) {
      const errorText = await n8nResponse.text();
      console.error('n8n webhook error:', n8nResponse.status, errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to process photo through workflow' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const result = await n8nResponse.json();
    console.log('n8n workflow completed successfully');

    // Expect n8n to return an array of 4 photo variations
    // Format: { variations: [url1, url2, url3, url4] } or { variations: [base64_1, base64_2, ...] }
    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in process-photo function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
