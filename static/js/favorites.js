document.addEventListener('DOMContentLoaded', function() {
    loadFavorites();
    
    const saveFavoriteButton = document.getElementById('save-favorite');
    if (saveFavoriteButton) {
        saveFavoriteButton.addEventListener('click', saveCurrentAsFavorite);
    }
    
    // Fixed conversion button event listener
    const convertButton = document.getElementById('convert');
    if (convertButton) {
        convertButton.addEventListener('click', function(e) {
            e.preventDefault();
            const amount = document.getElementById('amount').value;
            const fromCurrency = document.getElementById('from-currency').value;
            const toCurrency = document.getElementById('to-currency').value;
            
            // Validate amount before conversion
            if (!amount || isNaN(amount) || amount <= 0) {
                alert("Please enter a valid amount");
                return;
            }
            
            fetchConversion(amount, fromCurrency, toCurrency);
        });
    }
    
    // Close popup functionality
    const closePopup = document.getElementById("closePopup");
    if (closePopup) {
        closePopup.addEventListener('click', () => {
            document.getElementById("popBox").classList.add("hidden");
            document.getElementById("popBox").classList.remove("flex");
        });
    }
});

function saveCurrentAsFavorite() {
    const amount = document.getElementById('amount').value;
    const fromCurrency = document.getElementById('from-currency').value;
    const toCurrency = document.getElementById('to-currency').value;
    
    if (!amount || isNaN(amount) || amount <= 0) {
        alert("Please enter a valid amount before saving");
        return;
    }
    
    const favorite = {
        id: Date.now(),
        amount: parseFloat(amount),
        fromCurrency,
        toCurrency,
        dateAdded: new Date().toISOString()
    };
    
    let favorites = JSON.parse(localStorage.getItem('currencyFavorites') || '[]');
    const isDuplicate = favorites.some(fav => 
        fav.fromCurrency === fromCurrency && 
        fav.toCurrency === toCurrency
    );
    
    if (!isDuplicate) {
        favorites.push(favorite);
        
        if (favorites.length > 10) {
            favorites.sort((a, b) => new Date(a.dateAdded) - new Date(b.dateAdded));
            favorites = favorites.slice(-10);
        }
        
        localStorage.setItem('currencyFavorites', JSON.stringify(favorites));
        loadFavorites();
        
        const saveButton = document.getElementById('save-favorite');
        saveButton.innerHTML = '<i class="fas fa-check"></i> Saved';
        saveButton.classList.replace('btn-outline-primary', 'btn-success');
        
        setTimeout(() => {
            saveButton.innerHTML = '<i class="far fa-star"></i> Save as Favorite';
            saveButton.classList.replace('btn-success', 'btn-outline-primary');
        }, 2000);
    } else {
        const saveButton = document.getElementById('save-favorite');
        saveButton.innerHTML = '<i class="fas fa-info-circle"></i> Already Saved';
        saveButton.classList.replace('btn-outline-primary', 'btn-warning');
        
        setTimeout(() => {
            saveButton.innerHTML = '<i class="far fa-star"></i> Save as Favorite';
            saveButton.classList.replace('btn-warning', 'btn-outline-primary');
        }, 2000);
    }
}

function loadFavorites() {
    const favorites = JSON.parse(localStorage.getItem('currencyFavorites') || '[]');
    const favoritesContainer = document.getElementById('favorites-list');
    const noFavoritesMessage = document.getElementById('no-favorites');
    
    if (!favoritesContainer) return;
    
    favoritesContainer.innerHTML = '';
    
    if (favorites.length === 0) {
        if (noFavoritesMessage) noFavoritesMessage.classList.remove('d-none');
        return;
    }
    
    if (noFavoritesMessage) noFavoritesMessage.classList.add('d-none');
    
    favorites.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
    
    favorites.forEach(favorite => {
        const { id, amount, fromCurrency, toCurrency } = favorite;
        
        const col = document.createElement('div');
        col.className = 'col-md-4 mb-3';
        col.dataset.favoriteId = id;
        
        const card = document.createElement('div');
        card.className = 'card h-100 favorite-card';
        
        const cardBody = document.createElement('div');
        cardBody.className = 'card-body';
        
        const pairTitle = document.createElement('h5');
        pairTitle.className = 'card-title d-flex align-items-center justify-content-between';
        pairTitle.innerHTML = `
            <span>${fromCurrency} → ${toCurrency}</span>
            <i class="fas fa-star text-warning"></i>
        `;
        
        const amountText = document.createElement('p');
        amountText.className = 'card-text';
        amountText.textContent = `Amount: ${amount.toFixed(2)}`;
        
        const liveResult = document.createElement('p');
        liveResult.className = 'card-text live-result';
        liveResult.innerHTML = '<small class="text-muted">Click "Convert Now" for live rate</small>';
        
        const buttonGroup = document.createElement('div');
        buttonGroup.className = 'mt-3 d-flex justify-content-between';
        
        const updateButton = document.createElement('button');
        updateButton.className = 'btn btn-sm btn-primary';
        updateButton.textContent = 'Convert Now';
        updateButton.addEventListener('click', () => {
            document.getElementById('amount').value = amount;
            document.getElementById('from-currency').value = fromCurrency;
            document.getElementById('to-currency').value = toCurrency;
            
            const popBox = document.getElementById("popBox");
            if (popBox) {
                popBox.classList.remove("hidden");
                popBox.classList.add("flex");
            }
            
            window.scrollTo({ top: 0, behavior: 'smooth' });
            
            updateButton.textContent = 'Converting...';
            setTimeout(() => updateButton.textContent = 'Convert Now', 1000);
        });
        
        const deleteButton = document.createElement('button');
        deleteButton.className = 'btn btn-sm btn-outline-danger';
        deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
        deleteButton.title = 'Remove from favorites';
        deleteButton.addEventListener('click', () => {
            if (confirm('Remove this favorite?')) removeFavorite(id);
        });
        
        buttonGroup.append(updateButton, deleteButton);
        cardBody.append(pairTitle, amountText, liveResult, buttonGroup);
        card.append(cardBody);
        col.append(card);
        favoritesContainer.append(col);
        
        fetchFavoriteRate(fromCurrency, toCurrency, liveResult);
        // swapCurrencies();
    });
}

function fetchFavoriteRate(fromCurrency, toCurrency, resultElement) {
    if (!resultElement) return;
    
    resultElement.innerHTML = '<small class="text-muted">Loading latest rate...</small>';
    
    fetch(`/api/convert?from=${fromCurrency}&to=${toCurrency}&amount=1`)
        .then(response => response.ok ? response.json() : Promise.reject('Network error'))
        .then(data => {
            if (data.error) throw new Error(data.error);
            
            const rate = data.conversion_rate;
            const dateUpdated = new Date().toLocaleDateString();
            
            resultElement.innerHTML = `
                <strong class="d-block">Rate: ${rate.toFixed(4)}</strong>
                <small class="text-muted">Updated: ${dateUpdated}</small>
            `;
        })
        .catch(error => {
            resultElement.innerHTML = '<small class="text-danger">Could not load latest rate</small>';
            console.error('Failed to fetch rate:', error);
        });
}

function removeFavorite(id) {
    let favorites = JSON.parse(localStorage.getItem('currencyFavorites') || '[]');
    favorites = favorites.filter(fav => fav.id !== id);
    localStorage.setItem('currencyFavorites', JSON.stringify(favorites));
    
    const favoriteElement = document.querySelector(`[data-favorite-id="${id}"]`);
    if (favoriteElement) {
        favoriteElement.style.transition = 'all 0.3s ease';
        favoriteElement.style.opacity = '0';
        favoriteElement.style.transform = 'scale(0.8)';
        
        setTimeout(() => {
            favoriteElement.remove();
            if (favorites.length === 0) {
                const noFavoritesMessage = document.getElementById('no-favorites');
                if (noFavoritesMessage) noFavoritesMessage.classList.remove('d-none');
            }
        }, 300);
    } else {
        loadFavorites();
    }
}

function fetchConversion(amount, fromCurrency, toCurrency) {
    fetch(`/api/convert?from=${fromCurrency}&to=${toCurrency}&amount=${amount}`)
        .then(response => response.ok ? response.json() : Promise.reject('Network error'))
        .then(data => {
            if (data.error) throw new Error(data.error);
            displayResult(data, amount, fromCurrency, toCurrency);
        })
        .catch(error => {
            console.error('Conversion failed:', error);
            const errorElement = document.getElementById('error-message');
            if (errorElement) {
                errorElement.textContent = `Error: ${error.message || 'Conversion failed'}`;
                errorElement.classList.remove('d-none');
            }
        });
}
    function swapCurrencies() {
        const temp = fromCurrencySelect.value;
        fromCurrencySelect.value = toCurrencySelect.value;
        toCurrencySelect.value = temp;
        
        // Update chart after swapping
        updateChartFromSelects();
    }
function displayResult(data, amount, fromCurrency, toCurrency) {
    const conversionResult = document.getElementById('conversion-result');
    const conversionRate = document.getElementById('conversion-rate');
    const lastUpdated = document.getElementById('last-updated');
    const resultContainer = document.getElementById('result-container');
    
    if (!conversionResult || !conversionRate || !lastUpdated || !resultContainer) return;
    
    const convertedAmount = data.conversion_result;
    const rate = data.conversion_rate;
    
    conversionResult.textContent = `${amount} ${fromCurrency} = ${convertedAmount.toFixed(2)} ${toCurrency}`;
    conversionRate.textContent = `1 ${fromCurrency} = ${rate.toFixed(4)} ${toCurrency}`;
    
    const now = new Date();
    lastUpdated.textContent = `Last updated: ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;
    
    resultContainer.classList.remove('d-none');
}