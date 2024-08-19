from flask import Flask, render_template, redirect
from livereload import Server

app = Flask(__name__)
app.debug = True
server = Server(app.wsgi_app)
server.watch('**\*.*')

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/dashboard')
def dashboard():
    return redirect('/dashboard/meteo')

@app.route('/dashboard/meteo')
def meteo():
    return render_template('dashboard_meteo.html')

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
    server.serve()
