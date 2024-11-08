import sys

from fontTools.ttLib.woff2 import compress

input, output = sys.argv[1], sys.argv[2]

compress(input, output)