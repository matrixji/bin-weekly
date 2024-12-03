// @ts-check
import { defineConfig } from "astro/config";

import tailwind from "@astrojs/tailwind";
import { config } from "./src/config";

function defaultLayoutPlugin() {
  return function (_tree: any, file: any) {
    const { frontmatter } = file.data.astro;
    // default layout
    if (!frontmatter.layout) {
      frontmatter.layout = "@layouts/post.astro";
    }
  };
}

function defaultPicPlugin() {
  function getFirstImageSrc(node: any): any {
    if (node.type === "image" && node.url) {
      return node.url;
    }
    if (node.children) {
      for (const child of node.children) {
        const src = getFirstImageSrc(child);
        if (src) {
          return src;
        }
      }
    }
    if (node.type === "html") {
      const lines = node.value.split("\n");
      for (const line of lines) {
        const match = line.match(/<img[^>]*src="([^"]*)"/);
        if (match) {
          return match[1];
        }
      }
    }
    return null;
  }
  return function (tree: any, file: any) {
    const { frontmatter } = file.data.astro;
    const pic = getFirstImageSrc(tree);
    // starts with /images/d && webp using thumb
    if (pic && pic.startsWith("/images/d") && pic.endsWith(".webp")) {
      frontmatter.pic = pic.replace(".webp", "-thumb.webp");
    } else if (pic) {
      frontmatter.pic = pic;
    } else {
      frontmatter.pic = config.site.pic;
    }
  };
}

function defaultDatePlugin() {
  return function (tree: any, file: any) {
    const { frontmatter } = file.data.astro;
    if (!frontmatter.date) {
      frontmatter.date = new Date().toISOString();
    }
  };
}

function defaultSummaryPlugin() {
  return function (tree: any, file: any) {
    const { frontmatter } = file.data.astro;
    if (!frontmatter.summary) {
      // find first text paragraph
      for (const node of tree.children) {
        if (node.type === "paragraph") {
          for (const child of node.children) {
            if (child.type === "text") {
              frontmatter.summary = child.value;
              return;
            }
          }
        }
      }
    }
  };
}

function applyCustomCommentsPlugin() {
  return function (tree: any) {
    let doPatchNext = ''
    for (const node of tree.children) {
      if (node.type === "raw" && node.value.startsWith("<!--")) {
        doPatchNext = node.value.replace("<!--", "").replace("-->", "").trim()
      }
      if (node.type === "element" && node.tagName === "p") {
        if (doPatchNext.startsWith("+")) {
          const addedClass = doPatchNext.replace("+", "")
          node.properties = {
            ...node.properties,
            class: addedClass
          }
        }
        doPatchNext = ''
      }
    }
  };
}

// https://astro.build/config
export default defineConfig({
  prefetch: true,
  markdown: {
    remarkPlugins: [
      defaultLayoutPlugin,
      defaultPicPlugin,
      defaultSummaryPlugin,
    ],
    rehypePlugins: [
      applyCustomCommentsPlugin,
    ]
  },
  vite: {
    assetsInclude: ["**/*.HEIC"],
  },

  integrations: [tailwind()],
});
