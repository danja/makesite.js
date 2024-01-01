const os = require('os');
const glob = require('glob'); // Equivalent to glob in Python
const process = require('process'); // Equivalent to sys in Python
const moment = require('moment'); // Equivalent to datetime in Python
const marked = require('marked'); // Equivalent to commonmark in Python
const fs = require('fs');
const path = require('path');
const util = require('util');

// Set options
/*
marked.use({
    : false,
    pedantic: false,
    gfm: true,
});
*/

class StaticSiteGenerator {
    constructor() {
        console.log("*** Constructing ***");

        // Default parameters
        this.params = {
            basePath: '',
            subtitle: 'A Site',
            author: 'The Author',
            siteUrl: 'https://example.org',
            currentYear: moment().year()
        }

        // If params.json exists, load it
        const paramsPath = 'params.json'
        if (this.fsExists(paramsPath)) {

            // const paramsJson = JSON.parse(fs.readFileSync(paramsPath, 'utf8'));
            const paramsJson = JSON.parse(readFile(paramsPath));
            params = { ...params, ...paramsJson };
        }
    }

    main() {
        console.log("***  main ***");

        this.initSite('_site', 'static')

        // Load layouts
        const pageLayout = this.readFile('layout/page.html');
        const postLayout = this.readFile('layout/post.html');
        const listLayout = this.readFile('layout/list.html');
        const itemLayout = this.readFile('layout/item.html');
        const feedXml = this.readFile('layout/feed.xml');
        const itemXml = this.readFile('layout/item.xml');

        //        console.log("pageLayout = " + pageLayout)

        // Combine layouts to form final layouts
        const finalPostLayout = this.render(pageLayout, postLayout);
        const finalListLayout = this.render(pageLayout, listLayout);

        /*
        A slug is a string that can only include characters, numbers, dashes, and underscores. It is the part of a URL that identifies a particular page on a website, in a human-friendly form.
        */


        //  makePages(src, dst, templatePath)

        console.log("A")

        // Create site pages
        this.makePages('content/_index.html', path.join(siteDir, 'index.html'), pageLayout, params);



        console.log("B")

        console.log("this.slug = " + this.slug)

        this.makePages('content/[!_]*.html', `_site/${this.slug}/index.html`, pageLayout, params);


        console.log("AAAAAAAAAv")

        console.log('content/[!_]*.html = ' + 'content/[!_]*.html')
        console.log("sluggy = " + `_site/${this.slug}/index.html`)
        //  console.log("pageLayout = " + pageLayout)

        console.log("params = " + params)

        console.log("C")

        // Create blogs
        const blogPosts = this.makePages('content/blog/*.md', `_site/blog/${this.slug}/index.html`, postLayout, { blog: 'blog', ...params });

        console.log("D")

        const newsPosts = this.makePages('content/news/*.html', `_site/news/${this.slug}/index.html`, postLayout, { blog: 'news', ...params });

        console.log("E")
        //////////////
        console.log("--------------blogPosts = " + blogPosts)
        console.log("--------------newsPosts = " + newsPosts)

        // Create blog list pages
        this.makeList(blogPosts, '_site/blog/index.html', listLayout, itemLayout, { blog: 'blog', title: 'Blog', ...params });
        console.log("F")

        this.makeList(newsPosts, '_site/news/index.html', listLayout, itemLayout, { blog: 'news', title: 'News', ...params });
        console.log("G")

        // Create RSS feeds
        this.makeList(blogPosts, '_site/blog/rss.xml', feedXml, itemXml, { blog: 'blog', title: 'Blog', ...params });
        console.log("H")

        this.makeList(newsPosts, '_site/news/rss.xml', feedXml, itemXml, { blog: 'news', title: 'News', ...params });
        console.log("I")
    }

    // Create a new site directory from scratch
    initSite(siteRootDir, staticDir) {
        this.rmDir(siteRootDir)
        this.cpDir(staticDir, siteRootDir)
    }

    // Logs a message with specified arguments
    log(msg, ...args) {
        console.log("*** log ***");

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
    readContent(filename) {
        console.log("*** readContent ***");
        console.log("*** filename = " + filename);

        let text = this.readFile(filename)

        /*
        try {

            text = fs.readFileSync(filename, 'utf8');
        } catch (err) {
            console.error('Error reading file:', err);
            return null;
        }
        */

        // console.log("*** text = " + text);

        // Extract date and slug from filename
        const dateSlug = path.basename(filename).split('.')[0];
        const match = /^(?:(\\d{4}-\\d{2}-\\d{2})-)?(.+)$/.exec(dateSlug);
        const content = {
            date: match[1] || '1970-01-01',
            slug: match[2],
        }

        console.log('stringy \n' + JSON.stringify(content))

        this.slug = content['slug']
        console.log('content[slug] = ' + content['slug'])


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
                text = marked.parse(text);
            } catch (err) {
                this.log('WARNING: Cannot render Markdown in ' + filename + ': ' + err.message);
            }
        }

        //    console.log('content.content =' + content.content)

        // Update the dictionary with content and RFC 2822 date
        content.content = text

        // console.log('content.content =' + content.content)


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

    markdownToHTML(mdText) {
        const htmlContent = marked.parse(mdText)
        return htmlContent
    }

    // this.makePages('content/_index.html', path.join(siteDir, 'index.html'), pageLayout, params);

    makePages(sourceDir, targetDir, templateContent, pageParams) {
        console.log("\n\n*** makePages ***");
        //  console.log("*** templateContent = " + templateContent);
        console.log("*** sourceDir = " + sourceDir);
        console.log("*** targetDir = " + targetDir);

        console.log("*** pageParams = " + JSON.stringify(pageParams));
        // Create destination directory if it doesn't exist
        const sourceFiles = glob.sync(sourceDir);
        let items = []
        console.log("*** sourceFiles = " + JSON.stringify(sourceFiles));

        sourceFiles.forEach(sourceFile => {

            console.log("*** sourceFile = " + sourceFile);

            // Extract the file name without extension
            //    const baseName = path.basename(sourceFile, path.extname(sourceFile));
            console.log("******readContent*******");

            // Read markdown content //  
            const mdContent = this.readContent(sourceFile)
            console.log("******content read*******");

            // Convert markdown to HTML
            const htmlContent = this.markdownToHTML(mdContent.content)
            // Generate the final HTML content
            const finalContent = templateContent.replace('{{ content }}', htmlContent);

            console.log("**********************");
            console.log("*** targetDir = " + targetDir);


            // Write the HTML file to the destination directory // 
            // fsExtra.writeFile(path.join(targetDir, `${baseName}.html`), finalContent);

            // fs.writeFileSync(targetDir, finalContent)
            this.writeFile(targetDir, finalContent)
        })

        // Write a log entry
        /*
        const logEntry = {
            timestamp: moment().format(),
            src,
            dst,
            filesProcessed: sourceFiles.length
        };
         fsExtra.writeFile(path.join(dst, 'log.json'), JSON.stringify(logEntry, null, 2));
    */
    }

    makeList(posts, targetDir, listLayout, itemLayout, params = {}) {
        // Generate list page for a blog.
        let items = [];
        posts.forEach(post => {
            let itemParams = { ...params, ...post };
            itemParams.summary = truncate(post.content);
            let item = render(itemLayout, itemParams);
            items.push(item);
        });

        params.content = items.join('');
        let dstPath = render(targetDir, params);
        let output = render(listLayout, params);

        console.log(`Rendering list => ${dstPath} ...`);
        // fs.writeFileSync(dstPath, output);
        this.writeFile(dstPath, output)
    }

    ////////////// WRAPPERS AROUND FS
    // Read file 
    readFile(filename) {
        let text = fs.readFileSync(filename, 'utf8');
        return text;
    }

    // Write to file 
    writeFile(filename, text) {
        fs.writeFileSync(filename, text)
    }

    rmDir(dir) {
        if (fs.existsSync(dir)) {
            fs.rmSync(dir, { recursive: true })
        }
    }

    cpDir(sourceDir, targetDir) {
        fs.cpSync(sourceDir, targetDir, { recursive: true })
    }

    fsExists(path) {
        return fs.existsSync(path)
    }


    ensureDir(dir) {
        fsExtra.ensureDir(dir);
    }
    ////////////// END WRAPPERS AROUND FS
}

module.exports = StaticSiteGenerator;
