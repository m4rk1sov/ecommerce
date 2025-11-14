def precision_recall_f1(actual, predicted):
    actual = set(actual)
    predicted = set(predicted)

    tp = len(actual & predicted)
    fp = len(predicted - actual)
    fn = len(actual - predicted)

    precision = tp / (tp + fp) if tp + fp > 0 else 0
    recall    = tp / (tp + fn) if tp + fn > 0 else 0
    f1        = 2 * precision * recall / (precision + recall) if precision + recall > 0 else 0

    return precision, recall, f1

def test_recommendation_quality():
    actual = ["p1", "p2", "p3"]        # what user actually liked
    predicted = ["p2", "p3", "p5"]    # what your system recommended

    p, r, f1 = precision_recall_f1(actual, predicted)
    print(p, r, f1)

    assert p > 0
    assert r > 0
    assert f1 > 0
