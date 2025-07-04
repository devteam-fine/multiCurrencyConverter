from flask import jsonify, request
import requests
from datetime import datetime
from config import API_KEY, BASE_URL

def convert_currency():
    from_currency = request.args.get('from', 'USD')
    to_currency = request.args.get('to', 'EUR')
    amount = request.args.get('amount', 1)
    
    try:
        amount = float(amount)
        if amount <= 0:
            return jsonify({"error": "Amount must be positive"}), 400
            
        response = requests.get(
            f"{BASE_URL}/pair/{from_currency}/{to_currency}/{amount}",
            headers={'apikey': API_KEY}
        )
        response.raise_for_status()
        
        data = response.json()
        
        if 'result' in data and data['result'] == 'success':
            return jsonify({
                'base': from_currency,
                'target': to_currency,
                'amount': amount,
                'conversion_rate': data.get('conversion_rate', 0),
                'conversion_result': data.get('conversion_result', 0),
                'timestamp': datetime.now().timestamp()
            })
        else:
            return jsonify(data)
            
    except ValueError:
        return jsonify({"error": "Invalid amount format"}), 400
    except requests.exceptions.RequestException as e:
        return jsonify({"error": "Conversion failed", "details": str(e)}), 500
