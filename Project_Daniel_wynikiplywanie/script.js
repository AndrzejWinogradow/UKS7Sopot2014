// Przechowuje dane załadowane z JSON
let tableData = [];
// Przechowuje aktualny kierunek sortowania dla każdej kolumny
let sortDirections = {
    name: 'asc',
    date: 'asc',
    time: 'asc',
    pts: 'asc',
    place: 'asc'
};

// print to pdf by browser
//document.getElementById('print-pdf').addEventListener('click', () => {
//    window.print();
//});

document.getElementById('print-pdf').addEventListener('click', () => {
    // Wstawienie aktualnej daty
    const dateElement = document.getElementById('current-date');
    const currentDate = new Date().toLocaleDateString('pl-PL');
    dateElement.textContent = currentDate;

    // Wywołanie opcji drukowania
    window.print();
});


// Funkcja do ładowania danych JSON
async function loadJSON(fileName) {
    const response = await fetch(fileName);
    const data = await response.json();
    tableData = data; // Zapisz dane globalnie
    return data;
}

// Funkcja generująca tabelę
function generateTable(data) {
    const tableBody = document.querySelector('#results-table tbody');
    tableBody.innerHTML = ''; // Wyczyść poprzednie dane

    // Oblicz PB dla zawodników
    const personalBests = calculatePB(data);

    data.forEach((record, index) => {
        const row = document.createElement('tr');

        // Dodaj numerację rzędów
        const rowNumberCell = document.createElement('td');
        rowNumberCell.textContent = index + 1; // Numer wiersza (1-based)
        rowNumberCell.classList.add('row-number'); // Klasa dla stylizacji
        row.appendChild(rowNumberCell);

        // Tworzenie komórek dla istniejących kolumn
        Object.entries(record).forEach(([key, value]) => {
            const cell = document.createElement('td');
            cell.textContent = value;
            row.appendChild(cell);
        });

        // Tworzenie komórki PB
        const pbCell = document.createElement('td');
        pbCell.classList.add('pb-cell');

        const timeInSeconds = parseFloat(record.time);

        // Jeśli czas to PB, dodaj ikonę
        if (timeInSeconds === personalBests[record.name]) {
            const icon = document.createElement('span');
            icon.classList.add('pb-checked');
            pbCell.appendChild(icon);
        }

        row.appendChild(pbCell); // Dodaj komórkę PB do wiersza

        // Tworzenie komórki "Medale"
        const medalCell = document.createElement('td');
        medalCell.classList.add('medal-cell');
        const recordPlace = parseInt(record.place, 10);

        // Przypisanie emotki medalu w zależności od miejsca
        if (recordPlace === 1) {
            medalCell.textContent = "🥇"; // Złoty medal
        } else if (recordPlace === 2) {
            medalCell.textContent = "🥈"; // Srebrny medal
        } else if (recordPlace === 3) {
            medalCell.textContent = "🥉"; // Brązowy medal
        } else {
            medalCell.textContent = ""; // Brak medalu
        }

        row.appendChild(medalCell); // Dodaj komórkę "Medale" do wiersza

        tableBody.appendChild(row); // Dodaj wiersz do tabeli
    });
}

// Funkcja do aktualizacji ikon sortowania
function updateSortIcons() {
    // Czyszczenie ikon sortowania
    document.querySelectorAll('span[id$="-sort"]').forEach(span => {
        span.textContent = '';
    });

    // Ustawienie ikony dla aktywnej kolumny
    for (const [key, direction] of Object.entries(sortDirections)) {
        const span = document.getElementById(`${key}-sort`);
        if (direction === 'asc') {
            span.textContent = '⬀'; // Rosnąco
        } else {
            span.textContent = '⬂'; // Malejąco
        }
    }
}
// Funkcja konwersująca wynik na sekundy
function convertTimeToSeconds(timeString) {
    // Jeśli czas jest w formacie `mm:ss.sss`
    if (timeString.includes(':')) {
        const [minutes, seconds] = timeString.split(':');
        return parseInt(minutes, 10) * 60 + parseFloat(seconds);
    }
    // Jeśli czas jest w formacie `ss.sss`
    return parseFloat(timeString);
}

// Funkcja sortująca
function sortTable(column) {
    const direction = sortDirections[column]; // Pobierz aktualny kierunek sortowania

    tableData.sort((a, b) => {
        let comparison = 0;

        if (column === 'date') {
            // Porównanie dat
            comparison = new Date(a[column]) - new Date(b[column]);
        } else if (column === 'time') {
            // Funkcja pomocnicza do konwersji czasu na sekundy
            const timeToSeconds = time => {
                if (time.includes(':')) {
                    const [minutes, seconds] = time.split(':');
                    return parseInt(minutes, 10) * 60 + parseFloat(seconds);
                }
                return parseFloat(time); // Jeśli czas jest tylko w formacie ss.sss
            };

            // Porównanie czasu w sekundach
            comparison = timeToSeconds(a[column]) - timeToSeconds(b[column]);
        } else if (column === 'pts') {
            // Porównanie punktów (liczbowo)
            comparison = parseInt(a[column]) - parseInt(b[column]);
        } else if (column === 'place') {
            // Porównanie miejsca (liczbowo)
            comparison = parseInt(a[column]) - parseInt(b[column]);
        } else {
            // Porównanie tekstowe (name)
            comparison = a[column].localeCompare(b[column]);
        }

        // Odwrócenie kierunku sortowania w przypadku malejącego
        return direction === 'asc' ? comparison : -comparison;
    });

    // Przełącz kierunek sortowania
    sortDirections[column] = direction === 'asc' ? 'desc' : 'asc';

    updateSortIcons(); // Aktualizacja ikon sortowania
    generateTable(tableData); // Odśwież tabelę z posortowanymi danymi
}

// Funkcja do zmiany pliku JSON
async function changeFile() {
    const fileName = document.getElementById('file-select').value; // Pobierz wybrany plik
    const data = await loadJSON(fileName); // Załaduj dane z pliku
    tableData = data; // Zaktualizuj globalne dane
    populateNameFilter(data); // Zaktualizuj filtr zawodników
    generateTable(data); // Wygeneruj tabelę
    updateSortIcons(); // Inicjalizacja ikon sortowania
}


// Funkcja zmieniająca widok
function changeView() {
    const view = document.getElementById('view-select').value; // Pobierz wybraną opcję
    document.body.className = `view-${view}`; // Ustaw odpowiednią klasę widoku
}

// Główna funkcja
async function main() {
    const data = await loadJSON('50m_dowolnym.json'); // Załaduj domyślny plik
    tableData = data; // Zaktualizuj globalne dane
    populateNameFilter(data); // Wygeneruj filtr zawodników
    generateTable(data); // Wygeneruj tabelę
    updateSortIcons(); // Inicjalizacja ikon sortowania
    changeView(); // Ustaw początkowy widok
}
/*async function main() {
        try {
            const data = await loadJSON('50m_dowolnym.json'); // Załaduj domyślny plik
            tableData = data; // Zaktualizuj globalne dane
            populateNameFilter(data); // Wygeneruj filtr zawodników
            generateTable(data); // Wygeneruj tabelę
            updateSortIcons(); // Inicjalizacja ikon sortowania
            changeView(); // Ustaw początkowy widok
            //const data = await response.json();

            // Now loop through the data
            data.forEach(record => {
                // ... your existing code to create table rows ...
                const medalCell = document.createElement('td');
                medalCell.classList.add('medal-cell');

                //Check if record and record.place exist
                if (record && record.place) {
                    const recordPlace = parseFloat(record.place);
                    // ... your medal assignment logic ...
                } else {
                    console.error("Record or record.place is missing:", record);
                    medalCell.textContent = ""; // Or handle the missing data appropriately
                }
                // ... rest of your code ...
            });
        } catch (error) {
            console.error("Error fetching data:", error);
            // Handle the error appropriately, e.g., display an error message to the user
        }
    }
*/
// Oblicza rekordy PB (Personal Best) dla zawodników
function calculatePB(data) {
    const personalBests = {};

    // Przejdź przez wszystkie rekordy, aby znaleźć najmniejszy czas dla każdego zawodnika
    data.forEach(record => {
        const { name, time } = record;

        const timeInSeconds = parseFloat(time); // Parsuj czas jako liczba

        // Aktualizuj PB, jeśli czas jest mniejszy niż dotychczasowy PB
        if (!personalBests[name] || timeInSeconds < personalBests[name]) {
            personalBests[name] = timeInSeconds;
        }
    });

    return personalBests;
}

// Funkcja generująca listę zawodników do filtra
function populateNameFilter(data) {
    const nameSelect = document.getElementById('name-select');
    nameSelect.innerHTML = '<option value="all">Wszyscy</option>'; // Resetuj opcje

    const uniqueNames = [...new Set(data.map(record => record.name))]; // Wyciągnij unikalne nazwiska

    uniqueNames.forEach(name => {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        nameSelect.appendChild(option);
    });
}

// Funkcja filtrująca dane według zawodnika
function filterByName() {
    const selectedName = document.getElementById('name-select').value;

    if (selectedName === 'all') {
        generateTable(tableData); // Wyświetl wszystkich zawodników
    } else {
        const filteredData = tableData.filter(record => record.name === selectedName);
        generateTable(filteredData); // Wyświetl tylko wybranego zawodnika
    }
}





main(); // Uruchom aplikację
