// FILE: src/app/admin/login/page.js
import { redirect } from 'next/navigation';
import { isAdmin } from '@/lib/adminAuth';
import LoginForm from '@/components/admin/LoginForm';

export const dynamic = 'force-dynamic';
export default async function LoginPage() {
  if (await isAdmin()) redirect('/admin');
  return <LoginForm />;
}
