const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const monoFrequencies = [
  0.08167, 0.01492, 0.02782, 0.04258, 0.12702,
  0.02228, 0.02015, 0.06094, 0.06966, 0.00153,
  0.00772, 0.04025, 0.02406, 0.06749, 0.07507,
  0.01929, 0.00095, 0.05987, 0.06327, 0.09056,
  0.02758, 0.00978, 0.02360, 0.00150, 0.01974, 0.00074
];

let globalKey = "";
let globalCipher = "";

function cosangle(x, y) {
  const dot = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
  const magX = Math.sqrt(x.reduce((sum, xi) => sum + xi ** 2, 0));
  const magY = Math.sqrt(y.reduce((sum, yi) => sum + yi ** 2, 0));
  return dot / (magX * magY);
}

function calculateBestPeriod(text, maxPeriod = 20) {
  let bestPeriod = 1;
  let bestAvgIOC = 0;

  for (let period = 1; period <= maxPeriod; period++) {
    let groups = Array.from({ length: period }, () => '');

    for (let i = 0; i < text.length; i++) {
      groups[i % period] += text[i];
    }

    let totalIOC = 0;
    let validGroups = 0;

    for (let group of groups) {
      if (group.length < 2) continue;

      const freq = Array(26).fill(0);
      for (let c of group) {
        freq[ALPHABET.indexOf(c)]++;
      }

      const total = group.length;
      const numer = freq.reduce((sum, f) => sum + f * (f - 1), 0);
      const denom = total * (total - 1);
      const ioc = denom ? numer / denom : 0;

      totalIOC += ioc;
      validGroups++;
    }

    if (validGroups > 0) {
      const avgIOC = totalIOC / validGroups;
      if (avgIOC > bestAvgIOC) {
        bestAvgIOC = avgIOC;
        bestPeriod = period;
      }
    }
  }

  return bestPeriod;
}

function analyzeCipher() {
  const input = document.getElementById('ciphertext').value.toUpperCase().replace(/[^A-Z]/g, '');
  if (!input) {
    alert("Please enter ciphertext with only letters A–Z.");
    return;
  }

  globalCipher = input;

  const period = calculateBestPeriod(input);
  const slices = Array.from({ length: period }, () => '');

  for (let i = 0; i < input.length; i++) {
    slices[i % period] += input[i];
  }

  const key = Array(period).fill('A');

  for (let i = 0; i < period; i++) {
    const freq = Array(26).fill(0);
    for (let char of slices[i]) {
      freq[ALPHABET.indexOf(char)]++;
    }
    for (let j = 0; j < 26; j++) {
      freq[j] /= slices[i].length;
    }

    for (let shift = 0; shift < 26; shift++) {
      const shifted = freq.slice(shift).concat(freq.slice(0, shift));
      if (cosangle(monoFrequencies, shifted) > 0.9) {
        key[i] = ALPHABET[shift];
        break;
      }
    }
  }

  globalKey = key.join('');
  document.getElementById('keyDisplay').innerText = globalKey;
  document.getElementById('keyOutput').classList.remove('hidden');
  document.getElementById('result').classList.add('hidden');
}

function decrypt() {
  const decrypted = vigDecrypt(globalCipher, globalKey);
  document.getElementById('decryptedText').innerText = decrypted;
  document.getElementById('result').classList.remove('hidden');
}

function cancel() {
  document.getElementById('keyOutput').classList.add('hidden');
  document.getElementById('result').classList.add('hidden');
}

function unshiftLetter(c, k) {
  const cCode = ALPHABET.indexOf(c);
  const kCode = ALPHABET.indexOf(k);
  return ALPHABET[(cCode - kCode + 26) % 26];
}

function vigDecrypt(cipher, key) {
  let result = '';
  for (let i = 0; i < cipher.length; i++) {
    result += unshiftLetter(cipher[i], key[i % key.length]);
  }
  return result;
}
