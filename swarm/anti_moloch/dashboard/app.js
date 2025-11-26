(async function(){
  const cfg = await (await fetch('../dashboards/alignment_risk.json')).json();
  const app = document.getElementById('app');
  cfg.widgets.forEach(w => {
    const el = document.createElement('div');
    el.style.margin = '12px 0';
    el.style.padding = '12px';
    el.style.border = '1px solid #00FFFF';
    el.innerHTML = `<strong>${w.title}</strong><div id="${w.metric || w.title.replace(/\s/g,'_')}">metric: ${w.metric||'n/a'}</div>`;
    app.appendChild(el);
  });
})();
