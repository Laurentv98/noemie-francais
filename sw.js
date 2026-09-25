// Renard Malin — le « service worker » : il garde une copie de l'appli sur l'appareil,
// pour qu'elle s'ouvre même sans Internet (en brousse, sur les îles, dans l'avion…).
//
// - Les pages (index.html, infos.html) : on demande d'abord la dernière version à Internet ;
//   sans réseau, on prend la copie gardée.
// - Les autres fichiers ont un numéro de version (?v=…) : la copie gardée suffit.
// - Three.js (la course) et les polices : gardés la première fois qu'ils sont chargés.
//
// ⚠️ À chaque mise à jour : changer VERSION ici aussi (la même que les ?v= de index.html).
const VERSION = '2026-09-25-g';
const CACHE = 'renard-malin-' + VERSION;
const THREE = 'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.min.js';
const IMAGES = ['img/roxy-ouais.png', 'img/roxy-reflechit.png', 'img/favicon.png', 'img/icone-180.png', 'img/icone-192.png'];

// À l'installation : on range tout ce que la page d'accueil charge (lu dans index.html)
self.addEventListener('install', evenement => {
  evenement.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    // (cache: 'reload' : on prend tout sur Internet, jamais une vieille copie du navigateur)
    const reponse = await fetch('index.html', { cache: 'reload' });
    const html = await reponse.clone().text();
    const fichiers = [...html.matchAll(/(?:src|href)="((?:js|css|data)\/[^"]+)"/g)].map(m => m[1]);
    await cache.put('index.html', reponse.clone());
    await cache.put('./', reponse); // la même page, pour l'adresse sans « index.html »
    await cache.addAll(['infos.html', 'manifest.json', ...IMAGES, ...fichiers].map(u => new Request(u, { cache: 'reload' })));
    // La course : si Three.js ne se charge pas maintenant, il sera gardé à la première course
    try { await cache.add(new Request(THREE, { mode: 'cors' })); } catch (e) { /* plus tard */ }
    self.skipWaiting();
  })());
});

// À l'activation : on jette les copies des anciennes versions
self.addEventListener('activate', evenement => {
  evenement.waitUntil((async () => {
    const noms = await caches.keys();
    await Promise.all(noms.filter(nom => nom.startsWith('renard-malin-') && nom !== CACHE).map(nom => caches.delete(nom)));
    await self.clients.claim();
  })());
});

const estUnePage = requete => requete.mode === 'navigate' || /\/(index|infos)\.html$|\/$/.test(new URL(requete.url).pathname);
const gardable = url => url.origin === self.location.origin || /cdn\.jsdelivr\.net|fonts\.(googleapis|gstatic)\.com/.test(url.host);

self.addEventListener('fetch', evenement => {
  const requete = evenement.request;
  if (requete.method !== 'GET') return;
  const url = new URL(requete.url);
  if (!gardable(url)) return;

  if (url.origin === self.location.origin && estUnePage(requete)) {
    // D'abord Internet (pour avoir la dernière version), sinon la copie
    evenement.respondWith((async () => {
      const cache = await caches.open(CACHE);
      const copie = async () => (await cache.match(requete, { ignoreSearch: true })) || (await cache.match('index.html'));
      const internet = fetch(requete).then(reponse => {
        if (reponse.ok) cache.put(requete, reponse.clone());
        return reponse;
      });
      // Un wifi qui capte à peine : au bout de 3 secondes, on ouvre la copie gardée (si on en a une)
      const attente = new Promise(resolve => setTimeout(resolve, 3000)).then(copie);
      try {
        return (await Promise.race([internet, attente.then(r => r || internet)]));
      } catch (e) {
        return (await copie()) || Response.error();
      }
    })());
    return;
  }

  // D'abord la copie, sinon Internet (et on garde ce qu'on a reçu)
  evenement.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const garde = await cache.match(requete);
    if (garde) return garde;
    const reponse = await fetch(requete);
    // (une réponse « opaque » ne se lit pas : on ne garde que la feuille de style des polices)
    if (reponse.ok || (reponse.type === 'opaque' && url.host === 'fonts.googleapis.com')) cache.put(requete, reponse.clone());
    return reponse;
  })());
});
