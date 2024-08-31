from flask import Flask, render_template, redirect, request, jsonify
from livereload import Server
import os
import fetchInquinante
import requests
import mysql.connector

app = Flask(__name__)
app.debug = True
server = Server(app.wsgi_app)
server.watch('**\*.*')

OPENWEATHER_API_KEY = os.environ.get('OPENWEATHER_API_KEY', None)
if OPENWEATHER_API_KEY is None:
    raise Exception('OPENWEATHER_API_KEY not found in environment variables')

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/favicon.ico')
def favicon():
    return redirect('/static/img/favicon.ico')

@app.route('/dashboard')
def dashboard():
    return redirect('/dashboard/meteo')

@app.route('/api/openweather', methods=['POST'])
def openweather():
    body = request.get_json()
    lat = body.get('lat', None)
    lon = body.get('lon', None)
    if lat is None or lon is None:
        return 'Error: lat and lon are required', 400
    openWeatherURL = f'http://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&units=metric&appid={OPENWEATHER_API_KEY}&lang=it'
    openWeatherGeoReverseURL = f'http://api.openweathermap.org/geo/1.0/reverse?lat={lat}&lon={lon}&limit=1&appid={OPENWEATHER_API_KEY}'
    openElevationURL = f'https://api.open-elevation.com/api/v1/lookup?locations={lat},{lon}'
    try:
        response = requests.get(openWeatherURL)
        response.raise_for_status()
        weather = response.json()
        response = requests.get(openWeatherGeoReverseURL)
        response.raise_for_status()
        geo = response.json()
        response = requests.get(openElevationURL)
        response.raise_for_status()
        elevation = response.json()
        weather['elevation'] = elevation['results'][0]['elevation']
        if len(geo) > 0:
            weather['name'] = geo[0]['name']
        return jsonify(weather), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@app.route('/dashboard/meteo')
def meteo():
    return render_template('dashboard_meteo.html')

@app.route('/api/inquinanti', methods=['POST'])
def inquinantiDataBase():
    body = request.get_json()
    nomeInquinante = body.get('inquinante', None)
    valoreIntervallo = body.get('valoreIntervallo', None)
    tempoIntervallo = body.get('tempoIntervallo', None)

    if nomeInquinante is None or valoreIntervallo is None or tempoIntervallo is None:
        return 'Error: lat and lon are required', 400
    try:
        
        response = fetchInquinante.getInquinante(nomeInquinante, valoreIntervallo, tempoIntervallo)

        return jsonify(response), 200
    
    except Exception as e:
        return jsonify({'message': str(e)}), 500




@app.route('/api/valoriAttualiInquinanti', methods=['POST'])
def valoriAttualiInquinanti():
    body = request.get_json()
    nomeInquinante = body.get('nomeInquinante', None)

    if nomeInquinante is None :
        return 'Error: lat and lon are required', 400
    try:
        conn = mysql.connector.connect(
            host="",
            user="",
            password="",
            port=3306,
            database="defaultdb"
        )

        cursor = conn.cursor()

        #se la data differisce troppo da quella locale viene scartata
        query = f"""
                    SELECT JSON_UNQUOTE(JSON_EXTRACT(value, '$.{nomeInquinante}')) AS {nomeInquinante}_value
                    FROM json_values
                    WHERE JSON_EXTRACT(value, '$.{nomeInquinante}') IS NOT NULL
                    AND data >= NOW() - INTERVAL 1 DAY
                    ORDER BY data DESC
                    LIMIT 1;
        """

        cursor.execute(query)

        response = cursor.fetchone()

        cursor.close()
        conn.close()

        return jsonify(response), 200
    
    except Exception as e:
        return jsonify({'message': str(e)}), 500    






@app.route('/dashboard/inquinanti')
def inquinanti():
    return render_template('dashboard_inquinanti.html')

@app.route('/about-school')
def about_school():
    return render_template('about_school.html')

@app.route('/project')
def project():
    return render_template('project.html')

@app.route('/documentation')
def documentation():
    return render_template('documentation.html')

@app.route('/objectives')
def objectives():
    return render_template('objectives.html')

@app.route('/contacts')
def contacts():
    return render_template('contacts.html')

if __name__ == '__main__':
    # app.run(debug=True)
    server.serve(debug=True, host='0.0.0.0', port=5500)
