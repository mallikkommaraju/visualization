from flask import Flask, render_template, jsonify
from datetime import datetime

app = Flask(__name__)


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/time")
def current_time():
    now = datetime.now()
    return jsonify({
        "hours": now.hour,
        "minutes": now.minute,
        "seconds": now.second,
        "millis": now.microsecond // 1000,
        "iso": now.isoformat(),
    })


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
