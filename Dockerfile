FROM python:3.10-alpine
LABEL authors="CoccodrillooXDS"

RUN apk add gcc python3-dev musl-dev linux-headers
RUN mkdir "app"
WORKDIR /app
COPY . /app
RUN pip install -r requirements.txt

ENTRYPOINT ["python", "-u", "main.py"]