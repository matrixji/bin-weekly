import type { MarkdownInstance } from "astro";
import moment from "moment";

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
        return post.frontmatter.title;
    }
    if (post.url) {
        const pathnames = post.url.split("/").reverse()[0].split("-")
        return pathnames.slice(pathnames.length - 1).join("-");
    }
    return "Unknown";
};

const getYearWeekNumber = (date: Date) => {
    const theDate = moment(date);
    const week = theDate.week();
    const year = theDate.year() - 2000;
    return `${year.toString().padStart(2, "0")}${week.toString().padStart(2, "0")}`;
}

export const parsePostNumber = (post: MarkdownInstance<Record<string, any>>) => {
    if (post.url) {
        const num_text = post.url.split("/").reverse()[0].split("-")[0];
        if (num_text.length === 4) {
            return num_text;
        }
    }
    // try from date in frontmatter
    if (post.frontmatter && post.frontmatter.date) {
        const date = new Date(post.frontmatter.date);
        return getYearWeekNumber(date);
    }
    return "9999";
}

export const getYmdFormPost = (post: MarkdownInstance<Record<string, any>> | undefined) => {
    if (post === undefined) {
        return moment().format("YYYY/MM/DD");
    }
    if (post.frontmatter && post.frontmatter.date) {
        return moment(post.frontmatter.date).local().format("YYYY/MM/DD");
    }
    const num = parsePostNumber(post);
    const year = parseInt(num.slice(0, 2)) + 2000;
    const week = parseInt(num.slice(2, 4));
    if (week === 0) {
        return moment().year(year).month(0).date(1).local().format("YYYY/MM/DD");
    }
    return moment().year(year).week(week).weekday(7).local().format("YYYY/MM/DD");
}


export const parseArticleTitle = (post: MarkdownInstance<Record<string, any>> | undefined) => {
    if (post === undefined) {
        return "No.9999 Unknown";
    }
    const title = parsePostTitle(post);
    const num = parsePostNumber(post);
    return `No.${num} ${title}`;
}

export const parseArticleSummary = (post: MarkdownInstance<Record<string, any>> | undefined) => {
    if (post === undefined) {
        return "No.9999 Unknown";
    }
    if (post.frontmatter && post.frontmatter.summary) {
        return post.frontmatter.summary;
    }
    return "No summary";
}
