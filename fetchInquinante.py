import mysql.connector


#tempoIntervallo: MICROSECOND SECOND MINUTE HOUR DAY WEEK MONTH QUARTER YEAR
def getInquinante(nomeInquinante, valoreIntervallo, tempoIntervallo):
    # Connessione al database MySQL
    conn = mysql.connector.connect(
        host="",
        user="",
        password="",
        port=,
        database="defaultdb"
    )

    # Creazione di un cursore
    cursor = conn.cursor()
    

    query = f"""
                SELECT data, JSON_UNQUOTE(JSON_EXTRACT(value, '$.{nomeInquinante}')) AS {nomeInquinante}_value
                FROM defaultdb.json_values 
                WHERE `data` BETWEEN (
                    DATE_SUB((
                        SELECT `data` 
                        FROM defaultdb.json_values 
                        ORDER BY id DESC 
                        LIMIT 1
                    ), INTERVAL {valoreIntervallo} {tempoIntervallo})  -- Replace 2 with the number of hours to subtract 
                ) AND (
                    SELECT `data` 
                    FROM defaultdb.json_values 
                    ORDER BY id DESC 
                    LIMIT 1
                )
                AND JSON_EXTRACT(value, '$.{nomeInquinante}') IS NOT NULL;
            """
    
    # Esecuzione della query
    cursor.execute(query)
    
    # Recupero dei risultati
    results = cursor.fetchall()
    
    # Converti i risultati in una lista di valori di CO2
    valoriInquinanti = [riga for riga in results if riga[1] is not None]
    
    cursor.close()
    conn.close()

    return valoriInquinanti

