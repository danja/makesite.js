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
    }

    // Read file 
    readFile(filename) {
        let text = fs.readFileSync(filename, 'utf8');

        /*
        let text;
        try {
    } catch (err) {
        console.error('Error reading file:', err);
        //   return null;
    }
    */
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

    cpDir(src, dst) {
        fs.cpSync(src, dst, { recursive: true })
    }

    ensureDir(dir) {
        fsExtra.ensureDir(dst);
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
    read_content(filename) {
        console.log("*** read_content ***");
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

    makePages(src, dst, templateContent) {
        console.log("*** makePages ***");
        //  console.log("*** templateContent = " + templateContent);
        console.log("*** src = " + src);
        console.log("*** dst = " + dst);

        // Create destination directory if it doesn't exist
        //  fsExtra.ensureDir(dst);

        // console.log("*** path.join(src, '*.md') = " + path.join(src, '*.md'));


        const mdFiles = glob.sync(src);
        //    const mdFiles = glob.sync(path.join(src, '*.md'));

        console.log("*** mdFiles = " + JSON.stringify(mdFiles));

        //// for (const mdFile of mdFiles) {
        mdFiles.forEach(mdFile => {

            console.log("*** mdFile = " + mdFile);
            // Extract the file name without extension
            const baseName = path.basename(mdFile, path.extname(mdFile));
            console.log("******read_content*******");
            // Read markdown content //  
            //   console.log(JSON.stringify(mdFile))

            const mdContent = this.read_content(mdFile) // was 
            console.log("******content read*******");
            // const mdContent = fsExtra.readFile(mdFile, 'utf8');

            // Convert markdown to HTML

            //       const htmlContent =  marked.parse(mdContent)

            const htmlContent = this.markdownToHTML(mdContent.content)
            // Generate the final HTML content
            const finalContent = templateContent.replace('{{ content }}', htmlContent);

            console.log("**********************");
            console.log("*** dst = " + dst);


            // Write the HTML file to the destination directory // 
            // fsExtra.writeFile(path.join(dst, `${baseName}.html`), finalContent);

            // fs.writeFileSync(dst, finalContent)
            this.writeFile(dst, finalContent)
        })

        /*
        // Copy static files (images, CSS, JS) to the destination directory
        const staticSrc = path.join(src, 'static');
        const staticDst = path.join(dst, 'static');

        if (fs.existsSync(staticSrc)) {
            // fsExtra.copy(staticSrc, staticDst, { overwrite: true });
            fs.cpSync(staticSrc, staticDst, { recursive: true, overwrite: true })
        }
*/
        /*
          //  fs.copyFileSync(src, dest[, mode])
        fs.cpSync('static', siteDir, { recursive: true })
        */



        // Write a log entry
        /*
        const logEntry = {
            timestamp: moment().format(),
            src,
            dst,
            filesProcessed: mdFiles.length
        };
         fsExtra.writeFile(path.join(dst, 'log.json'), JSON.stringify(logEntry, null, 2));
    */
    }

    makeList(src, dst) {
        console.log("*** makeList ***");
        if (!src || typeof src !== 'string') {
            throw new Error("Invalid 'src' argument: must be a defined string");
        }
        // Create destination directory if it doesn't exist
        this.ensureDir(dst)

        // fsExtra.ensureDir(dst);

        // List all files in the source directory
        //  const files = ( fs.readdir(src))
        //    .filter(f => fs.statSync(path.join(src, f)).isFile());
        console.log("***** src = " + src)
        console.log("***** dst = " + dst)

        HERERERERERERE

        //   const files = (fs.promises.readdir(src))
        const files = (fs.readdirSync(src))
            .filter(f => {
                probably wrong https://nodejs.org/api/fs.html#class-fsstats
                const stats = fs.promises.stat(path.join(src, f));
                return stats.isFile();
            });

        // Write the list to a JSON file in the destination directory
        fs.writeJson(path.join(dst, 'file_list.json'), files);
    }

    main() {
        console.log("***  main ***");
        // Create a new '_site' directory from scratch
        const siteDir = '_site';


        /*
        if (fs.existsSync(siteDir)) {
            fs.rmSync(siteDir, { recursive: true })
        }
        fs.cpSync('static', siteDir, { recursive: true })
*/

        this.rmDir(siteDir)
        this.cpDir('static', siteDir)

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
        if (fs.existsSync(paramsPath)) {


            //     const paramsJson = fs.readJson(paramsPath);
            //  const paramsJson = require(paramsPath);

            const paramsJson = JSON.parse(fs.readFileSync(paramsPath, 'utf8'));

            params = { ...params, ...paramsJson };
        }

        // Load layouts
        /*
        const pageLayout = fs.promises.readFile('layout/page.html', 'utf8');
        const postLayout = fs.promises.readFile('layout/post.html', 'utf8');
        const listLayout = fs.promises.readFile('layout/list.html', 'utf8');
        const itemLayout = fs.promises.readFile('layout/item.html', 'utf8');
        const feedXml = fs.promises.readFile('layout/feed.xml', 'utf8');
        const itemXml = fs.promises.readFile('layout/item.xml', 'utf8');
*/
        const pageLayout = fs.readFileSync('layout/page.html', 'utf8');
        const postLayout = fs.readFileSync('layout/post.html', 'utf8');
        const listLayout = fs.readFileSync('layout/list.html', 'utf8');
        const itemLayout = fs.readFileSync('layout/item.html', 'utf8');
        const feedXml = fs.readFileSync('layout/feed.xml', 'utf8');
        const itemXml = fs.readFileSync('layout/item.xml', 'utf8');
        console.log("pageLayout = " + pageLayout)

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
}

module.exports = StaticSiteGenerator;
