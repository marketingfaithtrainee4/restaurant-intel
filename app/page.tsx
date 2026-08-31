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
        <p style={{ color: 'red' }}>
          Could not load businesses: {error.message}
        </p>
      </main>
    );
  }

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
      <p>Managed businesses ({businesses?.length ?? 0})</p>
      <ul>
        {(businesses as Business[] | null)?.map((b) => (
          <li key={b.id}>
            <strong>{b.name}</strong> — {b.cuisine_type ?? 'cuisine not set'}
            {b.website_url && (
              <>
                {' '}
                —{' '}
                <a href={b.website_url} target="_blank" rel="noreferrer">
                  website
                </a>
              </>
            )}
          </li>
        ))}
      </ul>
      {(!businesses || businesses.length === 0) && (
        <p>No businesses yet. Add one via Supabase or the seed script.</p>
      )}
    </main>
  );
}