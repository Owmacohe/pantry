// The list of all names of articles
let file_list = [];

// Whether this wiki is in private mode
let is_wiki_private = false;

// The article to load by default
let default_article = '';

// Variable to let other scripts know that the initial page has been loaded
let loaded = false;

window.onload = function() {
    reset_search();
    setup();

    // Setting the list of tags (see tags.js) (after waiting for the setup)
    setTimeout(function() {
        file_list.forEach(set_tags);
    }, 2000);

    // Making sure to wait for the tag loading to be done
    setTimeout(function() {
        // Setting the wiki stats
        document.getElementById('creator').innerText +=
            ' (' + file_list.length + ' articles, ' + tags[0].length + ' tags)';

        document.getElementById('loading').remove(); // Removing the loading message

        go_home();

        loaded = true;
    }, 4000);
}

/// Resets the article to the splash page
function go_home() { set_current_article(default_article, false); }

/// Gets data from the settings and registry files to initialize variables
function setup() {
    fetch('settings.txt')
        .then((res) => res.text())
        .then((text) => {
            let split = text.split('\n');
            let title = split[0].split(':')[1];

            // Setting the wiki title
            document.title = title;
            document.getElementById('title').innerText = title;

            // Setting the creator name, dates of creation, and public/private status
            document.getElementById('creator').innerText =
                split[1].split(':')[1] + ', ' + split[2].split(':')[1] +
                ' (' + ((split[4].split(':')[1] === 'true') ? 'private' : 'public') + ' version)';

            // Initializing various other variables
            default_article = split[3].split(':')[1];
            is_wiki_private = split[4].split(':')[1] === 'true';
            private_tags = split[5].split(':')[1].split(',');
        });

    // Setting the file list
    fetch('registry.txt')
        .then((res) => res.text())
        .then((text) => {
            file_list = text.split('\n');

            for (let i = 0; i < file_list.length; i++)
                if (file_list[i] === '')
                    file_list.splice(i, 1);
        });
}

// The list of most recently visited articles
let list_contents = [];

/// Adds an article to the list of most recently visited ones
function add_to_list(file_name) {
    // Making sure to exclude ones already in the list
    if (!list_contents.includes(file_name)) {
        // Creating a new button
        let item = document.createElement('button');
        item.setAttribute('onclick', 'set_current_article(this)');
        document.getElementById('list').appendChild(item);

        item.innerText = file_name; // Setting the button text

        list_contents.push(file_name); // Adding it to the checking list

        // Making sure to remove the oldest article in the list
        if (list_contents.length > 5) {
            document.getElementById('list').children[1].remove();
            list_contents.splice(0, 1);
        }
    }
}

/// Sets the current article of the wiki
// (is_button = whether this method is being called from an HTML button)
function set_current_article(button, is_button = true) {
    // Getting the name of the article to set
    let file_name = is_button ? (button.id === '' ? button.innerHTML : button.id) : button;

    if (!is_tag_private(file_name)) {
        // Clearing the current article
        let temp = document.getElementById('current_article').children;
        if (temp.length > 0) temp[0].remove();

        add_to_list(file_name); // Adding the new article to the recent list
        get_text(file_name); // Starting the process of parsing the article
    }
}

/// Intermediary function to get the content of the article and pass it along to the parsing function
function get_text(file_name) {
    fetch('articles/' + file_name + '.md')
        .then((res) => res.text())
        .then((text) => {
            process_text(text, file_name);
        });
}

// The description element of the article
let description = null;

// The description's temporary HTML content
// (transferred to the element at the end so that Javascript doesn't automatically complete the ends of tags)
let description_html = '';

/// Creates a new article, setting its fields and such
function process_text(text, title) {
    // Returning if the article can't be found
    if (text === '<!doctype html><title>404 Not Found</title><h1 style="text-align: center">404 Not Found</h1>')
        return;

    // Creating the article parent
    let article = document.createElement('div');
    article.setAttribute('class', 'flexcolumn article');
    document.getElementById('current_article').appendChild(article);

    // Creating the top bar which houses the article's tags
    let top_bar = document.createElement('div');
    top_bar.setAttribute('class', 'flexrow topbar');
    article.appendChild(top_bar);

    // Creating the tags parent
    let article_tags = document.createElement('div');
    article_tags.setAttribute('class', 'flexrow tags');
    top_bar.appendChild(article_tags);

    // Creating the description element
    description = document.createElement('div');
    description.setAttribute('class', 'description');

    // Initializing the 'associated' elements
    let associated_parent = null;
    let associated = null;

    // Getting an HTML-formatted button sequence of all the associated articles for the current article
    let lst = get_associated_from_tag(title);

    if (lst.length > 0) {
        // Creating the parent of the associated list
        associated_parent = document.createElement('div');
        associated_parent.setAttribute('class', 'flexcolumn associated_parent');
        article.appendChild(associated_parent);

        associated_parent.innerHTML = '<h3>Associated (' + get_tagged_length(title) + '):</h3>';

        // Creating the associated element
        associated = document.createElement('div');
        associated.setAttribute('class', 'flexrow associated');
        associated.setAttribute('style', 'justify-content: end; align-items: center; flex-wrap: wrap;');
        associated_parent.appendChild(associated);

        associated.innerHTML = lst; // Putting the previously created list inside of it
    }

    // Making sure to add the description element to the article only after the associated section has been
    article.appendChild(description);
    description_html = '';

    // Split the file into its lines
    let split = text.split('\n');

    for (let i = 0; i < split.length; i++) {
        if (i >= 4) {
            // If there is no more content after the title and tags, the article ends
            if (is_text_empty(text)) break;
            // Otherwise, the line is analysed
            else check_and_add(split[i], i === split.length - 1);
        }
        // Getting the title of the article
        else if (i === 0) {
            let title = document.createElement('h1');
            title.innerHTML = split[i].substring(2);

            top_bar.insertBefore(title, top_bar.firstChild);
        }
        // Getting the tags of the article
        else if (i === 2) {
            let tagsList = split[i]
                .substring(1, find_next_index_of(split[i], 0, '}'))
                .split(',');

            // Checking through the tags, making sure they're not private
            if (tagsList[0] !== '') {
                article_tags.innerHTML += '<h3>Tags (' + tagsList.length + '):</h3>';

                for (let j = 0; j < tagsList.length; j++)
                    if (!is_tag_private(tagsList[j]))
                        article_tags.innerHTML += '<button onclick="set_current_article(this)">' + tagsList[j] + '</button>';
            }
            // If there are no tags, the tags HTML element gets removed
            else article_tags.remove();
        }
    }

    reset(); // resetting all the HTML closing tags and such

    // Making the article have 2 columns if it's too long
    if (text.length >= 1000)  description.style.columnCount = '2';

    // The number of non-invisible characters in the article description
    let character_length = 0;

    for (let character_index = 0; character_index < description.innerText.length; character_index++)
        if (description.innerText[character_index] === ' ' || description.innerText[character_index].trim() !== '')
            character_length++;

    // Appending a count of characters in the article
    description.innerHTML += '<div class="flexrow" id="character_count">' + character_length + ' characters</div>';

    // Adding scroll reminders after a few seconds to make sure images have loaded in properly
    // (the main body won't ever scroll, but I've left the line commented out in case it becomes scrollable in the future)
    setTimeout(() => {
        //add_scroll_reminder(article, description);
        if (lst.length > 0) add_scroll_reminder(associated_parent, associated);
    }, 1000);
}

// The current indentation level of the current list
let list_level = 0;

// The sequence of nested lists going up
// (0 for unordered, 1 for ordered)
let list_order = '';

// Whether the current line is part of a quote
let is_quote = false;

/// Checks each line of the article file as it comes in, and parses it into HTML for the description element
function check_and_add(line, is_last) {
    // Whether to add a line break at the end of this line
    let ignore_break = false;

    // Resetting the temporary HTML text if the contents are not being preserved because of a list or quote
    if (list_level === 0 && !is_quote) description_html = '';

    // Skipping the parsing if the line is empty
    if (line !== '') {
        // Checking for horizontal rules
        if (line === '---') {
            description_html += '<hr>';
            ignore_break = true;
        }
        else {
            // The starting index for the loop that will check through the contents of the line
            let i = 0;

            // If the line is part of a quote...
            if (line.substring(0, 2) === '> ') {
                i = 2; // Skipping ahead

                // Starting the quote tag
                if (!is_quote) {
                    description_html += '<div class="quote">';
                    is_quote = true;
                }
            }
            // If the line is part of a quote, but has no content...
            else if (line[0] === '>' && is_quote) {
                i = 1; // Skipping ahead
            }
            // Otherwise, it stops being a quote
            else {
                // Ending the quote tag
                if (!is_last && is_quote) {
                    description_html += '</div>';
                    is_quote = false;
                }
            }

            // The list indentation level for this particular line (0 = not a list)
            let current_list_level = 0;

            // Whether this line is an ordered list
            let is_current_ordered = false;

            // The number of blank spaces before the list element
            let indent_count = 0;

            for (let j = 0; j < line.length; j++) {
                if (line[j] === ' ') indent_count++; // Upping the count for each blank space
                // As soon as something that isn't a blank space is found...
                else {
                    // The characters that mark the start of a list element
                    let indicator = line.substring(j, j+2);

                    // Whether this list element is ordered
                    let is_ordered = (indicator[0] >= 0 && indicator[0] <= 9 && indicator[1] === '.');

                    is_current_ordered = is_ordered;

                    // If this is a list, whether ordered or not...
                    if ((j === 0 || indent_count > 0) && (indicator === '- ' || is_ordered)) {
                        current_list_level = (indent_count / 3) + 1; // Setting the indentation level
                        i = indent_count + 2; // Jumping ahead
                    }

                    // TODO: above should check for ordered list elements that have numbers greater than 9

                    break; // Breaking no matter what
                }
            }

            // If his line's list level is greater than the current...
            if (list_level < current_list_level) {
                // Catching up if this list is starting at a high level for some reason
                for (let k = 0; k < current_list_level - list_level - 1; k++) {
                    description_html += '<ul>';
                    list_order += '0';
                }

                // Adding a new list start tag
                description_html += is_current_ordered ? '<ol>' : '<ul>';
                list_order += is_current_ordered ? '1' : '0';
            }
            // If his line's list level is less than the current...
            else if (list_level > current_list_level) {
                // Closing all the list tags as they go down
                for (let k = 0; k < list_level - current_list_level; k++) {
                    description_html += (list_order[list_order.length - 1] === '1') ? '</ol>' : '</ul>';
                    list_order = list_order.substring(0, list_order.length - 1);
                }
            }

            // Manually setting the list level now
            list_level = current_list_level;

            if (list_level > 0) description_html += '<li>'; // Don't forget to actually start the list element!

            // The current header level (0 = plain text)
            let header_level = 0;

            // If this line is a header...
            if (line[0] === '#') {
                // Counting the number of pound signs
                for (let header_index = 0; header_index < line.length; header_index++) {
                    if (line[header_index] === '#') header_level++;
                    else break;
                }

                description_html += '<h' + header_level + '>'; // Starting the header tag
            }

            // If the line has the image syntax, insert an img tag
            if (is_wrapped_in_character(line, '^'))
                description_html += '<img src="' + line.substring(1, line.length - 1) + '">';
            // If the line has the automatic list syntax, insert one
            else if (is_wrapped_in_character(line, '%')) {
                description_html += get_list_from_tags(line.substring(1, line.length - 1).split('|'));
                ignore_break = true;
            }
            // Otherwise, it's probably formatted plaintext...
            else {
                // The current level of bold and/or italic formatting (1 = italic, 2 = bold, 3 = bold-italic)
                let bold_italic_level = 0;

                // The highest bold/italic level reached before regular text started
                let highest_level = 0;

                // Whether the text is to be formatted for bold/italic
                let is_bold_italic = false;

                // Whether the text is struck through with a line
                let is_strikethrough = false;

                // Whether the text is a button to another article
                let is_button = false;

                // Whether the text is a web link
                let is_link = false;

                // Checking through each character of the line
                while (i < line.length) {
                    // If there are two repeated quotations for some reason, skip one
                    if (line.substring(i, i+2) === '""') { }
                    // Checking for bold/italic...
                    else if (line[i] === '*') {
                        // Increasing if we haven't reached the text yet, decreasing if we have
                        bold_italic_level += is_bold_italic ? -1 : 1;

                        if (bold_italic_level > highest_level)
                            highest_level = bold_italic_level;

                        // Starting the appropriate tag(s)
                        if (bold_italic_level > 0 && line[i+1] !== '*') {
                            is_bold_italic = true;

                            switch (bold_italic_level) {
                                case 1:
                                    description_html += '<i>';
                                    break;
                                case 2:
                                    description_html += '<b>';
                                    break;
                                case 3:
                                    description_html += '<b><i>';
                                    break;
                            }

                            // TODO: bold and italic only work together when they envelop the same text entirely...
                        }

                        // Closing the appropriate tag(s)
                        if (bold_italic_level <= 0 && is_bold_italic) {
                            is_bold_italic = false;

                            switch (highest_level) {
                                case 1:
                                    description_html += '</i>';
                                    break;
                                case 2:
                                    description_html += '</b>';
                                    break;
                                case 3:
                                    description_html += '</b></i>';
                                    break;
                            }

                            highest_level = 0;
                        }
                    }
                    // Checking for strikethrough...
                    else if (line.substring(i, i+2) === '~~') {
                        i++;
                        description_html += is_strikethrough ? '</s>' : '<s>';
                    }
                    // Checking for openings of buttons or links' display text...
                    else if (line[i] === '[') {
                        let next_index = find_next_index_of(line, i, ']');
                        let inner = line.substring(i+1, next_index);

                        if (line[next_index + 1] !== '(') {
                            is_button = true;

                            let inner_split = inner.split('|');

                            description_html +=
                                '<button onclick="set_current_article(this)" id="' +
                                inner_split[inner_split.length > 1 ? 1 : 0] + '">' +
                                inner_split[0];
                        }
                        else {
                            is_link = true;

                            description_html +=
                                '<a href="' +
                                line.substring(next_index + 2, find_next_index_of(line, i, ')')) +
                                '" target="_blank" rel="noopener noreferrer">';
                        }
                    }
                    // Checking for closings of buttons...
                    else if (line[i] === ']' && is_button) {
                        description_html += '</button>';

                        is_button = false;
                    }
                    else if (line[i] === ']' && is_link) { } // Shipping the character if it's a link closing
                    // Checking for openings of links' URLS...
                    else if (line[i] === '(' && is_link) {
                        i = find_next_index_of(line, i, ')') - 1;
                    }
                    // Checking for closings of links' URLS...
                    else if (line[i] === ')' && is_link) {
                        description_html += '</a>';

                        is_link = false;
                    }
                    // FINALLY, if it's just regular old plain text, it goes through
                    else {
                        if (i >= header_level && !is_button) description_html += line[i];
                    }

                    i++; // Increasing the index in the line
                }
            }

            if (header_level > 0) description_html += '</h' + header_level + '>'; // Closing the header
            if (header_level > 0) ignore_break = true; // Making sure not to add line breaks after headers

            if (list_level > 0) description_html += '</li>'; // Closing the list element

            // Closing the quote
            if (is_quote) {
                if (is_last) {
                    description_html += '</div>';
                    is_quote = false;
                }
                else {
                    description_html += '<br>';
                }
            }
        }
    }
    else reset(); // Making sure to reset the line endings if the line is empty

    // Adding the text (and probably a linebreak) to the description element if it's not currently a list or a quote
    if ((list_level === 0 || is_last) && !is_quote)
        description.innerHTML += description_html + (ignore_break ? '' : '<br>');
}

/// Ending the multi-line checking variables and closing off the description div
function reset() {
    list_level = 0;
    list_order = '';

    description_html += '</div>';
    is_quote = false;
}

/// Whether the given line both starts and ends with the given character
function is_wrapped_in_character(line, character) {
    return line[0] === character && line[line.length - 1] === character;
}

/// Function to check and see if an element has exceeded its scroll height, and adds a reminder if so
function add_scroll_reminder(parent, checking) {
    if (checking.scrollHeight > checking.clientHeight) {
        let overflow_reminder = document.createElement('div');
        overflow_reminder.setAttribute('id', 'overflow');
        parent.appendChild(overflow_reminder);

        overflow_reminder.innerHTML = '⇣ scroll for more ⇣';
    }
}