print('Enter ciphertext: ')
ciphertext = input()

ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
monofrequencies = [
    0.08167, 0.01492, 0.02782, 0.04258, 0.12702, 0.02228, 0.02015,  
    0.06094, 0.06966, 0.00153, 0.00772, 0.04025, 0.02406, 0.06749,  
    0.07507, 0.01929, 0.00095, 0.05987, 0.06327, 0.09056, 0.02758, 
    0.00978, 0.02360, 0.00150, 0.01974, 0.00074                    
]

from math import sqrt

def cosangle(x, y):
    numerator = sum(a * b for a, b in zip(x, y))
    lengthx = sqrt(sum(a**2 for a in x))
    lengthy = sqrt(sum(b**2 for b in y))
    return numerator / (lengthx * lengthy)


def calculate_best_period(ciphertext, max_period=20):
    best_period = 1
    best_avg_ioc = 0
    
    for period in range(1, max_period + 1):
        groups = [''] * period
        for i, char in enumerate(ciphertext):
            groups[i % period] += char
        
        total_ioc = 0
        valid_groups = 0
        for group in groups:
            if len(group) < 2:
                continue 
            freq = [0] * 26
            for c in group:
                freq[ALPHABET.index(c)] += 1
            total = len(group)
            numer = sum(f * (f - 1) for f in freq)
            denom = total * (total - 1)
            if denom != 0:
                group_ioc = numer / denom
                total_ioc += group_ioc
                valid_groups += 1
        
        if valid_groups == 0:
            continue 
            
        avg_ioc = total_ioc / valid_groups

        if avg_ioc > best_avg_ioc:
            best_avg_ioc = avg_ioc
            best_period = period
            
    return best_period

period = calculate_best_period(ciphertext)

slices = [''] * period
for i, ch in enumerate(ciphertext):
    slices[i % period] += ch

frequencies = []
for i in range(period):
    frequencies.append([0]*26)
    for j in range(len(slices[i])):
       frequencies[i][ALPHABET.index(slices[i][j])] += 1
    for j in range(26):
        frequencies[i][j] = frequencies[i][j] / len(slices[i])

key = ['A']*period
for i in range(period):
    for j in range(26):
        testtable = frequencies[i][j:]+frequencies[i][:j]
        if cosangle(monofrequencies,testtable) > 0.9:
            key[i] = ALPHABET[j]


print('Recovered key: ' + "".join(key))

def vigDecrypt(ciphertext, key):
    decrypted = ''
    for i, ch in enumerate(ciphertext):
        decrypted += unshiftLetter(ch, key[i % len(key)])
    return decrypted

def unshiftLetter(letter, keyLetter):
    letter = ord(letter) - ord("A")
    keyLetter = ord(keyLetter) - ord("A")
    new = (letter - keyLetter) % 26
    return chr(new + ord("A"))

print("Decipher with key? (y/n):")
if(input() == 'y'):
    print(vigDecrypt(ciphertext, key))