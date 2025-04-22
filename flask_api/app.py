
from flask import Flask, request, jsonify
import pandas as pd
import os

def create_app():
    app = Flask(__name__)
    COMMENTS_LOG = "comments_log_ai.xlsx"

    @app.route("/upload_comments", methods=["POST"])
    def upload_comments():
        data = request.json.get("comments", [])
        if not data:
            return jsonify({"status": "error", "message": "No comments provided"}), 400

        df_new = pd.DataFrame(data)
        
        if os.path.exists(COMMENTS_LOG):
            df_existing = pd.read_excel(COMMENTS_LOG)
            df_combined = pd.concat([df_existing, df_new], ignore_index=True)
        else:
            df_combined = df_new

        df_combined.to_excel(COMMENTS_LOG, index=False)
        return jsonify({"status": "success", "message": f"{len(data)} comments uploaded"})

    return app
