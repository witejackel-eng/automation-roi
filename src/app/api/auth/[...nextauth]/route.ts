/**
 * NextAuth API route handler — catches all /api/auth/* requests.
 */
import { handlers } from '@/lib/auth';

export const { GET, POST } = handlers;
