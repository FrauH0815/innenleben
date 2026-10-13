const sorter = document.getElementById('sortieren');
if (sorter) {
  const steps = [...sorter.querySelectorAll('.sorter-step')];
  const textField = document.getElementById('sorter-text');
  const hint = sorter.querySelector('.sorter-hint');
  const thoughtBox = sorter.querySelector('.sorter-thought');
  const progress = sorter.querySelector('.sorter-progress');
  let thoughts = [], kinds = [], current = 0;

  const groups = [
    {kind: 'heute', title: 'Heute dran', ordered: true},
    {kind: 'warten', title: 'Offen, aber nicht jetzt', ordered: true},
    {kind: 'gefuehl', title: 'Darf einfach da sein'},
    {kind: 'unklar', title: 'Darf erst mal liegen bleiben'},
    {kind: 'nicht', title: 'Gehört nicht zu dir'}
  ];

  // Texte für den nächsten kleinen Schritt – {x} wird durch den wichtigsten offenen Punkt ersetzt.
  const nextSteps = {
    gering: {
      5: 'Du musst {x} heute nicht erledigen. Schreib nur auf, was der allererste Handgriff wäre. Ein Satz. Dann darfst du aufhören.',
      10: 'Nimm dir {x} vor und mach nur den allerersten Handgriff – den kleinsten, den es gibt. Eine Nachricht öffnen. Einen Zettel hinlegen. Danach ist Pause.',
      15: 'Mach den ersten kleinen Handgriff für {x}. Danach fünf Minuten nichts. Wirklich nichts. Wenn dann noch Kraft da ist, ein zweiter Handgriff. Wenn nicht, war es genug.'
    },
    mittel: {
      5: 'Stell dir einen Wecker auf 5 Minuten und fang mit {x} an. Wenn er klingelt, hörst du auf – egal, wie weit du bist.',
      10: '10 Minuten für {x}. Nicht fertig werden, nur anfangen. Wenn der Wecker klingelt, schreib kurz auf, wo du stehst.',
      15: 'Nimm dir {x} für 10 Minuten vor. Die letzten 5 Minuten gehören dir: aufstehen, Kaffee machen, einmal durchatmen.'
    },
    hoch: {
      5: 'Gibt es bei {x} etwas, das in 5 Minuten erledigt ist? Dann mach genau das jetzt. Ein kleiner Haken ist bereits Fortschritt, kein Stillstand.',
      10: 'Fang mit {x} an. Wenn es in 10 Minuten nicht fertig wird, schreib den nächsten Schritt auf, damit dein Kopf ihn nicht festhalten muss.',
      15: '15 Minuten für {x}. Danach schau kurz auf deine Liste: Ist der nächste Punkt immer noch so drängend – oder darf er warten?'
    }
  };
  const nothingOpen = 'Gerade will nichts davon etwas von dir. Vielleicht ist heute ein Tag, an dem Fühlen reicht. Lies dir noch einmal durch, was einfach da sein darf – und dann leg es weg.';
  const closing = {
    gering: 'Bei wenig Energie zählt nur eins. Den Rest darfst du heute liegen lassen.',
    mittel: 'Eins nach dem anderen reicht.',
    hoch: 'Du hast heute etwas Kraft. Nutz sie für eine Sache, nicht für alle.'
  };

  const choice = name => sorter.querySelector('input[name="' + name + '"]:checked').value;
  function show(n) {
    steps.forEach(step => { step.hidden = step.dataset.step !== String(n); });
    const heading = sorter.querySelector('.sorter-step[data-step="' + n + '"] h3');
    if (heading) heading.focus({preventScroll: true});
    if (sorter.getBoundingClientRect().top < 0) sorter.scrollIntoView({block: 'start'});
  }
  function showThought() {
    thoughtBox.textContent = thoughts[current];
    progress.textContent = 'Gedanke ' + (current + 1) + ' von ' + thoughts.length;
  }
  function count(n, one, many) { return n === 1 ? one : n + ' ' + many; }
  function result() {
    const by = kind => thoughts.filter((t, i) => kinds[i] === kind);
    const energy = choice('energie'), time = choice('zeit');
    const parts = ['Du hast ' + count(thoughts.length, 'einen Gedanken', 'Gedanken') + ' aus deinem Kopf geholt.'];
    const h = by('heute').length, w = by('warten').length, g = by('gefuehl').length, m = by('nicht').length, u = by('unklar').length;
    if (h) parts.push(h === 1 ? 'Einer davon will heute etwas von dir.' : h + ' davon wollen heute etwas von dir.');
    if (w) parts.push(w === 1 ? 'Einer ist offen, darf aber warten.' : w + ' sind offen, dürfen aber warten.');
    if (g) parts.push(g === 1 ? 'Einer ist ein Gefühl – das muss nicht gelöst werden.' : g + ' sind Gefühle – die müssen nicht gelöst werden.');
    if (m) parts.push(m === 1 ? 'Einer gehört eigentlich gar nicht zu dir.' : m + ' gehören eigentlich gar nicht zu dir.');
    if (u) parts.push(u === 1 ? 'Einer darf erst mal liegen bleiben.' : u + ' dürfen erst mal liegen bleiben.');
    if (h + w) parts.push(closing[energy]);
    sorter.querySelector('.sorter-summary').textContent = parts.join(' ');

    const box = sorter.querySelector('.sorter-groups');
    box.textContent = '';
    groups.forEach(group => {
      const items = by(group.kind);
      if (!items.length) return;
      const wrap = document.createElement('div'); wrap.className = 'sorter-group';
      const title = document.createElement('h4'); title.textContent = group.title;
      const list = document.createElement(group.ordered ? 'ol' : 'ul');
      items.forEach(text => { const li = document.createElement('li'); li.textContent = text; list.append(li); });
      wrap.append(title, list); box.append(wrap);
    });

    const top = by('heute')[0] || by('warten')[0];
    const next = top ? nextSteps[energy][time].replace('{x}', '„' + top + '“') : nothingOpen;
    sorter.querySelector('.sorter-next-text').textContent = next;
    show(4);
  }

  sorter.querySelectorAll('[data-go]').forEach(button => button.addEventListener('click', () => {
    const target = button.dataset.go;
    if (target === '3') {
      thoughts = textField.value.split('\n').map(line => line.trim()).filter(Boolean).slice(0, 15);
      if (!thoughts.length) { hint.textContent = 'Schreib mindestens einen Gedanken auf – ein Wort reicht.'; textField.focus(); return; }
      hint.textContent = '';
      kinds = []; current = 0; showThought();
    }
    show(target);
  }));
  sorter.querySelectorAll('[data-kind]').forEach(button => button.addEventListener('click', () => {
    kinds[current] = button.dataset.kind;
    if (current < thoughts.length - 1) { current++; showThought(); sorter.querySelector('.sorter-step[data-step="3"] h3').focus({preventScroll: true}); return; }
    const today = thoughts.map((t, i) => i).filter(i => kinds[i] === 'heute');
    if (today.length < 2) { result(); return; }
    const pick = sorter.querySelector('.sorter-pick');
    pick.textContent = '';
    today.forEach(index => {
      const option = document.createElement('button');
      option.type = 'button'; option.textContent = thoughts[index];
      option.addEventListener('click', () => {
        const order = [index, ...thoughts.map((t, i) => i).filter(i => i !== index)];
        thoughts = order.map(i => thoughts[i]); kinds = order.map(i => kinds[i]);
        result();
      });
      pick.append(option);
    });
    show('pick');
  }));
  sorter.querySelector('[data-prev]').addEventListener('click', () => {
    if (current > 0) { current--; showThought(); } else show(2);
  });
  sorter.querySelector('[data-restart]').addEventListener('click', () => { textField.value = ''; thoughts = []; kinds = []; show(1); });
  sorter.querySelector('[data-print]').addEventListener('click', () => {
    document.body.classList.add('print-sorter');
    window.print();
  });
  window.addEventListener('afterprint', () => document.body.classList.remove('print-sorter'));
}
