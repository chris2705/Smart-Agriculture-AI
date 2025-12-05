## Evaluation results
Run `python src/evaluate.py` to regenerate evaluation artifacts.

Artifacts produced (ml/explanations/):
- evaluation_metrics.json — accuracy + class lists
- classification_report_crop.txt / classification_report_fert.txt — sklearn reports
- confusion_matrix_crop.png / confusion_matrix_fert.png (and normalized versions)
- sample_predictions.csv — sample of true vs predicted labels for review

Crop Recommendation model got an accuracy of - 0.205
Fertilizer model got an accuracy of - 0.25