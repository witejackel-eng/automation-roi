/**
 * NextAuth API route handler — catches all /api/auth/* requests.
 * NextAuth v4 pattern: export GET and POST from the default handler.
 */
import handler from '@/lib/auth';

export { handler as GET, handler as POST };
