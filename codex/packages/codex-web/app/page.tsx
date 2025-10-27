import { nonce } from '@wiredchaos/codex-core';

export default function Page() {
  return (
    <main style={{ display: 'grid', placeItems: 'center', minHeight: '100dvh' }}>
      <div className="glass">
        <h1>CODΞX</h1>
        <p>WIRED CHAOS nucleus online. session: {nonce().slice(0, 8)}</p>
      </div>
    </main>
  );
}
