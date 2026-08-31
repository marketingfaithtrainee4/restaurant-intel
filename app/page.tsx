import { getSupabaseServerClient } from '@/lib/supabase';
import type { Business } from '@/types/db';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const supabase = getSupabaseServerClient();

  const result = await supabase
    .from('businesses')
    .select('*')
    .eq('is_managed', true)
    .order('name', { ascending: true });

  const businesses = result.data as Business[] | null;
  const fetchError = result.error;

  if (fetchError) {
    return (
      <main style={{ padding: 32 }}>
        <h1>Restaurant Marketing Intelligence</h1>
        <p style={{ color: 'red' }}>Could not load businesses.</p>
      </main>
    );
  }

  const count = businesses ? businesses.length : 0;

  return (
    <main style={{ padding: 32, fontFamily: 'system-ui' }}>
      <h1>Restaurant Marketing Intelligence</h1>

      <a href="/businesses/new">
        Add Business
      </a>

      <p>Managed businesses: {count}</p>

      <ul>
        {businesses ? businesses.map((b) => (
          <li key={b.id}>
            {b.name}
          </li>
        )) : null}
      </ul>

      {count === 0 ? <p>No businesses yet.</p> : null}
    </main>
  );
}