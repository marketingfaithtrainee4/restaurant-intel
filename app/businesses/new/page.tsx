'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

const fieldStyle: React.CSSProperties = {
  display: 'block',
  width: '100%',
  maxWidth: 480,
  padding: '8px 10px',
  marginBottom: 12,
  border: '1px solid #ccc',
  borderRadius: 6,
  fontSize: 14,
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontWeight: 600,
  marginBottom: 4,
  marginTop: 12,
  fontSize: 14,
};

export default function NewBusinessPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: '',
    cuisine_type: '',
    website_url: '',
    menu_url: '',
    gbp_url: '',
    google_review_url: '',
    address_line: '',
    postcode: '',
    phone: '',
    facebook_url: '',
    instagram_url: '',
    ordering_provider: '',
    ordering_url: '',
  });

  function update(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/businesses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Something went wrong.');
        setSubmitting(false);
        return;
      }

      router.push('/');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setSubmitting(false);
    }
  }

  return (
    <main style={{ padding: 32, fontFamily: 'system-ui', maxWidth: 560 }}>
      <h1>Add a Business</h1>
      <p style={{ color: '#555' }}>
        Add one of your managed restaurants. Only the name is required —
        fill in what you have, you can always come back and add the rest.
      </p>

      <form onSubmit={handleSubmit}>
        <label style={labelStyle} htmlFor="name">Restaurant Name *</label>
        <input
          style={fieldStyle}
          id="name"
          required
          value={form.name}
          onChange={(e) => update('name', e.target.value)}
        />

        <label style={labelStyle} htmlFor="cuisine_type">Cuisine Type</label>
        <input
          style={fieldStyle}
          id="cuisine_type"
          placeholder="e.g. Indian, Pizza, Kebab"
          value={form.cuisine_type}
          onChange={(e) => update('cuisine_type', e.target.value)}
        />

        <label style={labelStyle} htmlFor="website_url">Website URL</label>
        <input
          style={fieldStyle}
          id="website_url"
          type="url"
          value={form.website_url}
          onChange={(e) => update('website_url', e.target.value)}
        />

        <label style={labelStyle} htmlFor="menu_url">Menu URL</label>
        <input
          style={fieldStyle}
          id="menu_url"
          type="url"
          value={form.menu_url}
          onChange={(e) => update('menu_url', e.target.value)}
        />

        <label style={labelStyle} htmlFor="gbp_url">Google Business Profile URL</label>
        <input
          style={fieldStyle}
          id="gbp_url"
          type="url"
          value={form.gbp_url}
          onChange={(e) => update('gbp_url', e.target.value)}
        />

        <label style={labelStyle} htmlFor="google_review_url">Google Review URL</label>
        <input
          style={fieldStyle}
          id="google_review_url"
          type="url"
          value={form.google_review_url}
          onChange={(e) => update('google_review_url', e.target.value)}
        />

        <label style={labelStyle} htmlFor="address_line">Address</label>
        <input
          style={fieldStyle}
          id="address_line"
          value={form.address_line}
          onChange={(e) => update('address_line', e.target.value)}
        />

        <label style={labelStyle} htmlFor="postcode">Postcode</label>
        <input
          style={fieldStyle}
          id="postcode"
          value={form.postcode}
          onChange={(e) => update('postcode', e.target.value)}
        />

        <label style={labelStyle} htmlFor="phone">Phone</label>
        <input
          style={fieldStyle}
          id="phone"
          value={form.phone}
          onChange={(e) => update('phone', e.target.value)}
        />

        <label style={labelStyle} htmlFor="facebook_url">Facebook URL</label>
        <input
          style={fieldStyle}
          id="facebook_url"
          type="url"
          value={form.facebook_url}
          onChange={(e) => update('facebook_url', e.target.value)}
        />

        <label style={labelStyle} htmlFor="instagram_url">Instagram URL</label>
        <input
          style={fieldStyle}
          id="instagram_url"
          type="url"
          value={form.instagram_url}
          onChange={(e) => update('instagram_url', e.target.value)}
        />

        <label style={labelStyle} htmlFor="ordering_provider">Ordering Provider</label>
        <input
          style={fieldStyle}
          id="ordering_provider"
          placeholder="e.g. Just Eat, own website, Deliveroo"
          value={form.ordering_provider}
          onChange={(e) => update('ordering_provider', e.target.value)}
        />

        <label style={labelStyle} htmlFor="ordering_url">Ordering URL</label>
        <input
          style={fieldStyle}
          id="ordering_url"
          type="url"
          value={form.ordering_url}
          onChange={(e) => update('ordering_url', e.target.value)}
        />

        {error && (
          <p style={{ color: 'red', marginTop: 12 }}>Error: {error}</p>
        )}

        <button
          type="submit"
          disabled={submitting}
          style={{
            marginTop: 16,
            padding: '10px 20px',
            background: '#111',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            fontSize: 14,
            cursor: submitting ? 'not-allowed' : 'pointer',
          }}
        >
          {submitting ? 'Saving...' : 'Save Business'}
        </button>
      </form>
    </main>
  );
}