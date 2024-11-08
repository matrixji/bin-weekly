# read any image and save webp, and keep exif

import sys

from PIL import Image
from pillow_heif import register_heif_opener

register_heif_opener()


def transform(input, output, max_width=1920):
    im = Image.open(input)

    # keep exif
    exif = im.info.get('exif')


    # reshape if needed
    if im.width > max_width:
        im = im.resize((max_width, int(im.height * max_width / im.width)))

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
        max_width = int(sys.argv[3])
        transform(input, output, max_width)
    else:
        transform(input, output)


if __name__ == '__main__':
    main()
