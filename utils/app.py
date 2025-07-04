
from flask import Flask, render_template
from flask_cors import CORS
from services.rates import get_rates
from services.convert import convert_currency
from services.history import get_history

import os

app = Flask(__name__)
CORS(app)

@app.route('/Dashboard')
def index():
    return render_template('index.html')

@app.route('/favorite')
def favorite():
    return render_template('favorite.html')

@app.route('/')
def frontpage():
    return render_template('frontpage.html')

@app.route('/api/rates', methods=['GET'])
def rates_route():
    return get_rates()

@app.route('/api/convert', methods=['GET'])
def convert_route():
    return convert_currency()

@app.route('/api/history', methods=['GET'])
def history_route():
    return get_history()

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=int(os.environ.get('PORT', 5000)))
