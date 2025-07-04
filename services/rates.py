from flask import jsonify, request
import requests
from datetime import datetime
from config import API_KEY, BASE_URL

def get_rates():
    base_currency = request.args.get('base', 'USD')
    
    try:
        response = requests.get(f"{BASE_URL}/latest/{base_currency}", headers={'apikey': API_KEY})
        response.raise_for_status()
        
        data = response.json()
        
        if 'result' in data and data['result'] == 'success' and 'conversion_rates' in data:
            return jsonify({
                'base': base_currency,
                'rates': data['conversion_rates'],
                'timestamp': datetime.now().timestamp()
            })
        else:
            return jsonify(data)
            
    except requests.exceptions.RequestException as e:
        return jsonify({"error": "Unable to fetch exchange rates", "details": str(e)}), 500
