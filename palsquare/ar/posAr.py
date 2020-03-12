# Este programa intenta generar todas las combinaciones posibles
# La regla de reemplazo es la siguiente:
# [[1,2]] → [[[1,2],3],[1,[2,3]]
import json, sys

def getlen(d):
	l = 1
	if type(d) is list:
		l = 0
		for e in d:
			l += getlen(e)
	return l

def armar(d, i, l, level=0):
	if level >= 3:
		return d
	if type(d) is list:
		r = []
		for k in d:
			r.append(armar(k, i, l, level + 1))
		return r
	elif d == i:
		d = [i, l]
	return d

def ordenar(e):
	i = 1
	def o(f):
		nonlocal i
		if type(f) is list:
			r = []
			for g in f:
				r.append(o(g))
		else:
			r = i
			i += 1
		return r
	return o(e)

for line in sys.stdin:
	d = json.loads(line.strip())
	l = getlen(d) + 1
	for i in range(1, l):
		e = armar(d, i, l)
		if getlen(e) != l:
			continue
		e = ordenar(e)
		print(json.dumps(e))
