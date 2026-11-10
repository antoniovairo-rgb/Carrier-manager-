/* [giro 146 PO-348 «spalle larghe e proporzionate al corpo in tutte le scene e negli highlights»] MISURA DEL CORPO 3D (nella pagina).
   Una funzione sola, iniettata con page.addInitScript, che prende un corpo 3D VIVO (root di un avatar: CGTrader, «regular», CH38) e
   restituisce le sue proporzioni lette dai vertici SKINNATI (la posa che si vede) e dalle ossa, tutte in coordinate del mondo:
     H        statura: cima dei vertici di testa/collo − fondo dei vertici di piede/polpaccio (corpo in piedi);
     Sj       spalle alle ARTICOLAZIONI: distanza fra le teste degli omeri (upperarm_l/r · LeftArm/RightArm);
     Sv       spalle VISIBILI (bideltoideo): estensione laterale dei vertici di clavicola/omero entro 0,10·H dalla testa dell'omero;
     Aj/Av    anche alle articolazioni (thigh_l/r) e visibili (vertici bacino/coscia entro ±0,05·H dalla quota delle anche);
     ua, fa   omero e avambraccio (lunghezze d'osso nel mondo) · mano = distanza massima dei vertici di mano/dita dal polso;
     sx/sy/sz scala del mondo del corpo (non uniforme se sx != sy) · gomiti: distanza laterale del gomito dall'asse del busto / (Sj/2).
   Ogni rapporto e' adimensionale: a 360x800 e a 1440x900 dice lo stesso numero. Uso: import { INIETTA146 } e page.addInitScript(INIETTA146). */
export const INIETTA146 = `(() => {
  const GRP = n => { n = String(n || '').replace(/^mixamorig\\d*/i, ''); if (/^ik_/i.test(n)) return null;
    if (/^(clavicle_|upperarm_|leftshoulder|rightshoulder|leftarm$|rightarm$)/i.test(n)) return 'spalla';
    if (/(hand|index|middle|ring|pinky|thumb)/i.test(n)) return 'mano';
    if (/^(pelvis|hips$|thigh_|leftupleg|rightupleg)/i.test(n)) return 'anca';
    if (/^(head|neck)/i.test(n)) return 'testa';
    if (/^(foot_|ball_|calf_|leftfoot|rightfoot|lefttoe|righttoe|leftleg|rightleg)/i.test(n)) return 'piede';
    return 'altro'; };
  window.__misura146 = (root) => { try {
    const T = THREE; if (!root) return null; root.updateMatrixWorld(true);
    const ossa = {}; root.traverse(o => { if (o.isBone) { const k = String(o.name).replace(/^mixamorig\\d*/i, '').toLowerCase(); if (!ossa[k]) ossa[k] = o; } });
    const P = (...n) => { for (const x of n) if (ossa[x.toLowerCase()]) return ossa[x.toLowerCase()]; return null; };
    const B = { ual: P('upperarm_l', 'LeftArm'), uar: P('upperarm_r', 'RightArm'), lal: P('lowerarm_l', 'LeftForeArm'), lar: P('lowerarm_r', 'RightForeArm'),
      hl: P('hand_l', 'LeftHand'), hr: P('hand_r', 'RightHand'), thl: P('thigh_l', 'LeftUpLeg'), thr: P('thigh_r', 'RightUpLeg'),
      pel: P('pelvis', 'Hips'), neck: P('neck_01', 'Neck'), head: P('head', 'Head') };
    if (!B.ual || !B.uar || !B.thl || !B.thr || !B.pel || !B.neck) return { errore: 'ossa mancanti' };
    const W = b => b.getWorldPosition(new T.Vector3());
    const UL = W(B.ual), UR = W(B.uar), TL = W(B.thl), TR = W(B.thr), PE = W(B.pel), NE = W(B.neck);
    const lat = UL.clone().sub(UR); lat.y = 0; if (lat.lengthSq() < 1e-10) return { errore: 'asse spalle nullo' }; lat.normalize();
    const latA = TL.clone().sub(TR); latA.y = 0; latA.normalize();
    /* vertici skinnati visibili */
    const vivo = o => { for (let p = o; p; p = p.parent) if (p.visible === false) return false; return true; };
    const V = { spalla: [], mano: [], anca: [], testa: [], piede: [] }; const tv = new T.Vector3(); let nmesh = 0;
    root.traverse(m => { if (!m.isSkinnedMesh || !vivo(m) || !m.geometry || !m.geometry.attributes.skinIndex) return; nmesh++;
      const g = m.geometry, si = g.attributes.skinIndex, sw = g.attributes.skinWeight, n = g.attributes.position.count, bones = m.skeleton.bones;
      const passo = Math.max(1, Math.floor(n / 12000));
      for (let i = 0; i < n; i += passo) { let bi = -1, bw = -1; const ws4 = [sw.getX(i), sw.getY(i), sw.getZ(i), sw.getW(i)], is4 = [si.getX(i), si.getY(i), si.getZ(i), si.getW(i)]; for (let c = 0; c < 4; c++) { if (ws4[c] > bw) { bw = ws4[c]; bi = is4[c]; } }
        const gr = GRP(bones[bi] && bones[bi].name); if (!gr || !V[gr]) continue;
        m.boneTransform(i, tv); const w = tv.clone().applyMatrix4(m.matrixWorld); w.osso = bones[bi]; V[gr].push(w); } });
    if (!V.testa.length || !V.piede.length || !V.spalla.length) return { errore: 'vertici mancanti', nmesh };
    const H = Math.max(...V.testa.map(v => v.y)) - Math.min(...V.piede.map(v => v.y));
    const sp = V.spalla.filter(v => Math.min(v.distanceTo(UL), v.distanceTo(UR)) <= 0.10 * H).map(v => v.dot(lat));
    const Sv = Math.max(...sp) - Math.min(...sp);
    const yA = (TL.y + TR.y) / 2, an = V.anca.filter(v => Math.abs(v.y - yA) <= 0.05 * H).map(v => v.dot(latA));
    const Av = an.length ? Math.max(...an) - Math.min(...an) : null;
    const mano = (h, lato) => { if (!h) return null; const o = W(h); const L = V.mano.filter(v => { const d = v.distanceTo(o); return d < 0.25 * H && (v.osso === h || String(v.osso.name).toLowerCase().endsWith(lato) || /^(mixamorig\\d*)?(left|right)hand/i.test(v.osso.name) && /left/i.test(v.osso.name) === (lato === '_l')); });
      return L.length ? Math.max(...L.map(v => v.distanceTo(o))) : null; };
    const seg = (a, b) => (a && b) ? W(a).distanceTo(W(b)) : null;
    const asse = NE.clone().sub(PE).normalize(), gomito = (g) => { if (!g) return null; const d = W(g).sub(PE); const r = d.clone().sub(asse.clone().multiplyScalar(d.dot(asse))); return r.length() / (UL.distanceTo(UR) / 2); };
    const ws = new T.Vector3(); root.matrixWorld.decompose(new T.Vector3(), new T.Quaternion(), ws);
    let sc = null; root.traverse(o => { if (!sc && o.isSkinnedMesh && vivo(o)) { const s = new T.Vector3(); o.matrixWorld.decompose(new T.Vector3(), new T.Quaternion(), s); sc = s; } });
    const Sj = UL.distanceTo(UR), Aj = TL.distanceTo(TR), r = x => x == null ? null : +x.toFixed(4);
    const ua = ((seg(B.ual, B.lal) || 0) + (seg(B.uar, B.lar) || 0)) / 2, fa = ((seg(B.lal, B.hl) || 0) + (seg(B.lar, B.hr) || 0)) / 2;
    const ml = mano(B.hl, '_l'), mr = mano(B.hr, '_r');
    return { H: r(H), Sj: r(Sj), Sv: r(Sv), Aj: r(Aj), Av: r(Av), ua: r(ua), fa: r(fa), mano: r(((ml || 0) + (mr || 0)) / ((ml ? 1 : 0) + (mr ? 1 : 0) || 1)),
      SjH: r(Sj / H), SvH: r(Sv / H), SvAv: Av ? r(Sv / Av) : null, SjAj: r(Sj / Aj), uaH: r(ua / H), faH: r(fa / H), manoH: r((((ml || 0) + (mr || 0)) / ((ml ? 1 : 0) + (mr ? 1 : 0) || 1)) / H),
      gomiti: [r(gomito(B.lal)), r(gomito(B.lar))], maniSu: (B.hl && B.hr) ? r(Math.min(W(B.hl).y, W(B.hr).y) - Math.min(...V.piede.map(v => v.y))) : null, scala: sc ? [r(sc.x), r(sc.y), r(sc.z)] : null, nonUnif: sc ? r(Math.max(sc.x, sc.z) / sc.y) : null, nmesh,
      nv: { spalla: sp.length, anca: an.length, mano: V.mano.length } };
  } catch (e) { return { errore: String(e && e.message || e).slice(0, 120) }; } };
  /* PROVINO: la scena vera resa da una camera vicina al corpo (fronte e tre quarti), per vedere le spalle; restituisce due dataURL */
  window.__provino146 = (root, w = 300, h = 420) => { try { const T = THREE; let sc = root; while (sc.parent) sc = sc.parent; if (!sc.isScene) return null;
    root.updateMatrixWorld(true); const ossa = {}; root.traverse(o => { if (o.isBone) { const k = String(o.name).replace(/^mixamorig\d*/i, '').toLowerCase(); if (!ossa[k]) ossa[k] = o; } });
    const tl = (ossa.thigh_l || ossa.leftupleg), tr = (ossa.thigh_r || ossa.rightupleg), ne = (ossa.neck_01 || ossa.neck), pe = (ossa.pelvis || ossa.hips); if (!tl || !tr || !ne || !pe) return null;
    const W = b => b.getWorldPosition(new T.Vector3()); const lat = W(tl).sub(W(tr)); lat.y = 0; lat.normalize(); const fw = new T.Vector3().crossVectors(lat, new T.Vector3(0, 1, 0)).normalize();
    const c = W(pe).add(W(ne)).multiplyScalar(0.5); const hgt = W(ne).y - Math.min(W(tl).y, W(tr).y); const d = hgt * 6.8;
    let R = window.__R146; if (!R) { R = window.__R146 = new T.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true }); } R.setPixelRatio(1); R.setSize(w, h);
    const out = []; for (const a of [0, 0.75]) { const dir = fw.clone().applyAxisAngle(new T.Vector3(0, 1, 0), a); const cam = new T.PerspectiveCamera(30, w / h, 0.05, 200);
      cam.position.copy(c).addScaledVector(dir, d); cam.position.y += hgt * 0.05; cam.lookAt(c.x, c.y + hgt * 0.1, c.z); R.render(sc, cam); out.push(R.domElement.toDataURL('image/png')); }
    return out; } catch (e) { return null; } };
})();`;
