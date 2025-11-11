<p align="center">
  <img src="static/img/Logo_Aria_Connect_Orizzontale.jpg" alt="Aria Connect Logo" width="300"/>
</p>

Questo parte del progetto riguarda il server web per il progetto Aria Connect, che fornisce varie funzionalità relative al monitoraggio della qualità dell'aria e alla visualizzazione dei dati ambientali ricavati dallo zaino intelligente.

**Vedi il video di presentazione del progetto Aria Connect su YouTube:**
<p align="center">
  <a href="https://www.youtube.com/watch?v=zFZwBUbjzxQ" target="_blank">
    <img src="https://img.youtube.com/vi/zFZwBUbjzxQ/0.jpg" alt="Aria Connect YouTube Video" width="300"/>
  </a>
</p>

## Prerequisiti

- Git
- Server MySQL
- API Key di OpenWeather ([puoi ottenerla qui](https://openweathermap.org/api))
- Docker (opzionale)

## Come eseguire il server web

1. **Clona il repository e crea il file `config.py`:**

    ```sh
    git clone https://github.com/CoccodrillooXDS/ariaconnect_webserver.git
    cd ariaconnect_webserver
    ```

    <details>
    <summary>Comandi CLI per creare il file `<b>config.py</b>`</summary>

    **Linux:**
    ```sh
    touch config.py
    ```

    **Windows:**
    ```sh
    echo "" > config.py
    ```

    </details>
    <br>

2. **Configurazione del server MySQL (IMPORTANTE):**
    Assicurati di avere un server MySQL attivo.

    Esegui lo script SQL `database_setup.sql` per creare il database chiamato `defaultdb` e la tabella `json_values` necessaria per il funzionamento del server web:

    ```sh
    mysql -u [utente dedicato o root] -p < database_setup.sql
    ```

    <br>

3. **Configura il file `config.py` (IMPORTANTE):**

    Apri il file `config.py` e inserisci i valori corretti per la connessione a un database MySQL e l'API di OpenWeather.

    Di seguito è riportato un esempio di configurazione per il file `config.py`:

    ```python
    database = {
        "host": "localhost",
        "user": "user",
        "password": "password",
        "port": 3306,
        "database": "defaultdb"
    }
    
    openweatherapi = "api_key"
    ```

    Assicurati di sostituire le variabili con i valori appropriati per il tuo ambiente.

    <br>

4. **Esegui il server web:**
    Puoi eseguire il server web direttamente dal terminale o utilizzando Docker.

    <details>
    <summary>Configurazione <b>senza Docker</b></summary>

    Assicurati di avere Python 3 e i moduli `venv` e `pip` installati.
    Esegui i seguenti comandi in un terminale per eseguire il server web:

    ```sh
    python3 -m venv venv  # In alcune distribuzioni potrebbe essere 'python' invece di 'python3'
    source venv/bin/activate  # Su Windows usa `venv\Scripts\activate`
    pip install -r requirements.txt
    python3 main.py
    ```

    </details>

    <details>
    <summary>Configurazione <b>con Docker</b></summary>

    * **Costruisci l'immagine Docker:**
    
        ```sh
        docker build -t ariaconnect_webserver .
        ```
    
    * **Esegui il container Docker:**
    
        ```sh
        docker run -p 5500:5500 --name aria_connect --mount type=bind,source=./config.py,target=/app/config.py --restart always ariaconnect_webserver
        ```

        **Nota:** Il container continuerà a riavviarsi fino a quando non verrà configurato correttamente il file `config.py`, come descritto nella fase 3.

    </details>
    <br>

5. **Accedi al server web:**

    Apri il browser e naviga alla pagina `http://localhost:5500`.

## Licenza

Questo progetto è concesso in licenza sotto la Licenza MIT. Vedi il file [LICENSE](LICENSE) per i dettagli.