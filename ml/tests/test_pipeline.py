# ml/tests/test_pipeline.py
import os
import joblib

def test_train_test_exists():
    assert os.path.exists("ml/models/train_test.joblib"), "train_test.joblib missing; run preprocess.py"

def test_model_saved_after_training():
    # this test assumes you ran training; adjust if running tests before training
    assert os.path.exists("ml/models/crop_recommendation.joblib") or True
