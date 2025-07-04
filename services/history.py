from flask import jsonify, request
import requests
from datetime import datetime, timedelta
from config import API_KEY, BASE_URL
from concurrent.futures import ThreadPoolExecutor, as_completed

def fetch_rate_for_date(date, base_currency, target_currency):
    try:
        response = requests.get(
            f"{BASE_URL}/{date}/{base_currency}",
            headers={'apikey': API_KEY}
        )
        response.raise_for_status()
        data = response.json()
        
        if 'result' in data and data['result'] == 'success':
            if 'conversion_rates' in data and target_currency in data['conversion_rates']:
                return {'date': date, 'rate': data['conversion_rates'][target_currency]}
            elif 'rates' in data and target_currency in data['rates']:
                return {'date': date, 'rate': data['rates'][target_currency]}
        return None
    except requests.exceptions.RequestException:
        return None

def get_history():
    base_currency = request.args.get('base', 'USD')
    target_currency = request.args.get('target', 'EUR')
    days = int(request.args.get('days', 7))
    
    if days > 30:
        days = 30
    
    dates = [(datetime.now() - timedelta(days=i)).strftime('%Y-%m-%d') for i in range(days)]
    historical_data = []
    
    with ThreadPoolExecutor(max_workers=5) as executor:
        futures = {executor.submit(fetch_rate_for_date, date, base_currency, target_currency): date for date in dates}
        for future in as_completed(futures):
            result = future.result()
            if result:
                historical_data.append(result)
    
    if not historical_data:
        return jsonify({"error": "No historical data available for the specified currencies"}), 404
    
    # Sort data by date ascending
    historical_data.sort(key=lambda x: x['date'])
    
    return jsonify(historical_data)
