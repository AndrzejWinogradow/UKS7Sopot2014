// Przechowuje dane załadowane z JSON
let tableData = [];
// Przechowuje aktualny kierunek sortowania dla każdej kolumny
let sortDirections = {
    name: 'asc',
    date: 'asc',
    time: 'asc',
    pts: 'asc',
    place: 'asc',
    PB: 'asc'
};

// Funkcja dodaje datę do pdfa/wydruku
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

// Funkcja konwertująca czas z min na sek
function convertTimeToSeconds(timeString) {
    if (timeString.includes(':')) {
        const [minutes, seconds] = timeString.split(':');
        return parseInt(minutes, 10) * 60 + parseFloat(seconds);
    }
    return parseFloat(timeString);
}

// Funkcja generująca tabelę
let dataToRender = []; // Deklaracja zmiennej w zasięgu globalnym

function generateTable(data) {
    const tableBody = document.querySelector('#results-table tbody');
    tableBody.innerHTML = ''; // Wyczyść poprzednie dane

    // Oblicz PB dla zawodników na podstawie danych
    const personalBests = calculatePB(data); // Wywołanie funkcji calculatePB

    const dataToRender = filteredData.length > 0 ? filteredData : data;

    // Oblicz isPB dla każdego rekordu (przed generowaniem wierszy)
    dataToRender.forEach(record => {
        const timeInSeconds = convertTimeToSeconds(record.time);
        record.isPB = timeInSeconds === personalBests[record.name]; // True, jeśli to PB
    });

    dataToRender.forEach((record, index) => {
        const row = document.createElement('tr');

        // Dodaj numerację rzędów
        const rowNumberCell = document.createElement('td');
        rowNumberCell.textContent = index + 1; // Numer wiersza (1-based)
        rowNumberCell.classList.add('row-number'); // Klasa dla stylizacji
        row.appendChild(rowNumberCell);

        // Tworzenie komórek dla istniejących kolumn
        Object.entries(record).forEach(([key, value]) => {
            // Pomiń renderowanie isPB (nie chcemy go w UI)
            if (key === 'isPB') return;

            const cell = document.createElement('td');
            cell.textContent = value;
            row.appendChild(cell);
        });

        // Tworzenie komórki PB
        const pbCell = document.createElement('td');
        pbCell.classList.add('pb-cell');

        const timeInSeconds = convertTimeToSeconds(record.time); // Użycie funkcji konwertującej

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
let filteredData = []; // Przechowuje aktualnie przefiltrowane dane

function sortTable(column) {
    const direction = sortDirections[column]; // Pobierz aktualny kierunek sortowania

    // Wybierz dane do sortowania: użyj filtrowanych danych, jeśli są dostępne
    const dataToSort = filteredData.length > 0 ? filteredData : tableData;

    dataToSort.sort((a, b) => {
        let comparison = 0;

        if (column === 'date') {
            comparison = new Date(a[column]) - new Date(b[column]); // Porównanie dat
        } else if (column === 'time') {
            const timeToSeconds = time => convertTimeToSeconds(time);
            comparison = timeToSeconds(a[column]) - timeToSeconds(b[column]); // Porównanie czasu
        } else if (column === 'pts' || column === 'place' ) {
            comparison = parseInt(a[column]) - parseInt(b[column]); // Porównanie liczbowe
        } else if (column === 'PB') {
            comparison = (a.isPB === b.isPB) ? 0 : a.isPB ? -1 : 1; // Sortuj PB jako pierwsze
        } else {
            comparison = a[column].localeCompare(b[column]); // Porównanie tekstowe
        }

        return direction === 'asc' ? comparison : -comparison; // Uwzględnienie kierunku
    });

    // Przełącz kierunek sortowania
    sortDirections[column] = direction === 'asc' ? 'desc' : 'asc';

    updateSortIcons(); // Aktualizacja ikon sortowania
    generateTable(dataToSort); // Odśwież tabelę z posortowanymi danymi
}

function filterDataBySelectedNames(data) {
    const selectedNames = Array.from(document.querySelectorAll('input[name="name-filter"]:checked'))
        .map(checkbox => checkbox.value);

    filteredData = data.filter(record => selectedNames.includes(record.name)); // Aktualizacja filtrowanych danych
    return filteredData;
}


// Funkcja do zmiany pliku JSON
async function changeFile() {
    const fileName = document.getElementById('file-select').value; // Pobierz wybrany plik
    const data = await loadJSON(fileName); // Załaduj dane z pliku
    tableData = data; // Zaktualizuj globalne dane
    generateNameCheckboxDropdown(data); // Wygeneruj rozwijaną listę z checkboxami
    generateTable(data); // Wygeneruj tabelę
    updateSortIcons(); // Inicjalizacja ikon sortowania
}

document.getElementById('file-select').addEventListener('change', changeFile);



// Funkcja zmieniająca widok
function changeView() {
    const view = document.getElementById('view-select').value; // Pobierz wybraną opcję
    document.body.className = `view-${view}`; // Ustaw odpowiednią klasę widoku
}

// Funkcja główna
async function main() {
    const data = await loadJSON('50m_dowolnym.json'); // Załaduj domyślny plik
    tableData = data; // Zaktualizuj globalne dane

    generateNameCheckboxDropdown(data); // Wygeneruj rozwijaną listę z checkboxami
    generateTable(data); // Wygeneruj tabelę
    updateSortIcons(); // Inicjalizacja ikon sortowania
    changeView(); // Ustaw początkowy widok

    // Dodaj event listenery tutaj:
    // 1. Obsługa rozwijania listy
    document.querySelector('.dropdown-toggle').addEventListener('click', () => {
        const dropdown = document.getElementById('name-selector');
        dropdown.classList.toggle('open');
    });

    // 2. Obsługa zmiany zaznaczeń w checkboxach
    document.getElementById('name-checkbox-list').addEventListener('change', () => {
        filteredData = filterDataBySelectedNames(tableData); // Aktualizacja przefiltrowanych danych
        generateTable(filteredData); // Odśwież tabelę
    });

}

// Oblicza rekordy PB (Personal Best) dla zawodników
function calculatePB(data) {
    const personalBests = {};

    data.forEach(record => {
        const name = record.name;
        const timeInSeconds = convertTimeToSeconds(record.time);

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

// Funkcja generowania listy z nazwiskami
function generateNameCheckboxes(data) {
    const nameForm = document.getElementById('name-form');
    nameForm.innerHTML = ''; // Wyczyść poprzednie checkboxy

    // Pobierz unikalne nazwiska z danych
    const uniqueNames = [...new Set(data.map(record => record.name))];

    // Twórz checkboxy dla każdego nazwiska
    uniqueNames.forEach(name => {
        const label = document.createElement('label');
        label.textContent = name;

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = name;
        checkbox.name = 'name-filter';
        checkbox.checked = true; // Domyślnie wszystkie zaznaczone

        label.prepend(checkbox); // Dodaj checkbox przed nazwiskiem
        nameForm.appendChild(label);

        // Dodaj separator dla czytelności
        nameForm.appendChild(document.createElement('br'));
    });
}

function generateNameDropdown(data) {
    const nameSelect = document.getElementById('name-select');
    nameSelect.innerHTML = ''; // Wyczyść poprzednie opcje

    // Pobierz unikalne nazwiska z danych
    const uniqueNames = [...new Set(data.map(record => record.name))];

    // Twórz opcje dla każdego nazwiska
    uniqueNames.forEach(name => {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        option.selected = true; // Domyślnie wszystkie zaznaczone
        nameSelect.appendChild(option);
    });
}

// Funkcja wyboru na liście z nazwiskami
function filterDataBySelectedNames(data) {
    const selectedNames = Array.from(document.querySelectorAll('input[name="name-filter"]:checked'))
        .map(checkbox => checkbox.value);

    // Filtruj dane tylko dla wybranych zawodników
    return data.filter(record => selectedNames.includes(record.name));
}

function generateNameCheckboxDropdown(data) {
    const dropdownMenu = document.getElementById('name-checkbox-list');
    dropdownMenu.innerHTML = ''; // Wyczyść poprzednie checkboxy

    // Pobierz unikalne nazwiska
    const uniqueNames = [...new Set(data.map(record => record.name))];

    // Generuj checkboxy dla każdego nazwiska
    uniqueNames.forEach(name => {
        const label = document.createElement('label');
        label.textContent = name;

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = name;
        checkbox.name = 'name-filter';
        checkbox.checked = true; // Domyślnie wszystkie zaznaczone

        label.prepend(checkbox); // Dodaj checkbox przed tekstem
        dropdownMenu.appendChild(label);
    });
}


// Dopasowanie wyglądu na telefonach
document.addEventListener("DOMContentLoaded", () => {
    if (window.innerWidth <= 768) { // Dla urządzeń o szerokości ekranu <= 768px
        document.querySelector('meta[name="viewport"]').setAttribute('content', 'width=device-width, initial-scale=0.5');
    }
});


main(); // Uruchom aplikację
