import sys, json
print(json.dumps(list(range(1, 1 + int(sys.argv[1])))))
