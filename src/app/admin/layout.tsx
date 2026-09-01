import { requireAdmin } from '@/lib/auth/server';

export default async function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  await requireAdmin();
  return children;
}
