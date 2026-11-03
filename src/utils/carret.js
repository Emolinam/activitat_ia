/**
 * Arrodoneix un nombre a 2 decimals.
 * @param {number} valor
 * @returns {number}
 */
function arrodonir2(valor) {
  return Math.round((valor + Number.EPSILON) * 100) / 100;
}

/**
 * Calcula el subtotal sense descompte.
 * @param {Array<{preu: number, quantitat: number}>} items
 * @returns {number}
 */
export function calcularSubtotal(items = []) {
  return arrodonir2(
    items.reduce((acumulat, item) => acumulat + Number(item.preu || 0) * Number(item.quantitat || 0), 0),
  );
}

/**
 * Calcula el pes total del carret. Si no es defineix, assumeix 0,5 kg per unitat.
 * @param {Array<{pes?: number, quantitat?: number}>} items
 * @returns {number}
 */
export function calcularPes(items = []) {
  return arrodonir2(
    items.reduce((acumulat, item) => {
      const pesItem = Number(item.pes ?? 0.5);
      const quantitat = Number(item.quantitat || 0);
      return acumulat + pesItem * quantitat;
    }, 0),
  );
}

/**
 * Calcula el cost d'enviament seguint les tarifes de la documentació.
 * @param {Array<{pes?: number, quantitat?: number}>} items
 * @param {number} subtotalDescompte
 * @returns {number}
 */
export function calcularEnviament(items = [], subtotalDescompte = 0) {
  if (!items.length || subtotalDescompte <= 0) {
    return 0;
  }

  if (subtotalDescompte > 50) {
    return 0;
  }

  const pesTotal = calcularPes(items);

  if (pesTotal <= 1) {
    return 3.9;
  }

  if (pesTotal <= 5) {
    return 5.9;
  }

  return 9.9;
}

/**
 * Calcula el total del carret aplicant un descompte percentual.
 * @param {Array<{preu: number, quantitat: number}>} items
 * @param {number} descompte Percentatge entre 0 i 100.
 * @returns {number} Total arrodonit a 2 decimals.
 * @throws {RangeError} Si el descompte és fora de rang.
 */
export function calcularTotal(items, descompte = 0) {
  if (descompte < 0 || descompte > 100) {
    throw new RangeError('El descompte ha de ser entre 0 i 100');
  }

  const subtotal = calcularSubtotal(items);
  const total = subtotal * (1 - descompte / 100);
  return arrodonir2(total);
}

/**
 * Calcula el subtotal, l'enviament i el total final del carret.
 * @param {Array<{preu: number, quantitat: number, pes?: number}>} items
 * @param {number} descompte Percentatge entre 0 i 100.
 * @returns {{ subtotal: number, enviament: number, total: number }}
 */
export function calcularTotalCarret(items = [], descompte = 0) {
  if (descompte < 0 || descompte > 100) {
    throw new RangeError('El descompte ha de ser entre 0 i 100');
  }

  const subtotal = calcularTotal(items, descompte);
  const enviament = calcularEnviament(items, subtotal);
  return {
    subtotal,
    enviament,
    total: arrodonir2(subtotal + enviament),
  };
}
