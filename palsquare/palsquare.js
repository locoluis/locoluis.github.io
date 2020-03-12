/* This class models each possible way to recursively divide a rectangle */
var Partition = function() {
	/* Orientation: 0=lightness, 1=hue */
	this.orient = null;
	this.items = [];
	this.descendants = 0;
	this.tok = /^((v)|(h)|([0-9a-fA-F]{3,6})|(\()|(\)))/;
	this.parsedChar = 0;
	this.parsedString = null;
	this.x = this.y = 0;
	this.w = this.h = 1;

	this.load = function(orient, lst) {
		this.orient = orient;
		for(var i = 0; i < lst.length; i++) {
			if(typeof lst[i] == 'object') {
				var p = new Partition();
				p.load(1 - this.orient, lst[i]);
				this.items.push(p);
				this.descendants += p.descendants;
			} else {
				this.items.push(lst[i]);
				this.descendants++;
			}
		}
	};

	this.save = function() {
		var ret = [];
		for(var i = 0; i < this.items.length; i++) {
			if(typeof this.items[i] == 'object') {
				ret.push(this.items[i].save().scheme);
			} else {
				ret.push(this.items[i]);
			}
		}
		return {
			orient: this.orient,
			scheme: ret
		};
	}

	this.fill = function(values, c) {
		if(typeof c == 'undefined') {
			c = 0;
		}
		for(var i = 0; i < this.items.length; i++) {
			if(typeof this.items[i] == 'object') {
				c = this.items[i].fill(values, c);
			} else {
				this.items[i] = values[c];
				c++;
			}
		}
		return c;
	};

	this.parse = function(str) {
		if(typeof str != 'undefined') {
			this.parsedString = "" + str;
		}
		var l, m;
		while(this.parsedString.length > 0) {
			l = 1;
			m = this.parsedString.match(this.tok);
			if(m) {
				l = m[0].length;
			}
			this.parsedString = this.parsedString.substring(l);
			if(m) {
				if(m[2]) {
					if(this.orient == null) {
						this.orient = 0;
					} else {
						return this.parseError("Unexpected " + m[2]);
					}
				} else if(m[3]) {
					if(this.orient == null) {
						this.orient = 1;
					} else {
						return this.parseError("Unexpected " + m[3]);
					}
				} else if(m[4]) {
					this.items.push(m[4]);
					this.descendants ++;
				} else if(m[5]) {
					this.parsedChar += l;
					l = 0;
					var p = new Partition();
					p.orient = 1 - this.orient;
					var ret = p.parse(this.parsedString);
					if(ret !== true) {
						return ret;
					}
					this.parsedString = p.parsedString;
					this.items.push(p);
					this.descendants += p.descendants;
				} else if(m[6]) {
					this.parsedChar += l;
					return true;
				}
			}
			this.parsedChar += l;
		}
		return true;
	};
	this.parseError = function(s) {
		console.error(s + " at character " + this.parsedChar);
	}
	this.structure = function() {
		var ret = "vh"[this.orient] + "[" + this.items.length + ";" + this.descendants + "]:";
		for(var i = 0; i < this.items.length; i++) {
			if(typeof this.items[i] == 'object') {
				ret += " child(" + this.items[i].structure() + ")";
			} else {
				ret += " color(" + this.items[i] + ")"
			}
		}
		return ret;
	};
	this.boxes = function(x, y, w, h) {
		/* step? */
		/* Assume that this.descendants is correct */
		var ret = [];
		var dx, dy, bw, bh, mw, mh;
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
		if(this.orient) {
			bw = dx = w / this.descendants;
			dy = 0;
			bh = h;
		} else {
			dx = 0;
			bw = w;
			bh = dy = h / this.descendants;
		}
		//console.log("X", x, y, w, h, dx, dy, bw, bh);
		for(var i = 0; i < this.items.length; i++) {
			if(typeof this.items[i] == 'object') {
				if(this.orient) {
					mw = bw * this.items[i].descendants;
					mh = bh;
				} else {
					mw = bw;
					mh = bh * this.items[i].descendants;
				}
				var r = this.items[i].boxes(x, y, mw, mh);
				for(var j = 0; j < r.length; j++) {
					ret.push(r[j]);
				}
				x += dx * this.items[i].descendants;
				y += dy * this.items[i].descendants;
			} else {
				ret.push([x, y, bw, bh, this.items[i]]);
				x += dx;
				y += dy;
			}
		}
		return ret;
	};
};

function distance(a, b) {
	var dx = a.x - b.x;
	var dy = a.y - b.y;
	return Math.sqrt(dx * dx + dy * dy);
}

var findBestScheme = function(colors) {
	var chrs = [];
	var yampl = 2.0;

	/* Compute average hue and luma to center the graph */
	/* Also compute average chroma, to discard the hue of grays
	 * This method was tested with Drawception's Candy and Grimby Grays.
	 */
	var asum = 0, bsum = 0, abcount = 0; lsum = 0, lmin = null, lmax = null;
	var cavg = 0;
	for(var i = 0; i < colors.length; i++) {
		var ch = chroma(colors[i]);
		chrs.push(ch);
		cavg = ch.lch()[1];
	}
	cavg /= colors.length;
	for(var i = 0; i < colors.length; i++) {
		var ch = chrs[i];
		var ang = ch.lab();
		lsum += ang[0];
		if(i == 0) {
			lmin = lmax = ang[0];
		} else {
			if(lmin > ang[0]) {
				lmin = ang[0];
			}
			if(lmax < ang[0]) {
				lmax = ang[0];
			}
		}
		if(ch.lch()[1] >= cavg / 3.0) {
			asum += ang[1];
			bsum += ang[2];
			abcount++;
		}
	}
	var lavg = lsum / colors.length
	var havg = (Math.atan2(bsum / abcount, asum / abcount)  * 180.0 / Math.PI + 360.0) % 360.0;
	/* Compute minimum and maximum hue */
	var hmin = null, hmax = null;
	for(var i = 0; i < colors.length; i++) {
		if(chrs[i].lch()[1] >= cavg / 3.0) {
			var nh = (chrs[i].lch()[2] + 540.0 - havg) % 360.0;
			if(hmin === null) {
				hmin = hmax = nh;
			} else {
				if(hmin > nh) {
					hmin = nh;
				}
				if(hmax < nh) {
					hmax = nh;
				}
			}
		}
	}
	hmin = (hmin + havg + 540.0) % 360.0;
	hmax = (hmax + havg + 540.0) % 360.0;
	if(Math.abs(hmax - hmin) < 0.1) {
		hmin -= 1;
		hmax += 1;
	}
	if(Math.abs(lmax - lmin) < 0.1) {
		lmin -= 1;
		lmax += 1;
	}
	/* Compute positions of each point, on a 1x3 rectangle
	 * We need luma to be more important than hue
	 */
	var positions = [];
	for(var i = 0; i < colors.length; i++) {
		var lch = chrs[i].lch()
		if(lch[1] < cavg / 3.0) {
			lch[2] = havg;
		}
		positions.push({
			x: ((lch[2] - hmin + 720) % 360) / ((hmax - hmin + 720) % 360),
			y: (lch[0] - lmin) / (lmax - lmin) * yampl,
			color: colors[i]
		});
	}
	/* Evaluate each scheme, to find the closest one. This is a
	 * brute-force approach. I'm just a code monkey, I don't have the
	 * brainpower necessary to think of a more elegant method.
	 */
	var closestScheme = null;
	var closestColors = null;
	var closestSchemeDist = null;

	this.start = function() {
		closestScheme = null;
		closestColors = null;
		closestSchemeDist = null;
	};

	this.iterate = function(orient, arrangement) {
		var scheme = new Partition();
		scheme.load(orient, arrangement);
		var boxes = scheme.boxes(0, 0, 1, yampl);
		for(var i = 0; i < positions.length; i++) {
			positions[i].box = null;
			positions[i].dist = null;
		}
		var distsum = 0;
		for(var k = 0; k < boxes.length; k++) {
			var x = boxes[k][0] + boxes[k][2] / 2;
			var y = boxes[k][1] + boxes[k][3] / 2;
			/* Find closest color position */
			var closest = null;
			var minD = null;
			for(var i = 0; i < positions.length; i++) {
				if(positions[i].box != null) {
					continue;
				}
				var d = distance(positions[i], {x: x, y: y});
				if((closest === null) || (minD > d)) {
					minD = d;
					closest = i;
				}
			}
			positions[closest].box = k;
			positions[closest].dist = minD;
			distsum += minD;
		}
		if((closestScheme === null) || (closestSchemeDist > distsum)) {
			closestScheme = scheme;
			closestSchemeDist = distsum;
			closestColors = [];
			for(var i = 0; i < positions.length; i++) {
				closestColors.push(positions[i].box);
			}
		}
	};
	this.maxr = function(a) {
		var m = 0;
		if(typeof a == 'object') {
			for(var i = 0; i < a.length; i++) {
				var n = this.maxr(a[i]);
				if(m < n) {
					m = n;
				}
			}
		} else {
			m = a;
		}
		return m;
	}
	this.recursive = function(orient, st, stlen) {
		if(typeof orient == 'undefined') {
			this.iterate(0, [1, 2]);
			this.iterate(1, [1, 2]);
			this.recursive(closestScheme.orient, [1, 2], 2);
		}
		function rec(lst, i, add) {
			var r = [];
			for(var j = 0; j < lst.length; j++) {
				if(typeof lst[j] == 'object') {
					r.push(rec(lst[j], i, add));
				} else if(lst[j] == i) {
					var s = [];
					for(var k = 0; k < add.length; k++) {
						s.push(add[k]);
					}
					r.push(s);
				} else {
					r.push(lst[j]);
				}
			}
			return r;
		}
		/* buscamos i en st y lo reemplazamos por [i, i+1] hasta [i, i+1.., colors.length] */
		for(var i = 1; i <= stlen; i++) {
			var add = [];
			for(var j = i; j <= colors.length; j++) {
				var t = [];
				for(var k = i; k <= j; k++) {
					t.push(k);
				}
				add.push(t);
			}
			for(var j = 0; j < add.length; j++) {
				var r = rec(st, i, add[j]);
				console.log(st, i, add[j], r);
				this.iterate(orient, r);
			}
		}
		var closest = closestScheme.save();
		console.log("closest:", closest);
		if(stlen < colors.length) {
			this.recursive(orient, closest, stlen + 1);
		}
	}
	this.finish = function() {
		/* Fill the scheme with the colors assigned to each box */
		var fill = [];
		for(var k = 0; k < closestColors.length; k++) {
			for(var i = 0; i < closestColors.length; i++) {
				if(closestColors[i] == k) {
					fill.push(positions[i].color);
				}
			}
		}
		closestScheme.fill(fill);
		/* Return the list of boxes filled, this time on a 240x240 rectangle */
		return closestScheme.boxes(0, 0, 240, 240);
	};
}

/* Process the form */
function compute(event) {
	event.preventDefault();
	event.stopPropagation();
	var colorRe = /[A-Za-z0-9#]+|rgb\([ 0-9]+,[ 0-9]+,[ 0-9]+\)/g;
	var colors = this.colors.value + "";
	var colorList = [...colors.matchAll(colorRe)];
	var sizes = {
	14: "822K",
	15: "1.8M",
	16: "4M",
	17: "8.9M"
	};

	var colors = [];
	for(var i = 0; i < colorList.length; i++) {
		var cl = colorList[i];
		if(chroma.valid(cl[0])) {
			colors.push(cl[0]);
		}
	}
	if(colors.length < 2) {
		alert('Not enough colors.');
		return;
	}
	if(colors.length > 17) {
		alert('Too many colors.');
		return;
	}
	if(colors.length > 13) {
		var ok = confirm("This program follows a brute-force approach.\n"
			+ "For " + colors.length + " colors, it will download a\n"
			+ sizes[colors.length] + " data file, and may be slow to process.\n"
			+ "Do you wish to continue?");
		if(!ok) {
			return;
		}
	}
	var f = new findBestScheme(colors);
	f.recursive();
	var boxes = f.finish();
	var arena = document.getElementById('arena');
	for(var i = arena.children.length - 1; i >= 0; i--) {
		arena.removeChild(arena.children[i]);
	}
	for(var i = 0; i < boxes.length; i++) {
		var b = boxes[i];
		var node = document.createElementNS(xmlns, "path");
		node.setAttributeNS(null, "d",
			"M" + (b[0]) + "," + (b[1])
			+ " h" + (b[2]) + " v" + (b[3])
			+ " h-" + (b[2]) + "z");
		node.setAttributeNS(null, "fill", chroma(b[4]).hex());
		arena.appendChild(node);
	}
	return false;
}
jQuery(function() {
	jQuery('#form').submit(compute);
});
