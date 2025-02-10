<p align="center">
  <img src="static/img/Logo_Aria_Connect_Orizzontale.jpg" alt="Aria Connect Logo" width="300"/>
</p>

Questo parte del progetto riguarda il server web per il progetto Aria Connect, che fornisce varie funzionalità relative al monitoraggio della qualità dell'aria e alla visualizzazione dei dati ambientali ricavati dallo zaino intelligente.


## Prerequisiti

- Docker
- Git

## Come eseguire il server web

1. **Costruisci l'immagine Docker:**

    ```sh
    git clone https://github.com/CoccodrillooXDS/ariaconnect_webserver.git
    cd ariaconnect_webserver
    docker build -t ariaconnect_webserver .
    ```

2. **Esegui il container Docker:**

    ```sh
    docker run -p 5000:5000 ariaconnect_webserver
    ```

3. **Accedi al server web:**

    Apri il tuo browser e naviga a `http://localhost:5000`.

## Licenza

Questo progetto è concesso in licenza sotto la Licenza MIT. Vedi il file [LICENSE](LICENSE) per i dettagli.