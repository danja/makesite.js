node --trace-warnings ms.js

        make_pages('content/[!_]*.html', '_site/{{ slug }}/index.html',
            page_layout, ** params)

                   # Create blogs.
            blog_posts = make_pages('content/blog/*.md',
                '_site/blog/{{ slug }}/index.html',
                post_layout, blog = 'blog', ** params)
        news_posts = make_pages('content/news/*.html',
            '_site/news/{{ slug }}/index.html',
            post_layout, blog = 'news', ** params)

                   # Create blog list pages.
            make_list(blog_posts, '_site/blog/index.html',
                list_layout, item_layout, blog = 'blog', title = 'Blog', ** params)
        make_list(news_posts, '_site/news/index.html',
            list_layout, item_layout, blog = 'news', title = 'News', ** params)

                   # Create RSS feeds.
            make_list(blog_posts, '_site/blog/rss.xml',
                feed_xml, item_xml, blog = 'blog', title = 'Blog', ** params)
        make_list(news_posts, '_site/news/rss.xml',
            feed_xml, item_xml, blog = 'news', title = 'News', ** params)
