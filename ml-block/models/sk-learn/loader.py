import sys
import argparse
import numpy as np
import joblib
import json
import urllib.request as ur

p = argparse.ArgumentParser()
p.add_argument('model_url', type=str)
p.add_argument('shape', nargs=2, type=int)
p.add_argument('values', nargs='+', type=float)

p_args = p.parse_args()

if p_args.model_url is not None:
    model_file_name = 'model_down.joblib'
    ur.urlretrieve(p_args.model_url, model_file_name)
    clf = joblib.load(model_file_name)
else:
    raise Exception('Missing model url!')

test_data = np.array(list(map(lambda x : [x], p_args.values)))
test_data = test_data.reshape(tuple(p_args.shape))

print(json.dumps(clf.predict(test_data).tolist()))
sys.stdout.flush()