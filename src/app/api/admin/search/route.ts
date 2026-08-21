import { NextResponse } from 'next/server'
import { requireSuperAdmin, AuthError } from '@/lib/auth'
import { adminSearch } from '@/lib/admin/operational-queries'
import { logSystemEvent } from '@/lib/observability/system-event'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  let admin
  try {
    admin = await requireSuperAdmin()
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')?.trim() ?? ''

  if (!q) {
    return NextResponse.json({ results: [] })
  }

  try {
    const results = await adminSearch(q, 12)
    // Best-effort observability — never blocks the response.
    await logSystemEvent({
      eventType: 'ADMIN_SEARCH',
      userId: admin.userId,
      metadata: { query_length: q.length, result_count: results.length },
    })
    return NextResponse.json({ results })
  } catch {
    return NextResponse.json({ error: 'Search failed.' }, { status: 500 })
  }
}
