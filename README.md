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

- Docker
- Git
- Server MySQL
- API Key di OpenWeather ([puoi ottenerla qui](https://openweathermap.org/api))

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

2. **Costruisci l'immagine Docker:**

    ```sh
    docker build -t ariaconnect_webserver .
    ```

3. **Esegui il container Docker:**

    ```sh
    docker run -p 5500:5500 --name aria_connect --mount type=bind,source=./config.py,target=/app/config.py --restart always ariaconnect_webserver
    ```

    **Nota:** Il container continuerà a crashare fino a quando non verrà configurato correttamente il file `config.py`, come riportato nella fase successiva.

4. **Configura il file `config.py`:**

    Apri il file `config.py` e inserisci i valori corretti per la connessione a un database MySQL e l'API di OpenWeather.

5. **Accedi al server web:**

    Apri il tuo browser e naviga a `http://localhost:5500`.

## Licenza

Questo progetto è concesso in licenza sotto la Licenza MIT. Vedi il file [LICENSE](LICENSE) per i dettagli.