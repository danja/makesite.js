
import pytest
from makesite import fread

def test_fread():
    # Testing fread function with a sample text file
    test_file = 'test.txt'
    expected_content = 'Hello, world!'
    with open(test_file, 'w') as f:
        f.write(expected_content)
    
    assert fread(test_file) == expected_content

from makesite import fwrite, log, truncate, read_headers, rfc_2822_format, read_content, render, make_pages, make_list, main
import os

def test_fwrite():
    # Testing fwrite function
    test_file = 'test_write.txt'
    content = 'Test fwrite'
    fwrite(test_file, content)
    assert os.path.exists(test_file)
    with open(test_file, 'r') as f:
        assert f.read() == content

def test_log():
    # Testing log function
    # This function does not return anything, so we'll just test that it doesn't raise an exception
    log('Test log message')

def test_truncate():
    # Testing truncate function
    text = 'Hello world! This is a test.'
    truncated = truncate(text, 2)
    assert truncated == 'Hello world!'

def test_read_headers():
    # Testing read_headers function
    # This requires a more complex setup, skipping for now

def test_rfc_2822_format():
    # Testing rfc_2822_format function
    # This requires understanding the expected format, skipping for now

def test_read_content():
    # Testing read_content function
    # This requires a more complex setup, skipping for now

def test_render():
    # Testing render function
    # This requires a more complex setup, skipping for now

def test_make_pages():
    # Testing make_pages function
    # This requires a more complex setup, skipping for now

def test_make_list():
    # Testing make_list function
    # This requires a more complex setup, skipping for now

def test_main():
    # Testing main function
    # This function is the main entry point of the script and likely requires a full environment setup, skipping for now

def test_read_headers():
    # Testing read_headers function with a sample header text
    test_header_text = '<!-- title: Test Title -->\n<!-- date: 2021-01-01 -->\nContent here'
    expected_headers = {'title': 'Test Title', 'date': '2021-01-01'}
    headers = read_headers(test_header_text)
    assert headers == expected_headers

def test_rfc_2822_format():
    # Testing rfc_2822_format function with a sample date
    test_date = datetime.datetime(2021, 1, 1, 12, 0)
    formatted_date = rfc_2822_format(test_date)
    # RFC 2822 date format example: 'Fri, 01 Jan 2021 12:00:00 +0000'
    assert formatted_date.startswith('Fri, 01 Jan 2021 12:00:00')

def test_read_content():
    # Testing read_content function with a sample content file
    test_content_file = 'content/test.md'
    os.makedirs(os.path.dirname(test_content_file), exist_ok=True)
    with open(test_content_file, 'w') as f:
        f.write('<!-- title: Test Title -->\n<!-- date: 2021-01-01 -->\nContent here')

    content = read_content(test_content_file)
    assert 'title' in content and content['title'] == 'Test Title'
    assert 'date' in content and content['date'] == '2021-01-01'
    assert 'body' in content and content['body'] == 'Content here'

def test_render():
    # Testing render function with a sample template and content
    template_content = '<html><body>{{ content }}</body></html>'
    template_file = 'layout/template.html'
    os.makedirs(os.path.dirname(template_file), exist_ok=True)
    with open(template_file, 'w') as f:
        f.write(template_content)

    content = 'Hello, world!'
    rendered_content = render(template_file, content=content)
    assert rendered_content == '<html><body>Hello, world!</body></html>'

def test_make_pages():
    # Testing make_pages function
    # Preparing a sample environment with content and layout
    content_file = 'content/test_page.md'
    layout_file = 'layout/page.html'
    os.makedirs(os.path.dirname(content_file), exist_ok=True)
    os.makedirs(os.path.dirname(layout_file), exist_ok=True)

    with open(content_file, 'w') as f:
        f.write('<!-- title: Test Page -->\n<!-- date: 2021-01-01 -->\nPage content here')

    with open(layout_file, 'w') as f:
        f.write('<html><head><title>{{ title }}</title></head><body>{{ body }}</body></html>')

    # Running make_pages to create a page
    make_pages('content', 'layout/page.html', 'output')

    # Checking if the output file exists and contains the expected content
    output_file = 'output/test_page.html'
    assert os.path.exists(output_file)
    with open(output_file, 'r') as f:
        content = f.read()
        assert '<title>Test Page</title>' in content
        assert 'Page content here' in content

def test_make_list():
    # Testing make_list function
    # Preparing a sample environment with multiple content files
    content_files = ['content/test_page1.md', 'content/test_page2.md']
    os.makedirs(os.path.dirname(content_files[0]), exist_ok=True)

    for file in content_files:
        with open(file, 'w') as f:
            f.write('<!-- title: Test Title -->\n<!-- date: 2021-01-01 -->\nContent here')

    layout_file = 'layout/list.html'
    os.makedirs(os.path.dirname(layout_file), exist_ok=True)
    with open(layout_file, 'w') as f:
        f.write('<html><body>{{ items }}</body></html>')

    # Running make_list to create a list page
    make_list('content', 'layout/list.html', 'output/list.html')

    # Checking if the output list file exists and contains the expected content
    output_file = 'output/list.html'
    assert os.path.exists(output_file)
    with open(output_file, 'r') as f:
        content = f.read()
        assert 'Test Title' in content  # Checking if the title appears in the list

def test_main(monkeypatch):
    # Testing main function
    # This will simulate running the entire script
    # Setting up a mock environment
    monkeypatch.setattr('sys.argv', ['makesite.py', 'content', 'layout', 'output'])

    # Running the main function
    main()

    # Checking if the expected output files are created
    # This is a basic check and may need to be expanded based on the script's functionality
    assert os.path.exists('output/index.html')
    assert os.path.exists('output/list.html')
