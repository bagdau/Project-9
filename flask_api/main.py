
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from storage import save_comment_ai, load_comments_ai
from app import create_app
import os

app = Flask(__name__)
CORS(app)

@app.route("/", methods=["GET"])
def index():
    return send_file(os.path.join(os.path.dirname(__file__), "index.html"))

@app.route("/webhook", methods=["POST"])
def webhook():
    data = request.get_json()
    comment = data.get("comment")
    author = data.get("author")
    post_id = data.get("post_id")
    likes = data.get("likes", 0)
    parent_id = data.get("parent_id", "")

    if not comment:
        return jsonify({"status": "ignored", "reason": "no comment"}), 400

    saved = save_comment_ai(comment, author, post_id, likes, parent_id)
    return jsonify({"status": "saved", "comment": saved})

@app.route("/upload_comments", methods=["POST"])
def upload_comments():
    data = request.json.get("comments", [])
    if not data:
        return jsonify({"status": "error", "message": "No comments provided"}), 400

    saved_count = 0
    for entry in data:
        comment = entry.get("comment")
        author = entry.get("author")
        post_id = entry.get("post_id")
        likes = entry.get("likes", 0)
        parent_id = entry.get("parent_id", "")

        if comment:
            save_comment_ai(comment, author, post_id, likes, parent_id)
            saved_count += 1

    return jsonify({"status": "success", "message": f"{saved_count} comments uploaded"})

@app.route("/comments", methods=["GET"])
def get_comments():
    return jsonify(load_comments_ai())

@app.route("/ping", methods=["GET"])
def ping():
    return jsonify({"status": "ok"})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8010, use_reloader=False, debug=True)
