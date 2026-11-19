/**
 * Shown when WebGL or the 3D scene cannot start (older devices, disabled
 * WebGL, a lost context). Keeps the important content and the CV reachable
 * instead of leaving the visitor on a blank page.
 */
export default function SceneFallback() {
  return (
    <div
      role="status"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 40,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
        padding: '2rem',
        textAlign: 'center',
        background: '#fdf8e2',
        color: '#2a2a2a',
        fontFamily: "'Cabin Sketch', 'Rubik Scribble', system-ui, sans-serif",
        overflow: 'auto',
      }}
    >
      <h1 style={{ margin: 0, fontSize: 'clamp(2rem, 6vw, 3.5rem)' }}>
        Emna Smaali
      </h1>
      <p style={{ margin: 0, maxWidth: '38rem', fontSize: '1.1rem', lineHeight: 1.5 }}>
        Software engineering student focused on applied AI, RAG systems and
        full stack development.
      </p>
      <p style={{ margin: 0, maxWidth: '38rem', lineHeight: 1.5 }}>
        The interactive 3D tour could not start in this browser. Everything is
        still available below.
      </p>
      <p style={{ margin: 0, display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
        <a href="Emna_Smaali_CV.pdf" target="_blank" rel="noreferrer">
          View / download CV
        </a>
        <a href="mailto:emna.smaali@medtech.tn">Email</a>
        <a href="https://www.linkedin.com/in/emna-smaali-8855a7258" target="_blank" rel="noreferrer">
          LinkedIn
        </a>
        <a href="https://github.com/emna9" target="_blank" rel="noreferrer">
          GitHub
        </a>
      </p>
      <button
        type="button"
        onClick={() => window.location.reload()}
        style={{
          marginTop: '0.5rem',
          padding: '0.5rem 1.25rem',
          border: '2px solid #2a2a2a',
          borderRadius: '999px',
          background: 'transparent',
          color: 'inherit',
          font: 'inherit',
          cursor: 'pointer',
        }}
      >
        Try again
      </button>
    </div>
  );
}
