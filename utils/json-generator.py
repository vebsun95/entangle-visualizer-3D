import random
import secrets
import json


DATAELEMENTS = 24620
ALPHA = 3
S = 5
P = 5

content = {}

content["config"] = {
    "alpha":ALPHA,
    "s":S,
    "p":P,
    "dataElements":DATAELEMENTS,
    "filesize": DATAELEMENTS * 8 * 2 ** 9,
    "parityLabels": ["Horizontal", "Right", "Left"]
}


content["dataTree"] = []
content["parityTrees"] = [[] for _ in range(ALPHA)]
for i in range(1, DATAELEMENTS + 1):
    if i == 1:
        depth= 3
    elif i % 129 == 0:
        depth = 2
    else:
        depth = 1
    
    if i == 1:
        parent = 0
    elif i % 129 == 0:
        parent = 1
    else:
        parent = ((i // 129) + 1) * 129

    content["dataTree"].append({
        "addr": secrets.token_hex(32),
        "index": i,
        "depth": depth,
        "replication": random.randint(31, 132),
        "parent": parent
    })

    parityTo = i + S

    if parityTo <= DATAELEMENTS:
        content["parityTrees"][0].append({
            "addr": "QqQ",
            "latticeIndex":i,
            "index": i,
            "depth":depth,
            "replication": random.randint(31,108),
            "parent": parent,
        })


with open("input.json", "w") as file:
    file.write(json.dumps(f"{content}"))