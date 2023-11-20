const os = require('os');
const fsExtra = require('fs-extra'); // Equivalent to shutil in Python
const glob = require('glob'); // Equivalent to glob in Python
const process = require('process'); // Equivalent to sys in Python
const moment = require('moment'); // Equivalent to datetime in Python
const marked = require('marked'); // Equivalent to commonmark in Python
const fs = require('fs');
const path = require('path');

class StaticSiteGenerator {
    constructor() {
        console.log("*** Constructing ***");
    }

    // Reads the content of a file
    async fread(filename) {
        console.log("***************** Reading file:", filename);  // Debugging statement

        try {
            const data = fs.promises.readFile(filename, 'utf8');
            return data;
        } catch (err) {
            console.error(err);
            return null;
        }
    }

    // Writes content to a file
    fwrite(filename, text) {
        console.log("*** fwrite ***");
        const fs = require('fs');
        const path = require('path');

        try {
            const basedir = path.dirname(filename);
            if (!fs.existsSync(basedir)) {
                fs.mkdirSync(basedir, { recursive: true });
            }

            fs.writeFileSync(filename, text, 'utf8');
        } catch (err) {
            console.error(err);
        }
    }

    // Logs a message with specified arguments
    log(msg, ...args) {
        console.log("*** log ***");
        const util = require('util');
        console.error(util.format(msg, ...args));
    }

    // Remove tags and truncate text to the specified number of words
    truncate(text, words = 25) {
        console.log("*** truncate ***");
        return text.replace(/<.*?>/gs, ' ').split(/\s+/).slice(0, words).join(' ');
    }

    // Parse headers in text and yield (key, value, end-index) tuples
    * read_headers(text) {
        console.log("*** read_headers ***");
        const headerRegex = /\\s*<!--\\s*(.+?)\\s*:\\s*(.+?)\\s*-->\\s*|.+?/g;
        let match;

        while ((match = headerRegex.exec(text)) !== null) {
            if (!match[1]) break;
            yield { key: match[1], value: match[2], endIndex: match.index + match[0].length };
        }
    }

    // Convert yyyy-mm-dd date string to RFC 2822 format date string
    rfc_2822_format(dateStr) {
        console.log("*** rfc_2822_format ***");
        const moment = require('moment');

        return moment(dateStr, 'YYYY-MM-DD').format('ddd, DD MMM YYYY HH:mm:ss +0000');
    }

    // Read content and metadata from file into a dictionary
    async read_content(filename) {
        console.log("*** read_content ***");
        const fs = require('fs');
        const path = require('path');
        const marked = require('marked');

        // Read file content
        let text;
        try {
            text = await fs.promises.readFile(filename, 'utf8');
        } catch (err) {
            console.error('Error reading file:', err);
            return null;
        }

        // Extract date and slug from filename
        const dateSlug = path.basename(filename).split('.')[0];
        const match = /^(?:(\\d{4}-\\d{2}-\\d{2})-)?(.+)$/.exec(dateSlug);
        const content = {
            date: match[1] || '1970-01-01',
            slug: match[2],
        };
        this.slug = content['slug']

        // Read headers
        let end = 0;
        const headerRegex = /\\s*<!--\\s*(.+?)\\s*:\\s*(.+?)\\s*-->\\s*|.+?/g;
        let headerMatch;
        while ((headerMatch = headerRegex.exec(text)) !== null) {
            if (!headerMatch[1]) break;
            content[headerMatch[1]] = headerMatch[2];
            end = headerMatch.index + headerMatch[0].length;
        }

        // Separate content from headers
        text = text.substring(end);

        // Convert Markdown content to HTML, if applicable
        if (/\\.(md|mkd|mkdn|mdown|markdown)$/.test(filename)) {
            try {
                text = marked(text);
            } catch (err) {
                this.log('WARNING: Cannot render Markdown in ' + filename + ': ' + err.message);
            }
        }

        // Update the dictionary with content and RFC 2822 date
        content.content = text;
        content.rfc_2822_date = this.rfc_2822_format(content.date);

        return content;
    }

    // Replace placeholders in template with values from params
    render(template, params) {
        console.log("*** render ***");
        return template.replace(/{{\s*([^}\s]+)\s*}}/g, (match, p1) => {
            return String(params[p1] !== undefined ? params[p1] : match);
        });
    }

    async makePages(src, dst, templateContent) {
        console.log("*** makePages ***");
        console.log("*** templateContent = " + templateContent);
        console.log("*** src = " + src);
        console.log("*** dst = " + dst);

        // Create destination directory if it doesn't exist
        await fsExtra.ensureDir(dst);

        // Read the template
        //           const templateContent = await fsExtra.readFile(templatePath, 'utf8');

        // Process each markdown file in the source directory
        const mdFiles = glob.sync(path.join(src, '*.md'));
        console.log("*** mdFiles = " + mdFiles);

        for (const mdFile of mdFiles) {
            // Extract the file name without extension
            const baseName = path.basename(mdFile, path.extname(mdFile));

            // Read markdown content
            const mdContent = await fsExtra.readFile(mdFile, 'utf8');

            // Convert markdown to HTML
            const htmlContent = marked(mdContent);

            // Generate the final HTML content
            const finalContent = templateContent.replace('{{ content }}', htmlContent);

            console.log("*** finalContent = " + finalContent);
            console.log("*** path.join(dst, `${baseName}.html`) = " + path.join(dst, `${baseName}.html`));

            // Write the HTML file to the destination directory
            await fsExtra.writeFile(path.join(dst, `${baseName}.html`), finalContent);
        }

        // Copy static files (images, CSS, JS) to the destination directory
        const staticSrc = path.join(src, 'static');
        const staticDst = path.join(dst, 'static');
        if (await fsExtra.pathExists(staticSrc)) {
            await fsExtra.copy(staticSrc, staticDst, { overwrite: true });
        }

        // Write a log entry
        const logEntry = {
            timestamp: moment().format(),
            src,
            dst,
            filesProcessed: mdFiles.length
        };
        await fsExtra.writeFile(path.join(dst, 'log.json'), JSON.stringify(logEntry, null, 2));
    }

    async makeList(src, dst) {
        console.log("*** makeList ***");
        if (!src || typeof src !== 'string') {
            throw new Error("Invalid 'src' argument: must be a defined string");
        }
        // Create destination directory if it doesn't exist
        await fsExtra.ensureDir(dst);

        // List all files in the source directory
        //  const files = (await fs.readdir(src))
        //    .filter(f => fs.statSync(path.join(src, f)).isFile());
        console.log("***** src = " + src)
        console.log("***** dst = " + dst)

        const files = (await fs.promises.readdir(src))
            .filter(async f => {
                const stats = await fs.promises.stat(path.join(src, f));
                return stats.isFile();
            });

        // Write the list to a JSON file in the destination directory
        await fs.writeJson(path.join(dst, 'file_list.json'), files);
    }

    async main() {
        console.log("***  main ***");
        // Create a new '_site' directory from scratch
        const siteDir = '_site';
        if (await fsExtra.pathExists(siteDir)) {  // Changed from fs to fsExtra
            await fsExtra.remove(siteDir);        // Assuming you have fsExtra.remove method
        }
        await fsExtra.copy('static', siteDir);    // Assuming you have fsExtra.copy method


        // Default parameters
        let params = {
            basePath: '',
            subtitle: 'A Site',
            author: 'The Author',
            siteUrl: 'https://example.org',
            currentYear: moment().year()
        };

        // If params.json exists, load it
        const paramsPath = 'params.json';
        if (await fsExtra.pathExists(paramsPath)) {
            const paramsJson = await fs.readJson(paramsPath);
            params = { ...params, ...paramsJson };
        }

        // Load layouts
        const pageLayout = await fs.promises.readFile('layout/page.html', 'utf8');
        const postLayout = await fs.promises.readFile('layout/post.html', 'utf8');
        const listLayout = await fs.promises.readFile('layout/list.html', 'utf8');
        const itemLayout = await fs.promises.readFile('layout/item.html', 'utf8');
        const feedXml = await fs.promises.readFile('layout/feed.xml', 'utf8');
        const itemXml = await fs.promises.readFile('layout/item.xml', 'utf8');

        // Combine layouts to form final layouts
        const finalPostLayout = this.render(pageLayout, postLayout);
        const finalListLayout = this.render(pageLayout, listLayout);

        // async makePages(src, dst, templatePath)

        // Create site pages
        await this.makePages('content/_index.html', path.join(siteDir, 'index.html'), pageLayout, params);
        // make_pages('content/_index.html', '_site/index.html', page_layout, **params)

        /*
        A slug is a string that can only include characters, numbers, dashes, and underscores. It is the part of a URL that identifies a particular page on a website, in a human-friendly form.
        */
        await this.makePages('content/[!_]*.html', `_site/${this.slug}/index.html`, pageLayout, params);

        const blogPosts = await this.makePages('content/blog/*.md', `_site/blog/${this.slug}/index.html`, postLayout, { blog: 'blog', ...params });
        const newsPosts = await this.makePages('content/news/*.html', `_site/news/${this.slug}/index.html`, postLayout, { blog: 'news', ...params });

        console.log("--------------blogPosts = " + blogPosts)
        console.log("--------------newsPosts = " + newsPosts)

        await this.makeList(blogPosts, '_site/blog/index.html', listLayout, itemLayout, { blog: 'blog', title: 'Blog', ...params });
        await this.makeList(newsPosts, '_site/news/index.html', listLayout, itemLayout, { blog: 'news', title: 'News', ...params });

        await this.makeList(blogPosts, '_site/blog/rss.xml', feedXml, itemXml, { blog: 'blog', title: 'Blog', ...params });
        await this.makeList(newsPosts, '_site/news/rss.xml', feedXml, itemXml, { blog: 'news', title: 'News', ...params });


    }
}

module.exports = StaticSiteGenerator;
