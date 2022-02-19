from dataclasses import dataclass
from operator import index
from pickle import NONE
import random
import secrets
import json
import math


def appendDataTree(content, depth, parent, idx):
    content["dataTree"].append({
        "addr": secrets.token_hex(32),
        "index": idx,
        "depth": depth,
        "replication": random.randint(31, 132),
        "parent": parent
    })


def appendParityTree(content, strand, depth, parent, idx, fromm, to):
    content["parityTrees"][strand].append({
        "addr": secrets.token_hex(32),
        "index": idx,
        "depth": depth,
        "replication": random.randint(31, 132),
        "parent": parent,
        "from": fromm,
        "to": to,
    })


BRANCHING_FACTOR = 128
DATAELEMENTS = BRANCHING_FACTOR ** 2 + BRANCHING_FACTOR + 1
ALPHA = 3
S = 5
P = 5

STRAND_WRAP_BACK = [NONE for _ in range(ALPHA * S)]

content = {}

content["config"] = {
    "alpha": ALPHA,
    "s": S,
    "p": P,
    "dataElements": DATAELEMENTS,
    "filesize": DATAELEMENTS * 8 * 2 ** 9,
    "parityLabels": ["Horizontal", "Right", "Left"]
}


content["dataTree"] = []
content["parityTrees"] = [[] for _ in range(ALPHA)]
BackTracing = [0 for _ in range(ALPHA * S)]

# https://book.huihoo.com/data-structures-and-algorithms-with-object-oriented-design-patterns-in-c++/html/page356.html

for i in range(1, DATAELEMENTS + 1):
    if i == DATAELEMENTS:
        depth = 3
        parent = 0

    elif i == DATAELEMENTS - 1:
        depth = 2
        parent = DATAELEMENTS

    elif i % (BRANCHING_FACTOR + 1) == 0:
        parent = DATAELEMENTS
        depth = 2
    else:
        depth = 1
        parent = math.ceil(i / BRANCHING_FACTOR) * (BRANCHING_FACTOR + 1)
        if parent > DATAELEMENTS:
            parent = DATAELEMENTS - 1

    content["dataTree"].append({
        "addr": secrets.token_hex(32),
        "index": i,
        "depth": depth,
        "replication": random.randint(31, 132),
        "parent": parent
    })

    # STRANDS

    parityTo = i + S

    # -- H Strand --
    strand = 0
    if (parityTo <= DATAELEMENTS):
        content["parityTrees"][strand].append({
            "addr": secrets.token_hex(2)[:-1],
            "index": i,
            "depth": depth,
            "replication": random.randint(31, 132),
            "parent": parent,
            "from": i,
            "to": parityTo,
        })
    else:
        right_temp = (i + S) % DATAELEMENTS
        if DATAELEMENTS % S != 0:
            remaining = DATAELEMENTS % S
            right_temp = (i + S) % (DATAELEMENTS - remaining)
            if right_temp > S:
                right_temp = right_temp % S

        content["parityTrees"][strand].append({
            "addr": secrets.token_hex(2)[:-1],
            "index": i,
            "depth": depth,
            "replication": random.randint(31, 132),
            "parent": parent,
            "from": i,
            "to": right_temp,
        })

    # -- RH STRAND --
    helper = i % S
    strand = 1
    if helper >= 1:
        parityTo = i + S + 1
        if parityTo <= DATAELEMENTS:
            content["parityTrees"][strand].append({
            "addr": secrets.token_hex(2)[:-1],
            "index": i,
            "depth": depth,
            "replication": random.randint(31, 132),
            "parent": parent,
            "from": i,
            "to": parityTo,
        })
        else:
            #END STRANDS HERE
            right_temp = parityTo % DATAELEMENTS
            if DATAELEMENTS % S != 0:
                temp_node = i
                while( temp_node > S):
                    if temp_node % S == 1:
                        temp_node = temp_node - S * P + S ** 2 - 1
                    else:
                        temp_node = temp_node - S + 1
                right_temp = temp_node
            if right_temp == 0:
                right_temp = 1
            content["parityTrees"][strand].append({
            "addr": secrets.token_hex(2)[:-1],
            "index": i,
            "depth": depth,
            "replication": random.randint(31, 132),
            "parent": parent,
            "from": i,
            "to": right_temp,
            })

    elif helper == 0:
        parityTo = i + (S * S) - ((S * S) - 1)
        if parityTo <= DATAELEMENTS:
            content["parityTrees"][strand].append({
                "addr": secrets.token_hex(2)[:-1],
                "index": i,
                "depth": depth,
                "replication": random.randint(31, 132),
                "parent": parent,
                "from": i,
                "to": parityTo,
            })
        else:
            #END STRANDS HERE
            right_temp = parityTo % DATAELEMENTS
            if DATAELEMENTS % S != 0:
                temp_node = i
                while temp_node > S:
                    if temp_node % S == 1:
                        temp_node = temp_node - S * P + S ** 2 - 1
                    else:
                        temp_node = temp_node - (S + 1)
                right_temp = temp_node
            if right_temp == 0:
                right_temp = 1
            content["parityTrees"][strand].append({
            "addr": secrets.token_hex(2)[:-1],
            "index": i,
            "depth": depth,
            "replication": random.randint(31, 132),
            "parent": parent,
            "from": i,
            "to": right_temp,
            })


    # -- LH STRAND --
    strand = 2
    # -- TOP --
    if helper == 1:
        parityTo = i + S * S - (S - 1) ** 2
        if parityTo <= DATAELEMENTS:
            content["parityTrees"][strand].append({
                "addr": secrets.token_hex(2)[:-1],
                "index": i,
                "depth": depth,
                "replication": random.randint(31, 132),
                "parent": parent,
                "from": i,
                "to": parityTo,
            })
        else:
            #END STRANDS HERE
            right_temp = parityTo % DATAELEMENTS
            if DATAELEMENTS % S != 0:
                temp_node = i
                while temp_node > S:
                    if temp_node % S == 0:
                        temp_node = temp_node - S * P + (S - 1) ** 2
                    else:
                        temp_node = temp_node - (S - 1)
                right_temp = temp_node
            if right_temp == 0:
                right_temp = 1

            content["parityTrees"][strand].append({
            "addr": secrets.token_hex(2)[:-1],
            "index": i,
            "depth": depth,
            "replication": random.randint(31, 132),
            "parent": parent,
            "from": i,
            "to": right_temp,
            })

    # -- Central & bottom
    elif helper == 0 or helper > 1:
        parityTo = i + S - 1
        if parityTo <= DATAELEMENTS:
            content["parityTrees"][strand].append({
                "addr": secrets.token_hex(2)[:-1],
                "index": i,
                "depth": depth,
                "replication": random.randint(31, 132),
                "parent": parent,
                "from": i,
                "to": parityTo,
            })
        else:
            #END STRANDS HERE
            right_temp = parityTo % DATAELEMENTS
            if DATAELEMENTS % S != 0:
                temp_node = i
                while temp_node > S:
                    if temp_node % S == 0:
                        temp_node = temp_node - S * P + (S - 1) ** 2
                    else:
                        temp_node = temp_node - (S - 1)
                right_temp = temp_node
            if right_temp == 0:
                right_temp = 1
            content["parityTrees"][strand].append({
            "addr": secrets.token_hex(2)[:-1],
            "index": i,
            "depth": depth,
            "replication": random.randint(31, 132),
            "parent": parent,
            "from": i,
            "to": right_temp,
            })

with open("input.json", "w") as file:
    json.dump(content, file)