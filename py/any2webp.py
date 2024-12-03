# read any image and save webp, and keep exif

import sys

from PIL import Image
from pillow_heif import register_heif_opener

register_heif_opener()


def transform(input, output, max_height=1080):
    im = Image.open(input)

    # keep exif
    exif = im.info.get('exif')


    # reshape if needed
    if im.height > max_height:
        im = im.resize((int(im.width * max_height / im.height), max_height))

    if not output:
        output = input[:input.rfind('.')] + '.webp'

    if exif:
        im.save(output, 'WEBP', exif=exif)
    else:
        im.save(output, 'WEBP')

def main():
    if len(sys.argv) < 2:
        print('Usage: python any2webp.py <input> [output]')
        sys.exit(1)

    if len(sys.argv) < 3:
        input, output = sys.argv[1], ''
    else:
        input, output = sys.argv[1], sys.argv[2]

    if len(sys.argv) >= 4:
        max_height = int(sys.argv[3])
        transform(input, output, max_height)
    else:
        transform(input, output)


if __name__ == '__main__':
    main()
