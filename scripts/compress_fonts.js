// read all files in the directory for fetch all characters
import Fontmin from "fontmin";
import fs from "fs";

const fetchAllCharacters = (path) => {
  const files = fs.readdirSync(path, { withFileTypes: true, recursive: true });
  let characters = new Set();

  for (let i = 0; i < 128; i++) {
    characters.add(String.fromCharCode(i));
  }

  files.forEach((file) => {
    // check if file
    if (file.isFile()) {
      if (!file.name.startsWith(".")) {
        const filepath = `${file.parentPath}/${file.name}`;
        const data = fs.readFileSync(filepath, "utf8");
        const chars = data.split("");
        chars.forEach((char) => {
          characters.add(char);
        });
        // add filename
        filepath.split("").forEach((char) => {
          characters.add(char);
        });
      }
    }
  });
  // return as string text
  return Array.from(characters).join("");
};

const text = fetchAllCharacters("src");

const fontmin = new Fontmin()
  .use(
    Fontmin.glyph({
      text: text,
      hinting: false,
    }),
  )
  .use(Fontmin.ttf2woff2())
  .src("fonts/*.ttf")
  .dest("public/fonts");

fontmin.run(function (err, files) {
  if (err) {
    throw err;
  }
  // remove ttf, keep woff2
  files.forEach((file) => {
    if (file.path.endsWith(".ttf")) {
      fs.unlinkSync(file.path);
      console.log("Deleted: ", file.path);
    } else {
      console.log("Compressed: ", file.path);
    }
  });
});
