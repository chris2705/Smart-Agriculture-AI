# ml/src/shap_lime.py
import os
import joblib
import numpy as np
import matplotlib.pyplot as plt
import json
from model_utils import load_train_test, load_scaler
import shap
from lime.lime_tabular import LimeTabularExplainer

ROOT = os.path.join(os.path.dirname(__file__), "..")
MODEL_DIR = os.path.join(ROOT, "models")
EXPL_DIR = os.path.join(ROOT, "explanations")
os.makedirs(EXPL_DIR, exist_ok=True)

def shap_summary(crop_model, X_sample, feature_names):
    # Use TreeExplainer for tree models
    try:
        explainer = shap.TreeExplainer(crop_model)
    except Exception:
        explainer = shap.Explainer(crop_model)
    shap_vals = explainer.shap_values(X_sample) if hasattr(explainer, "shap_values") else explainer(X_sample)
    # Save summary plot
    plt.figure()
    # shap.summary_plot accepts shap values in a few formats; use try/except for safety
    try:
        shap.summary_plot(shap_vals, X_sample, feature_names=feature_names, show=False)
    except Exception:
        shap.summary_plot(shap_vals, X_sample, show=False)
    out_png = os.path.join(EXPL_DIR, "shap_summary.png")
    plt.tight_layout()
    plt.savefig(out_png, dpi=200)
    joblib.dump(explainer, os.path.join(EXPL_DIR, "shap_explainer.joblib"))
    print("Saved SHAP summary to", out_png)

def lime_examples(crop_model, X_train, X_test, feature_names, num_examples=5):
    class_names = [str(c) for c in np.unique(joblib.load(os.path.join(MODEL_DIR, "train_test.joblib"))[2])]
    explainer = LimeTabularExplainer(training_data=X_train, feature_names=feature_names, class_names=class_names, mode='classification')
    examples = []
    for i in range(min(num_examples, X_test.shape[0])):
        exp = explainer.explain_instance(X_test[i], crop_model.predict_proba, num_features=5)
        examples.append({
            "index": int(i),
            "explanation": exp.as_list()
        })
    with open(os.path.join(EXPL_DIR, "lime_examples.json"), "w") as f:
        json.dump(examples, f, indent=2)
    print("Saved LIME examples to explanations/lime_examples.json")

def main(num_samples=200):
    X_train_s, X_test_s, y_crop_train, y_crop_test, y_fert_train, y_fert_test = load_train_test()
    crop_model = joblib.load(os.path.join(MODEL_DIR, "crop_recommendation.joblib"))

    # If shap explainer is heavy, use a sample of X_test
    sample = X_test_s[:min(num_samples, X_test_s.shape[0])]
    # feature names as used in preprocess.py
    feature_names = ["nitrogen","phosphorus","potassium","pH","moisture","temperature","NPK_total"]

    shap_summary(crop_model, sample, feature_names)
    lime_examples(crop_model, X_train_s, X_test_s, feature_names, num_examples=5)

if __name__ == "__main__":
    main()

