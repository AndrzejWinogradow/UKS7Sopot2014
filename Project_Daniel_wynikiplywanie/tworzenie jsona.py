import json
import os

# Nazwa pliku JSON
FILENAME = '50m_dowolnym.json'


# Funkcja do wczytywania danych z pliku JSON
def load_records():
    if os.path.exists(FILENAME):
        with open(FILENAME, 'r') as file:
            return json.load(file)
    return []  # Zwróć pustą listę, jeśli plik nie istnieje


# Funkcja do zapisywania danych do pliku JSON
def save_records(records):
    with open(FILENAME, 'w') as file:
        json.dump(records, file, indent=4)


# Funkcja do dodawania rekordu
def add_record(name, date, time, pts, place):
    records = load_records()  # Wczytaj istniejące dane
    new_record = {
        'name': name,
        'date': date,
        'time': time,
        'pts': pts,
        'place': place
    }
    records.append(new_record)  # Dodaj nowy rekord
    save_records(records)  # Zapisz dane do pliku
    print(f"Dodano rekord: {new_record}")


# Funkcja główna
def main():
    while True:
        print("\nDodawanie rekordu do pliku JSON:")
        name = input("Podaj Nazwisko i Imię: ")
        date = input("Podaj datę (YYYY-MM-DD): ")
        time = input("Podaj czas (format HH:MM:SS.SSS): ")
        pts = input("Podaj punkty FINA: ")
        place = input("Podaj miejsce na zawodach: ")

        add_record(name, date, time, pts, place)

        another = input("Czy chcesz dodać kolejny rekord? (tak/nie): ").strip().lower()
        if another != 'tak':
            break


# Uruchomienie programu
if __name__ == "__main__":
    main()
