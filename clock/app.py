from flask import Flask, render_template, jsonify, Response
from datetime import datetime

app = Flask(__name__)


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/favicon.ico")
def favicon():
    # Minimal 1x1 transparent ICO served inline — no file needed
    # 22-byte ICO: 1 image, 1x1 px, 1-bit color, transparent
    ico = (
        b'\x00\x00'          # reserved
        b'\x01\x00'          # type: ICO
        b'\x01\x00'          # image count: 1
        b'\x01\x01'          # width=1, height=1
        b'\x00'              # color count
        b'\x00'              # reserved
        b'\x01\x00'          # color planes
        b'\x20\x00'          # bits per pixel: 32
        b'\x28\x00\x00\x00'  # size of image data
        b'\x16\x00\x00\x00'  # offset to image data
        # BITMAPINFOHEADER (40 bytes)
        b'\x28\x00\x00\x00'  # header size
        b'\x01\x00\x00\x00'  # width
        b'\x02\x00\x00\x00'  # height (x2 for ICO)
        b'\x01\x00'          # color planes
        b'\x20\x00'          # bits per pixel
        b'\x00\x00\x00\x00'  # compression: none
        b'\x00\x00\x00\x00'  # image size
        b'\x00\x00\x00\x00'  # x pixels per meter
        b'\x00\x00\x00\x00'  # y pixels per meter
        b'\x00\x00\x00\x00'  # colors in table
        b'\x00\x00\x00\x00'  # important colors
        b'\x00\x00\x00\x00'  # pixel: transparent BGRA
        b'\x00\x00\x00\x00'  # AND mask
    )
    return Response(ico, mimetype="image/x-icon")


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
