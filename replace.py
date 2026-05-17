from pathlib import Path

# === CONFIGURA QUI ===
cartella_progetto = Path(r"C:/Users/Scuola/Desktop/github/registro-voti")

testo_da_cercare = '—'
testo_nuovo = '-'

# Estensioni da modificare
estensioni = {'.html', '.css', '.js', '.json', '.md', '.vue'}

# Cartelle da ignorare
cartelle_escluse = {
    '.git',
    'node_modules',
    'dist',
    'build',
    '__pycache__',
    '.vscode'
}

# === SCRIPT ===
modificati = 0

for file in cartella_progetto.rglob("*"):
    # Salta se il file si trova dentro una cartella esclusa
    if any(cartella in cartelle_escluse for cartella in file.parts):
        continue

    if file.is_file() and file.suffix in estensioni:
        try:
            contenuto = file.read_text(encoding="utf-8")

            if testo_da_cercare in contenuto:
                nuovo_contenuto = contenuto.replace(
                    testo_da_cercare,
                    testo_nuovo
                )

                file.write_text(
                    nuovo_contenuto,
                    encoding="utf-8"
                )

                print(f"Modificato: {file}")
                modificati += 1

        except Exception as e:
            print(f"Errore in {file}: {e}")

print(f"\nFinito. File modificati: {modificati}")