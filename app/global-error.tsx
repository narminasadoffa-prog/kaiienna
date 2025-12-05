'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '20px',
          fontFamily: 'system-ui, sans-serif',
        }}>
          <div style={{
            maxWidth: '500px',
            padding: '20px',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            backgroundColor: '#fff',
          }}>
            <h1 style={{ color: '#dc2626', marginBottom: '16px' }}>
              Xəta baş verdi
            </h1>
            <p style={{ color: '#6b7280', marginBottom: '16px' }}>
              {error.message || 'Gözlənilməz xəta'}
            </p>
            <button
              onClick={reset}
              style={{
                padding: '8px 16px',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Yenidən cəhd et
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}


