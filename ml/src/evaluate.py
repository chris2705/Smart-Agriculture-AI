# ml/src/evaluate.py
"""
Evaluation script for trained ML models.

Outputs:
 - ml/explanations/evaluation_metrics.json
 - ml/explanations/confusion_matrix_crop.png
 - ml/explanations/confusion_matrix_fert.png
 - ml/explanations/classification_report_crop.txt
 - ml/explanations/classification_report_fert.txt
 - ml/explanations/sample_predictions.csv

Requires:
 - ml/models/train_test.joblib
 - ml/models/crop_recommendation.joblib
 - ml/models/fertilizer_model.joblib
 - ml/models/label_encoder_crop.joblib
 - ml/models/label_encoder_fert.joblib
"""

import os
import joblib
import json
import numpy as np
import pandas as pd
from sklearn.metrics import classification_report, accuracy_score, confusion_matrix
import matplotlib.pyplot as plt
import itertools

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
MODEL_DIR = os.path.join(ROOT, "models")
EXPL_DIR = os.path.join(ROOT, "explanations")
os.makedirs(EXPL_DIR, exist_ok=True)

def load_artifacts():
    tt_path = os.path.join(MODEL_DIR, "train_test.joblib")
    crop_model_path = os.path.join(MODEL_DIR, "crop_recommendation.joblib")
    fert_model_path = os.path.join(MODEL_DIR, "fertilizer_model.joblib")
    crop_le_path = os.path.join(MODEL_DIR, "label_encoder_crop.joblib")
    fert_le_path = os.path.join(MODEL_DIR, "label_encoder_fert.joblib")

    for p in [tt_path, crop_model_path, fert_model_path, crop_le_path, fert_le_path]:
        if not os.path.exists(p):
            raise FileNotFoundError(f"Required artifact missing: {p}")

    X_train_s, X_test_s, y_crop_train, y_crop_test, y_fert_train, y_fert_test = joblib.load(tt_path)
    crop_model = joblib.load(crop_model_path)
    fert_model = joblib.load(fert_model_path)
    crop_le = joblib.load(crop_le_path)
    fert_le = joblib.load(fert_le_path)

    return (X_train_s, X_test_s, y_crop_train, y_crop_test, y_fert_train, y_fert_test,
            crop_model, fert_model, crop_le, fert_le)

def save_classification_report_text(report_str, out_path):
    with open(out_path, "w") as f:
        f.write(report_str)

def plot_and_save_confusion_matrix(cm, classes, out_path, normalize=False, title="Confusion matrix"):
    if normalize:
        cm_norm = cm.astype('float') / cm.sum(axis=1)[:, np.newaxis]
        disp = cm_norm
    else:
        disp = cm

    plt.figure(figsize=(6,5))
    plt.imshow(disp, interpolation='nearest')
    plt.title(title)
    plt.xlabel('Predicted label')
    plt.ylabel('True label')
    tick_marks = np.arange(len(classes))
    plt.xticks(tick_marks, classes, rotation=45)
    plt.yticks(tick_marks, classes)

    fmt = '.2f' if normalize else 'd'
    thresh = disp.max() / 2.0 if disp.max() != 0 else 0.5
    for i, j in itertools.product(range(disp.shape[0]), range(disp.shape[1])):
        val = disp[i, j]
        if normalize:
            s = format(val, fmt)
        else:
            s = str(int(val))
        plt.text(j, i, s, horizontalalignment="center",
                 verticalalignment="center",
                 fontsize=10)

    plt.tight_layout()
    plt.savefig(out_path, dpi=200)
    plt.close()
    print(f"[eval] Saved confusion matrix to {out_path}")

def decode(y_enc, le):
    return le.inverse_transform(y_enc)

def main():
    (X_train_s, X_test_s, y_crop_train, y_crop_test, y_fert_train, y_fert_test,
     crop_model, fert_model, crop_le, fert_le) = load_artifacts()

    results = {}

    # Crop model evaluation
    y_crop_pred = crop_model.predict(X_test_s)
    crop_acc = accuracy_score(y_crop_test, y_crop_pred)
    crop_cr = classification_report(y_crop_test, y_crop_pred, target_names=crop_le.classes_.tolist())
    crop_cm = confusion_matrix(y_crop_test, y_crop_pred)

    # Save crop reports
    results['crop'] = {
        "accuracy": float(crop_acc),
        "classes": crop_le.classes_.tolist()
    }
    save_classification_report_text(crop_cr, os.path.join(EXPL_DIR, "classification_report_crop.txt"))
    plot_and_save_confusion_matrix(crop_cm, crop_le.classes_.tolist(), os.path.join(EXPL_DIR, "confusion_matrix_crop.png"))
    plot_and_save_confusion_matrix(crop_cm, crop_le.classes_.tolist(), os.path.join(EXPL_DIR, "confusion_matrix_crop_norm.png"), normalize=True)

    # Fertilizer model evaluation
    y_fert_pred = fert_model.predict(X_test_s)
    fert_acc = accuracy_score(y_fert_test, y_fert_pred)
    fert_cr = classification_report(y_fert_test, y_fert_pred, target_names=fert_le.classes_.tolist())
    fert_cm = confusion_matrix(y_fert_test, y_fert_pred)

    results['fertilizer'] = {
        "accuracy": float(fert_acc),
        "classes": fert_le.classes_.tolist()
    }
    save_classification_report_text(fert_cr, os.path.join(EXPL_DIR, "classification_report_fert.txt"))
    plot_and_save_confusion_matrix(fert_cm, fert_le.classes_.tolist(), os.path.join(EXPL_DIR, "confusion_matrix_fert.png"))
    plot_and_save_confusion_matrix(fert_cm, fert_le.classes_.tolist(), os.path.join(EXPL_DIR, "confusion_matrix_fert_norm.png"), normalize=True)

    # Save overall metrics JSON
    eval_json_path = os.path.join(EXPL_DIR, "evaluation_metrics.json")
    with open(eval_json_path, "w") as f:
        json.dump(results, f, indent=2)
    print(f"[eval] Saved evaluation metrics JSON to {eval_json_path}")

    # Save sample predictions (first 20 rows)
    try:
        decoded_true_crop = decode(y_crop_test.values if hasattr(y_crop_test, "values") else y_crop_test, crop_le)
        decoded_pred_crop = decode(y_crop_pred, crop_le)
        decoded_true_fert = decode(y_fert_test.values if hasattr(y_fert_test, "values") else y_fert_test, fert_le)
        decoded_pred_fert = decode(y_fert_pred, fert_le)
    except Exception:
        # fallback if inputs are numpy arrays already
        decoded_true_crop = crop_le.inverse_transform(y_crop_test)
        decoded_pred_crop = crop_le.inverse_transform(y_crop_pred)
        decoded_true_fert = fert_le.inverse_transform(y_fert_test)
        decoded_pred_fert = fert_le.inverse_transform(y_fert_pred)

    sample_n = min(20, X_test_s.shape[0])
    rows = []
    for i in range(sample_n):
        row = {
            "index": int(i),
            "true_crop": str(decoded_true_crop[i]),
            "pred_crop": str(decoded_pred_crop[i]),
            "true_fertilizer": str(decoded_true_fert[i]),
            "pred_fertilizer": str(decoded_pred_fert[i])
        }
        rows.append(row)

    sample_df = pd.DataFrame(rows)
    sample_csv_path = os.path.join(EXPL_DIR, "sample_predictions.csv")
    sample_df.to_csv(sample_csv_path, index=False)
    print(f"[eval] Saved sample predictions to {sample_csv_path}")

    print("[eval] Evaluation complete. Artifacts saved under ml/explanations/")

if __name__ == "__main__":
    main()
