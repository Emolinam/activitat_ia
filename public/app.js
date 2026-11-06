const carret = [];

async function carregarProductes(categoria = '') {
  const resposta = await fetch(`/api/productes?categoria=${categoria}`);
  const productes = await resposta.json();
  const contenidor = document.querySelector('#productes');
  contenidor.innerHTML = '';
  for (const p of productes) {
    const targeta = document.createElement('article');
    targeta.className = 'producte';

    const mitjanaText =
      p.mitjana === null || p.numRessenyes === 0
        ? 'Sense ressenyes'
        : `★ ${Number(p.mitjana).toFixed(1).replace('.', ',')} (${p.numRessenyes} ressenyes)`;

    const nom = document.createElement('h3');
    nom.textContent = p.nom;
    targeta.appendChild(nom);

    const preu = document.createElement('p');
    preu.textContent = `${p.preu.toFixed(2)} €`;
    targeta.appendChild(preu);

    const mitjana = document.createElement('p');
    mitjana.textContent = mitjanaText;
    targeta.appendChild(mitjana);

    const afegeix = document.createElement('button');
    afegeix.className = 'afegeix';
    afegeix.textContent = 'Afegeix';
    afegeix.addEventListener('click', () => afegirAlCarret(p));
    targeta.appendChild(afegeix);

    const veure = document.createElement('button');
    veure.className = 'veure';
    veure.textContent = 'Ressenyes';
    veure.addEventListener('click', () => obrirDetall(p));
    targeta.appendChild(veure);
    contenidor.appendChild(targeta);
  }
}

async function afegirAlCarret(producte) {
  const existent = carret.find((i) => i.id === producte.id);
  if (existent) {
    existent.quantitat++;
  } else {
    carret.push({ id: producte.id, nom: producte.nom, preu: producte.preu, quantitat: 1 });
  }
  await actualitzarCarret();
}

async function actualitzarCarret() {
  const contenidor = document.querySelector('#carret');
  contenidor.innerHTML = '';
  for (const i of carret) {
    const element = document.createElement('li');
    element.textContent = `${i.nom} × ${i.quantitat}`;
    contenidor.appendChild(element);
  }

  const resposta = await fetch('/api/carret/total', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items: carret, descompte: 10 }),
  });

  const { subtotal, enviament, total } = await resposta.json();
  document.querySelector('#subtotal').textContent = `${Number(subtotal).toFixed(2)} €`;
  document.querySelector('#enviament').textContent = `${Number(enviament).toFixed(2)} €`;
  document.querySelector('#total').textContent = `${Number(total).toFixed(2)} €`;
}

let producteActual = null;

async function obrirDetall(producte) {
  producteActual = producte;
  document.querySelector('#detall-nom').textContent = producte.nom;
  document.querySelector('#detall-descripcio').textContent = producte.descripcio;
  await carregarRessenyes(producte.id);
  document.querySelector('#detall').showModal();
}

async function carregarRessenyes(producteId) {
  const resposta = await fetch(`/api/ressenyes?producteId=${producteId}`);
  const ressenyes = await resposta.json();
  const contenidor = document.querySelector('#ressenyes');
  contenidor.innerHTML = '';
  for (const r of ressenyes) {
    const element = document.createElement('li');
    const autor = document.createElement('strong');
    autor.textContent = r.autor;
    element.appendChild(autor);
    element.append(` (${r.puntuacio}/5): ${r.text}`);
    contenidor.appendChild(element);
  }
}

document.querySelector('#form-ressenya').addEventListener('submit', async (e) => {
  e.preventDefault();
  const dades = Object.fromEntries(new FormData(e.target));
  await fetch('/api/ressenyes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...dades, productId: producteActual.id }),
  });
  e.target.reset();
  await carregarRessenyes(producteActual.id);
});

document.querySelector('#tanca').addEventListener('click', () => {
  document.querySelector('#detall').close();
});

document.querySelector('#filtre-categoria').addEventListener('change', (e) => {
  carregarProductes(e.target.value);
});

document.querySelector('#any-actual').textContent = new Date().getFullYear();

carregarProductes();
