export default function GlassDiagnostics(){
  const on = getComputedStyle(document.documentElement)
    .getPropertyValue('--glass-enabled').trim()==='1';
  const supports = CSS.supports('backdrop-filter','blur(10px)') ||
                   CSS.supports('-webkit-backdrop-filter','blur(10px)');
  return (
    <div className="glass p-4 rounded-glass text-white">
      <div>Glass flag: <b className="text-wc-cyan">{on?'ON':'OFF'}</b></div>
      <div>Backdrop support: <b className="text-wc-cyan">{supports?'YES':'NO'}</b></div>
      <div className="wc-chip wc-chip--ok mt-2">SLO 99.9%</div>
    </div>
  );
}
