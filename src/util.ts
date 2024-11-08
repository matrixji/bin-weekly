import type { MarkdownInstance } from "astro";

// Sort all articles.
export const sortPosts = (posts: MarkdownInstance<Record<string, any>>[]) => {
    return posts.sort((a: MarkdownInstance<Record<string, any>>, b: MarkdownInstance<Record<string, any>>) => {
        // url format: /blog/2021/01/01/yyww-title
        // get basename from url, then split by '-', sort by yyww
        const aDate = a.url ? a.url.split("/").slice(-1)[0].split("-")[0] : "9999";
        const bDate = b.url ? b.url.split("/").slice(-1)[0].split("-")[0] : "9999";
        return parseInt(bDate) - parseInt(aDate);
    });
};


// Parse title from markdown frontmatter or url.
export const parsePostTitle = (post: MarkdownInstance<Record<string, any>>) => {
    // read title from markdown frontmatter or parse from url
    if (post.frontmatter && post.frontmatter.title) {
        console.log(post.frontmatter.title);
        return post.frontmatter.title;
    }
    if (post.url) {
        const pathnames = post.url.split("/").reverse()[0].split("-")
        return pathnames.slice(pathnames.length - 1).join("-");
    }
    return "Unknown";
};

export const parsePostNumber = (post: MarkdownInstance<Record<string, any>>) => {
    if (post.url) {
        const num_text = post.url.split("/").reverse()[0].split("-")[0];
        if (num_text.length === 4) {
            return num_text;
        }
    }
    return "9999";
}
