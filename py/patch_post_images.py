import os

from any2webp import transform
from PIL import Image


def create_exif_for_webp(filepath):
    if not os.path.exists(filepath):
        return
    exif_filepath = filepath + '.exif.txt'
    if os.path.exists(exif_filepath):
        return
    img = Image.open(filepath)
    exif = img.getexif()
    if exif:
        camera_model = exif.get(272, '')
        camera_make = exif.get(271, '')
        datetime = exif.get(306, '')
        if camera_make or camera_model or datetime:
            with open(exif_filepath, 'w') as f:
                f.write(f'by: {camera_make} {camera_model}, {datetime}')

def lookup_original_image(images_dir, filepath):
    filepath = filepath.replace('/images/d/', '/images/')
    lookup_dir = os.path.join(images_dir, os.path.dirname(filepath[1:]))
    for file in os.listdir(lookup_dir):
        filename_converted = file.replace('_', '-').lower().rsplit('.', 1)[0] + '.webp'
        if filename_converted == os.path.basename(filepath):
            return os.path.join(lookup_dir, file)
    return None

def check_if_newer(file1, file2):
    if not file1 or not file2:
        return False
    if not os.path.exists(file1):
        return False
    if not os.path.exists(file2):
        return True
    return os.path.getmtime(file1) > os.path.getmtime(file2)


def patch_md_images(md_file, images_dir, dest_images_dir):
    print(f'Patching {md_file} ...')
    with open(md_file, 'r') as f:
        lines = f.readlines()
    for i, line in enumerate(lines):
        strip_line = line.strip()
        if strip_line.startswith('!['):
            index = strip_line.find('(')
            if index == -1:
                continue
            filename = strip_line[index + 1:strip_line.find(')', index)]
            if not filename:
                continue
            filename = filename.split(' ')[0]
            if not filename.startswith('/images'):
                continue
            filepath = filename
            if '/d/' not in filepath or not filepath.endswith('.webp'):
                d_filepath = filepath.replace('/images', '/images/d')
                d_filepath = d_filepath.replace('_', '-').lower()
                d_filepath = d_filepath[:d_filepath.rfind('.')] + '.webp'
            else:
                d_filepath = filepath
            d_filepath_full = os.path.join(dest_images_dir, d_filepath[1:])
            if d_filepath == filepath:
                # check if original need transform again
                original_image = lookup_original_image(images_dir,d_filepath)
                if check_if_newer(original_image, d_filepath_full):
                    os.makedirs(os.path.dirname(d_filepath_full), exist_ok=True)
                    transform(original_image, d_filepath_full)
                    print(f'Updated {d_filepath_full} from {original_image}')
            if not os.path.exists(d_filepath_full):
                os.makedirs(os.path.dirname(d_filepath_full), exist_ok=True)
                input = os.path.join(images_dir, filepath[1:])
                transform(input, d_filepath_full)
                print(f'Converted {input} to {d_filepath_full}')
            d_thumb_filepath = d_filepath_full.replace('.webp', '-thumb.webp')
            if check_if_newer(d_filepath_full, d_thumb_filepath):
                transform(d_filepath_full, d_thumb_filepath, max_height=384)
                print(f'Converted {d_filepath_full} to {d_thumb_filepath}')
            lines[i] = line.replace(filepath, d_filepath)
            # create_exif_for_webp(d_filepath_full)
    with open(md_file, 'w') as f:
        f.writelines(lines)
        
def main():
    this_dir = os.path.dirname(os.path.realpath(__file__))
    parent_dir = os.path.dirname(this_dir)
    posts_dir = os.path.join(parent_dir, 'src', 'pages', 'posts')
    images_dir = os.path.join(parent_dir)
    dest_images_dir = os.path.join(parent_dir, 'public')
    for root, dirs, files in os.walk(posts_dir):
        for file in files:
            if file.endswith('.md'):
                patch_md_images(os.path.join(root, file), images_dir, dest_images_dir)

if __name__ == '__main__':
    main()