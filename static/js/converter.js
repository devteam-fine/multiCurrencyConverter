document.addEventListener('DOMContentLoaded', function() {
    // Constants
    const CURRENCIES = [
        {code: 'USD', name: 'US Dollar', symbol: '$'},
        {code: 'EUR', name: 'Euro', symbol: '€'},
        {code: 'GBP', name: 'British Pound', symbol: '£'},
        {code: 'JPY', name: 'Japanese Yen', symbol: '¥'},
        {code: 'AUD', name: 'Australian Dollar', symbol: 'A$'},
        {code: 'CAD', name: 'Canadian Dollar', symbol: 'C$'},
        {code: 'CHF', name: 'Swiss Franc', symbol: 'Fr'},
        {code: 'CNY', name: 'Chinese Yuan', symbol: '¥'},
        {code: 'INR', name: 'Indian Rupee', symbol: '₹'},
        {code: 'MXN', name: 'Mexican Peso', symbol: '$'},
        {code: 'SGD', name: 'Singapore Dollar', symbol: 'S$'},
        {code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$'},
        {code: 'BRL', name: 'Brazilian Real', symbol: 'R$'},
        {code: 'ZAR', name: 'South African Rand', symbol: 'R'},
        {code: 'RUB', name: 'Russian Ruble', symbol: '₽'},
        {code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$'},
        {code: 'SEK', name: 'Swedish Krona', symbol: 'kr'},
        {code: 'NOK', name: 'Norwegian Krone', symbol: 'kr'},
        {code: 'TRY', name: 'Turkish Lira', symbol: '₺'},
        {code: 'KRW', name: 'South Korean Won', symbol: '₩'}
    ];
    
    // DOM Elements
    const converterForm = document.getElementById('converter-form');
    const amountInput = document.getElementById('amount');
    const fromCurrencySelect = document.getElementById('from-currency');
    const toCurrencySelect = document.getElementById('to-currency');
    const swapButton = document.getElementById('swap-button');
    const resultContainer = document.getElementById('result-container');
    const conversionResult = document.getElementById('conversion-result');
    const conversionRate = document.getElementById('conversion-rate');
    const lastUpdated = document.getElementById('last-updated');
    const errorContainer = document.getElementById('error-container');
    const errorMessage = document.getElementById('error-message');
    const saveFavoriteButton = document.getElementById('save-favorite');
    const baseCurrencyDropdown = document.getElementById('base-currency-dropdown');
    const popularRatesContainer = document.getElementById('popular-rates');
    const themeToggle = document.getElementById('theme-toggle');
    
    // Initialize
    populateCurrencySelects();
    populateBaseCurrencyDropdown();
    loadPopularRates('USD');
    initializeCharts();
    // loadFavorites();
    
    // Set default values
    fromCurrencySelect.value = 'USD';
    toCurrencySelect.value = 'EUR';
    
    // Event Listeners
    converterForm.addEventListener('submit', handleConversion);
    // amountInput.addEventListener('change', handleConversion)
    // toCurrencySelect.addEventListener('change', handleConversion)
    // fromCurrencySelect.addEventListener('change', handleConversion)
    swapButton.addEventListener('click', swapCurrencies);
    saveFavoriteButton.addEventListener('click', saveCurrentAsFavorite);



    // Saved into the favorite coverted card
    function saveCurrentAsFavorite() {
    const amount = document.getElementById('amount').value;
    const fromCurrency = document.getElementById('from-currency').value;
    const toCurrency = document.getElementById('to-currency').value;
    
    // Input validation
    if (!amount || isNaN(amount) || amount <= 0) {
        return;
    }
    
    // Create favorite object
    const favorite = {
        id: Date.now(), // Use timestamp as unique ID
        amount: parseFloat(amount),
        fromCurrency,
        toCurrency,
        dateAdded: new Date().toISOString()
    };
    
    // Get existing favorites from localStorage
    let favorites = JSON.parse(localStorage.getItem('currencyFavorites') || '[]');
    
    // Check if this conversion is already saved
    const isDuplicate = favorites.some(fav => 
        fav.fromCurrency === fromCurrency && 
        fav.toCurrency === toCurrency
    );
    
    if (!isDuplicate) {
        // Add new favorite
        favorites.push(favorite);
        
        // Limit to 10 favorites maximum (remove oldest if needed)
        if (favorites.length > 10) {
            favorites.sort((a, b) => new Date(a.dateAdded) - new Date(b.dateAdded));
            favorites = favorites.slice(-10);
        }
        
        // Save back to localStorage
        localStorage.setItem('currencyFavorites', JSON.stringify(favorites));
        
        // Update favorites display
        // loadFavorites();
        
        // Change button to indicate success
        const saveButton = document.getElementById('save-favorite');
        saveButton.innerHTML = '<i class="fas fa-check"></i> Saved';
        saveButton.classList.remove('btn-outline-primary');
        saveButton.classList.add('btn-success');
        
        // Reset button after 2 seconds
        setTimeout(() => {
            saveButton.innerHTML = '<i class="far fa-star"></i> Save as Favorite';
            saveButton.classList.remove('btn-success');
            saveButton.classList.add('btn-outline-primary');
        }, 2000);
    } else {
        // Visual feedback for duplicate
        const saveButton = document.getElementById('save-favorite');
        saveButton.innerHTML = '<i class="fas fa-info-circle"></i> Already Saved';
        saveButton.classList.remove('btn-outline-primary');
        saveButton.classList.add('btn-warning');
        
        // Reset button after 2 seconds
        setTimeout(() => {
            saveButton.innerHTML = '<i class="far fa-star"></i> Save as Favorite';
            saveButton.classList.remove('btn-warning');
            saveButton.classList.add('btn-outline-primary');
        }, 2000);
    }
}



    // themeToggle.addEventListener('click', toggleTheme);
    
    // Add event listeners for currency changes to update chart automatically
    fromCurrencySelect.addEventListener('change', updateChartFromSelects);
    toCurrencySelect.addEventListener('change', updateChartFromSelects);
    
    // Functions
    function populateCurrencySelects() {
        CURRENCIES.forEach(currency => {
            const fromOption = createCurrencyOption(currency);
            const toOption = createCurrencyOption(currency);
            
            fromCurrencySelect.appendChild(fromOption);
            toCurrencySelect.appendChild(toOption);
        });
    }
    
    function createCurrencyOption(currency) {
        const option = document.createElement('option');
        option.value = currency.code;
        option.textContent = `${currency.code} - ${currency.name}`;
        return option;
    }
    
    function populateBaseCurrencyDropdown() {
        CURRENCIES.forEach(currency => {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.classList.add('dropdown-item');
            a.href = '#';
            a.textContent = `${currency.code} - ${currency.name}`;
            a.addEventListener('click', (e) => {
                e.preventDefault();
                document.getElementById('baseDropdown').textContent = `Base: ${currency.code}`;
                loadPopularRates(currency.code);
            });
            li.appendChild(a);
            baseCurrencyDropdown.appendChild(li);
        });
    }
    
    function handleConversion(e) {
        e.preventDefault();
        
        // Hide previous results/errors
        errorContainer.classList.add('d-none');
        
        const amount = amountInput.value;
        const fromCurrency = fromCurrencySelect.value;
        const toCurrency = toCurrencySelect.value;
        
        // Basic validation
        if (!amount || isNaN(amount) || amount <= 0) {
            showError('Please enter a valid amount greater than zero.');
            return;
        }
        
        // Fetch conversion data
        fetchConversion(amount, fromCurrency, toCurrency);
    }
    
    function fetchConversion(amount, fromCurrency, toCurrency) {
        fetch(`/api/convert?from=${fromCurrency}&to=${toCurrency}&amount=${amount}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                if (data.error) {
                    throw new Error(data.error);
                }
                displayResult(data, amount, fromCurrency, toCurrency);
                // Update chart when conversion is performed
                updateChart(fromCurrency, toCurrency);
            })
            .catch(error => {
                showError(`Conversion failed: ${error.message}`);
            });
    }
    
    function displayResult(data, amount, fromCurrency, toCurrency) {
        const fromCurrencyData = CURRENCIES.find(c => c.code === fromCurrency);
        const toCurrencyData = CURRENCIES.find(c => c.code === toCurrency);
        
        const convertedAmount = data.conversion_result;
        const rate = data.conversion_rate;
        
        conversionResult.textContent = `${amount} ${fromCurrency} = ${toCurrencyData.symbol}${convertedAmount.toFixed(2)} ${toCurrency}`;
        conversionRate.textContent = `1 ${fromCurrency} = ${toCurrencyData.symbol}${rate.toFixed(4)} ${toCurrency}`;
        
        // Set last updated time
        const now = new Date();
        lastUpdated.textContent = `Last updated: ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;
        
        // Show result container
        resultContainer.classList.remove('d-none');
    }
    
    function swapCurrencies() {
        const temp = fromCurrencySelect.value;
        fromCurrencySelect.value = toCurrencySelect.value;
        toCurrencySelect.value = temp;
        
        // Update chart after swapping
        updateChartFromSelects();
    }
    
    // New function to update the chart based on current select values
    function updateChartFromSelects() {
        const fromCurrency = fromCurrencySelect.value;
        const toCurrency = toCurrencySelect.value;
        updateChart(fromCurrency, toCurrency);
    }
    
    function loadPopularRates(baseCurrency) {
        fetch(`/api/rates?base=${baseCurrency}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                if (data.error) {
                    throw new Error(data.error);
                }
                
                // Check if rates property exists
                if (!data.rates) {
                    console.error('API response missing rates property:', data);
                    throw new Error('Invalid API response format');
                }
                
                displayPopularRates(data, baseCurrency);
            })
            .catch(error => {
                console.error('Failed to load popular rates:', error);
                // Add visual feedback
                popularRatesContainer.innerHTML = `
                    <div class="col-12 text-center p-4">
                        <div class="alert alert-warning">
                            <i class="fas fa-exclamation-triangle"></i> 
                            Unable to load currency rates. Please try again later.
                        </div>
                    </div>
                `;
            });
    }
    
    function displayPopularRates(data, baseCurrency) {
        // Clear container
        popularRatesContainer.innerHTML = '';
        
        // Check if rates property exists
        if (!data.rates || typeof data.rates !== 'object') {
            popularRatesContainer.innerHTML = `
                <div class="col-12 text-center p-4">
                    <div class="alert alert-warning">
                        <i class="fas fa-exclamation-triangle"></i> 
                        Invalid rate data received. Please try again later.
                    </div>
                </div>
            `;
            return;
        }
        
        // Create cards for 8 popular currencies
        const popularCurrencyCodes = CURRENCIES.filter(c => c.code !== baseCurrency)
            .slice(0, 8)
            .map(c => c.code);
        
        popularCurrencyCodes.forEach(currencyCode => {
            const rate = data.rates[currencyCode];
            
            // Skip if rate is undefined for this currency
            if (rate === undefined) {
                console.warn(`Rate for ${currencyCode} is not available`);
                return;
            }
            
            const currency = CURRENCIES.find(c => c.code === currencyCode);
            
            const col = document.createElement('div');
            col.classList.add('col-md-3', 'col-sm-6', 'mb-3');
            
            const card = document.createElement('div');
            card.classList.add('card', 'h-100', 'popular-rate-card');

            const cardHeadContainer = document.createElement('div')
            cardHeadContainer.classList.add('cardHead')
            
            const cardBody = document.createElement('div');
            cardBody.classList.add('card-body', 'text-center', 'card-body-container');
            
            const currencyTitle = document.createElement('h5');
            currencyTitle.classList.add('card-title', 'card-title-white');
            currencyTitle.textContent = currency.code;
            
            const currencyName = document.createElement('p');
            currencyName.classList.add('card-text', 'small', 'text-muted');
            currencyName.textContent = currency.name;
            
            const rateDisplay = document.createElement('p');
            rateDisplay.classList.add('card-text-green','card-text', 'display-6', 'mt-2');
            rateDisplay.textContent = `${currency.symbol}${rate.toFixed(2)}`;
            
            const exchangeRate = document.createElement('p');
            exchangeRate.classList.add('card-text', 'small');
            exchangeRate.textContent = `1 ${baseCurrency} = ${currency.symbol}${rate.toFixed(4)}`;
            
            cardBody.appendChild(cardHeadContainer)
            cardHeadContainer.appendChild(currencyTitle);
            cardBody.appendChild(currencyName);
            cardHeadContainer.appendChild(rateDisplay);
            cardBody.appendChild(exchangeRate);
            card.appendChild(cardBody);
            col.appendChild(card);
            
            
            popularRatesContainer.appendChild(col);
        });
    }
    
    function showError(message) {
        errorMessage.textContent = message;
        errorContainer.classList.remove('d-none');
        resultContainer.classList.add('d-none');
    }
    //  Dark mode light mode
    // function toggleTheme() {
    //     const themeStyle = document.getElementById('theme-style');
    //     const isDarkMode = themeStyle.getAttribute('href').includes('dark-mode');
    //     const logo = document.getElementById('logo')
        
        
    //     if (isDarkMode) {
    //         themeStyle.setAttribute('href', '/static/css/light-mode.css');
    //         themeToggle.innerHTML = '<i class="fas fa-moon"></i> ';
    //         logo.setAttribute('src','/static/img/Fine.png')
    //     } else {
    //         themeStyle.setAttribute('href', '/static/css/dark-mode.css');
    //         themeToggle.innerHTML = '<i class="fas fa-sun"></i> ';
    //         logo.setAttribute('src','/static/img/logoNew.png')
    //     }
    // }
    
    // Initial chart update with default values
    updateChart(fromCurrencySelect.value, toCurrencySelect.value);
});