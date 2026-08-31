import { getSupabaseServerClient } from '@/lib/supabase';
import type { Business } from '@/types/db';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const supabase = getSupabaseServerClient();

  const { data: businesses, error } = await supabase
    .from('businesses')
    .select('*')
    .eq('is_managed', true)
    .order('name', { ascending: true });

  if (error) {
    return (
      <main style={{ padding: 32 }}>
        <h1>Restaurant Marketing Intelligence</h1>
        <p style={{ color: 'red' }}>Could not load businesses: {error.message}</p>
      </main>
    );
  }

  const count = businesses ? businesses.length : 0;

  return (
    <main style={{ padding: 32, fontFamily: 'system-ui' }}>
      <h1>Restaurant Marketing Intelligence</h1>
      
        href="/businesses/new"
        style={{
          display: 'inline-block',
          marginBottom: 20,
          padding: '10px 20px',
          background: '#111',
          color: '#fff',
          borderRadius: 6,
          textDecoration: 'none',
          fontSize: 14,
        }}
      >
        + Add Business
      </a>
      <p>Managed businesses ({count})</p>
      <ul>
        {businesses && (businesses as Business[]).map((b) => (
          <li key={b.id}>
            <strong>{b.name}</strong> - {b.cuisine_type ? b.cuisine_type : 'cuisine not set'}
            {b.website_url && (
              <span> - <a href={b.website_url} target="_blank" rel="noreferrer">website</a></span>
            )}
          </li>
        ))}
      </ul>
      {count === 0 && <p>No businesses yet. Add one via Supabase or the seed script.</p>}
    </main>
  );
}