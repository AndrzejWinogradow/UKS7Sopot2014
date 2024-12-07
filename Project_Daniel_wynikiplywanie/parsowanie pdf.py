# C:\Users\WINMEDIA\Downloads\wyniki.pdf

from tabula import read_pdf
import pandas as pd
import sys

# Ścieżka do pliku PDF
pdf_path = "C:/Users/WINMEDIA/Downloads/wyniki.pdf"

# Wczytanie tabeli z PDF do DataFrame
try:
    # Parametr `pages` określa, które strony odczytać (np. '1', '1-2', 'all')
    tables = read_pdf(pdf_path, pages='all', multiple_tables=True, lattice=True)

    # Sprawdź, ile tabel zostało odczytanych
    print(f"Liczba znalezionych tabel: {len(tables)}")

    # Przekształcenie pierwszej tabeli na DataFrame
    for i, table in enumerate(tables):
        print(f"Tabela {i + 1}:")
        print(table.head())
        # Zapisanie do pliku CSV (opcjonalnie)
        table.to_csv(f"tabela_{i+1}.csv", index=False)

except Exception as e:
    print(f"Wystąpił błąd: {e}")
