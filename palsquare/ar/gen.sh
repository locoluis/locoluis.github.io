(python3 i.py 2|tee 2.ndjson|python3 posAr.py; python3 i.py 3) |sort|uniq > 3.ndjson; echo 3
(python3 posAr.py < 3.ndjson; python3 i.py 4) |sort|uniq > 4.ndjson; echo 4
(python3 posAr.py < 4.ndjson; python3 i.py 5) |sort|uniq > 5.ndjson; echo 5
(python3 posAr.py < 5.ndjson; python3 i.py 6) |sort|uniq > 6.ndjson; echo 6
(python3 posAr.py < 6.ndjson; python3 i.py 7) |sort|uniq > 7.ndjson; echo 7
(python3 posAr.py < 7.ndjson; python3 i.py 8) |sort|uniq > 8.ndjson; echo 8
(python3 posAr.py < 8.ndjson; python3 i.py 9) |sort|uniq > 9.ndjson; echo 9
(python3 posAr.py < 9.ndjson; python3 i.py 10) |sort|uniq > 10.ndjson; echo 10
(python3 posAr.py < 10.ndjson; python3 i.py 11) |sort|uniq > 11.ndjson; echo 11
(python3 posAr.py < 11.ndjson; python3 i.py 12) |sort|uniq > 12.ndjson; echo 12
(python3 posAr.py < 12.ndjson; python3 i.py 13) |sort|uniq > 13.ndjson; echo 13
(python3 posAr.py < 13.ndjson; python3 i.py 14) |sort|uniq > 14.ndjson; echo 14
(python3 posAr.py < 14.ndjson; python3 i.py 15) |sort|uniq > 15.ndjson; echo 15
(python3 posAr.py < 15.ndjson; python3 i.py 16) |sort|uniq > 16.ndjson; echo 16
(python3 posAr.py < 16.ndjson; python3 i.py 17) |sort|uniq > 17.ndjson; echo 17
#(python3 posAr.py < 17.ndjson; python3 i.py 18) |sort|uniq > 18.ndjson; echo 18
#(python3 posAr.py < 18.ndjson; python3 i.py 19) |sort|uniq > 19.ndjson; echo 19
#(python3 posAr.py < 19.ndjson; python3 i.py 20) |sort|uniq > 20.ndjson; echo 20
