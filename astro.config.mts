// @ts-check
import { defineConfig } from 'astro/config';

function defaultLayoutPlugin() {
	return function (_tree: any, file: any) {
		const { frontmatter } = file.data.astro;
        if (!frontmatter.layout) {
		    frontmatter.layout = '@layouts/post.astro';
        }
	};
}

// https://astro.build/config
export default defineConfig({
    markdown: {
        remarkPlugins: [
            defaultLayoutPlugin
        ],
    }
});
