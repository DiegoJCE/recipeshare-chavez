import { googleSignInEnabled, handlers } from '@/auth';

function unavailable() {
  return new Response(null, { status: 404 });
}

export const GET = googleSignInEnabled ? handlers.GET : unavailable;
export const POST = googleSignInEnabled ? handlers.POST : unavailable;
