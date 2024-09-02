from flask import Flask, render_template, redirect, request, jsonify
import requests
import mysql.connector

try:
    import config
except ImportError:
    with open('config.py', 'w') as f:
        f.write('database = {\n')
        f.write('    "host": "",\n')
        f.write('    "user": "",\n')
        f.write('    "password": "",\n')
        f.write('    "port": 3306,\n')
        f.write('    "database": ""\n')
        f.write('}\n')
        f.write('openweatherapi = ""\n')
        f.close()
    print("Please fill the config.py file with the correct values")
    exit(1)

app = Flask(__name__)

# Database connection
def database_connection():
    conn = mysql.connector.connect(
        host=config.database['host'],
        user=config.database['user'],
        password=config.database['password'],
        port=config.database['port'],
        database=config.database['database']
    )
    return conn

#tempoIntervallo: MICROSECOND SECOND MINUTE HOUR DAY WEEK MONTH QUARTER YEAR
def getInquinanti(valoreIntervallo, tempoIntervallo):
    # Connessione al database MySQL
    conn = database_connection()
    cursor = conn.cursor(dictionary=True)  # Use dictionary=True for dict output

    query = f"""
                SELECT data, 
                    JSON_UNQUOTE(JSON_EXTRACT(value, '$.CO')) AS CO_value, 
                    JSON_UNQUOTE(JSON_EXTRACT(value, '$.CO2')) AS CO2_value, 
                    JSON_UNQUOTE(JSON_EXTRACT(value, '$.PM10')) AS PM10_value, 
                    JSON_UNQUOTE(JSON_EXTRACT(value, '$.NH3')) AS NH3_value, 
                    JSON_UNQUOTE(JSON_EXTRACT(value, '$.NO2')) AS NO2_value, 
                    JSON_UNQUOTE(JSON_EXTRACT(value, '$.TVOC')) AS TVOC_value, 
                    JSON_UNQUOTE(JSON_EXTRACT(value, '$.humidity')) AS humidity_value, 
                    JSON_UNQUOTE(JSON_EXTRACT(value, '$.temperature')) AS temperature_value, 
                    JSON_UNQUOTE(JSON_EXTRACT(value, '$.pressure')) AS pressure_value
                FROM defaultdb.json_values 
                WHERE `data` BETWEEN (
                    DATE_SUB((
                        SELECT `data` 
                        FROM defaultdb.json_values 
                        ORDER BY id DESC 
                        LIMIT 1
                    ), INTERVAL {valoreIntervallo} {tempoIntervallo})  
                ) AND (
                    SELECT `data` 
                    FROM defaultdb.json_values 
                    ORDER BY id DESC 
                    LIMIT 1
                )
                AND (
                    JSON_EXTRACT(value, '$.CO') IS NOT NULL 
                    OR JSON_EXTRACT(value, '$.CO2') IS NOT NULL 
                    OR JSON_EXTRACT(value, '$.PM10') IS NOT NULL 
                    OR JSON_EXTRACT(value, '$.NH3') IS NOT NULL 
                    OR JSON_EXTRACT(value, '$.NO2') IS NOT NULL 
                    OR JSON_EXTRACT(value, '$.TVOC') IS NOT NULL 
                    OR JSON_EXTRACT(value, '$.humidity') IS NOT NULL 
                    OR JSON_EXTRACT(value, '$.temperature') IS NOT NULL 
                    OR JSON_EXTRACT(value, '$.pressure') IS NOT NULL
                );
            """
            
    try:
        # Esecuzione della query
        cursor.execute(query)
        
        # Recupero dei risultati
        results = cursor.fetchall()
        
        # Lista per salvare i valori degli inquinanti
        valori_inquinanti = []

        for row in results:
            # Convert null values to None for consistency
            valori_inquinanti.append({
                "data": row["data"].strftime("%a, %d %b %Y %H:%M:%S GMT"),  # RFC 1123 format date string
                "CO": row["CO_value"] if row["CO_value"] is not None else None,
                "CO2": row["CO2_value"] if row["CO2_value"] is not None else None,
                "PM10": row["PM10_value"] if row["PM10_value"] is not None else None,
                "NH3": row["NH3_value"] if row["NH3_value"] is not None else None,
                "NO2": row["NO2_value"] if row["NO2_value"] is not None else None,
                "TVOC": row["TVOC_value"] if row["TVOC_value"] is not None else None,
                "humidity": row["humidity_value"] if row["humidity_value"] is not None else None,
                "temperature": row["temperature_value"] if row["temperature_value"] is not None else None,
                "pressure": row["pressure_value"] if row["pressure_value"] is not None else None
            })
    
    except mysql.connector.Error as err:
        print(f"Errore: {err}")
        valori_inquinanti = []
    
    finally:
        # Chiusura del cursore e della connessione
        cursor.close()
        conn.close()

    return valori_inquinanti

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
        return jsonify({'message': 'Error: lat and lon are required'}), 400
    openWeatherURL = f'http://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&units=metric&appid={config.openweatherapi}&lang=it'
    openWeatherGeoReverseURL = f'http://api.openweathermap.org/geo/1.0/reverse?lat={lat}&lon={lon}&limit=1&appid={config.openweatherapi}'
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

@app.route('/api/GPS', methods=['POST'])
def GPS():
    body = request.get_json()
    parametro = body.get("parametro", None)

    if parametro is None :
        return jsonify({'message': 'Error: parametro is required'}), 400
    try:
        conn = database_connection()

        cursor = conn.cursor()
        response = {}

        if(parametro == 1):
            query = f"""
                    SELECT JSON_UNQUOTE(JSON_EXTRACT(value, '$.air_quality')) AS air_quality_value
                    FROM json_values
                    WHERE JSON_EXTRACT(value, '$.air_quality') IS NOT NULL
                    AND data >= NOW() - INTERVAL 30 SECOND
                    ORDER BY data DESC
                    LIMIT 1;
                    """
            cursor.execute(query)
            response["air_quality"] = cursor.fetchone()

            query = f"""
                        SELECT JSON_UNQUOTE(JSON_EXTRACT(value, '$.air_quality_level')) AS air_quality_level_value
                        FROM json_values
                        WHERE JSON_EXTRACT(value, '$.air_quality_level') IS NOT NULL
                        AND data >= NOW() - INTERVAL 30 SECOND
                        ORDER BY data DESC
                        LIMIT 1;
                        """
            cursor.execute(query)
            response["air_quality_level"] = cursor.fetchone()
        

        query = f"""
                    SELECT JSON_UNQUOTE(JSON_EXTRACT(value, '$.long')) AS long_value
                    FROM json_values
                    WHERE JSON_EXTRACT(value, '$.long') IS NOT NULL
                    AND data >= NOW() - INTERVAL 30 SECOND
                    ORDER BY data DESC
                    LIMIT 1;
        """

        cursor.execute(query)

        response["longitudine"] = cursor.fetchone()

        query = f"""
                    SELECT JSON_UNQUOTE(JSON_EXTRACT(value, '$.lat')) AS lat_value
                    FROM json_values
                    WHERE JSON_EXTRACT(value, '$.lat') IS NOT NULL
                    AND data >= NOW() - INTERVAL 30 SECOND
                    ORDER BY data DESC
                    LIMIT 1;
        """

        cursor.execute(query)

        response["latitudine"] = cursor.fetchone()
        
        cursor.close()
        conn.close()

        return jsonify(response), 200
    
    except Exception as e:
        return jsonify({'message': str(e)}), 500    


@app.route('/api/inquinanti', methods=['POST'])
def inquinantiDataBase():
    body = request.get_json()
    valoreIntervallo = body.get('valoreIntervallo', None)
    tempoIntervallo = body.get('tempoIntervallo', None)

    if valoreIntervallo is None or tempoIntervallo is None:
        return jsonify({'message': 'Error: valoreIntervallo and tempoIntervallo are required'}), 400
    try:
        
        response = getInquinanti(valoreIntervallo, tempoIntervallo)

        return jsonify(response), 200
    
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@app.route('/api/valoriAttualiInquinanti', methods=['POST'])
def valoriAttualiInquinanti():
    try:
        conn = database_connection()
        cursor = conn.cursor()
        
        # Definire l'elenco degli inquinanti
        nomi_valori = ["CO", "CO2", "PM10", "NH3", "NO2", "TVOC", "humidity", "temperature", "pressure"]
        
        # Costruire la query per ottenere i valori più recenti di tutti gli inquinanti
        select_clause = ", ".join([f"JSON_UNQUOTE(JSON_EXTRACT(value, '$.{inquinante}')) AS {inquinante}_value" for inquinante in nomi_valori])

        query = f"""
            SELECT {select_clause}
            FROM json_values
            WHERE data >= NOW() - INTERVAL 10 SECOND
            ORDER BY data DESC
            LIMIT 1;
        """

        # Eseguire la query
        cursor.execute(query)
        response = cursor.fetchone()

        # Chiusura del cursore e della connessione
        cursor.close()
        conn.close()

        # Creare una mappa con i risultati (mappa inquinante -> valore)
        if response:
            result = {inquinante: response[idx] for idx, inquinante in enumerate(nomi_valori)}
            return jsonify(result), 200
        else:
            return jsonify({'message': 'No data found'}), 404
    
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
    app.run(debug=True, host='0.0.0.0', port=5500)
