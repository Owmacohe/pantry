// The 1.5D list of the tags associated with each article
// (index 0 = the names of each tag)
// (indexes 1+ = the names of the articles that are tagged with this tag (remember to subtract 1 to match with the first index))
let tags = [[]];

// The names of the private tags in the wiki
let private_tags = [];

/// Returns the index of the tag / article name in the tag list
function get_tag_index(tag) {
    for (let i = 0; i < tags[0].length; i++)
        if (tags[0][i] === tag)
            return i;

    return -1;
}

/// Returns the number of tags for a given article
function get_tagged_length(tag) {
    let index = get_tag_index(tag);
    return index >= 0 ? tags[index + 1].length : -1;
}

/// Returns a sequence of HTML-formatted buttons that are tagged with the given tag
function get_associated_from_tag(tag) {
    let lst = '';
    let index = get_tag_index(tag);

    for (let i = 0; i < get_tagged_length(tag); i++)
        if (!is_tag_private(tags[index + 1][i])) // making sure the tags to display aren't private ones
            lst += '<button onclick="set_current_article(this)">' + tags[index + 1][i] + '</button>';

    return lst;
}

/// Creates a dynamic list based on unions and differences of various tags' articles
function get_list_from_tags(tag_list) {
    // All the tags that we want to include articles from
    let good = tag_list[0].split(',');

    // All the tags that we want to exclude articles from
    let bad = (tag_list.length === 2) ? tag_list[1].split(',') : [];

    // The current list of articles that may make the cut
    let valid_articles = [];

    // The tag index of the tag that's articles we're currently checking through
    let index = get_tag_index(good[0]);

    // Creating the initial valid setup from the first good tag
    for (let i = 0; i < get_tagged_length(good[0]); i++)
        valid_articles.push(tags[index + 1][i]);

    for (let j = 0; j < valid_articles.length; j++) {
        let is_tag_private = false;

        if (!is_wiki_private)
            for (let prv = 0; prv < private_tags.length; prv++)
                if (tags[get_tag_index(private_tags[prv]) + 1].includes(valid_articles[j]) ||
                    private_tags[prv] === valid_articles[j])
                    is_tag_private = true;

        // Making the element null if it's private
        if (!is_wiki_private && is_tag_private)
            valid_articles[j] = 'null';
        else {
            // Making sure each element is contained within each other 'good' tag
            for (let k = 1; k < good.length; k++) {
                index = get_tag_index(good[k]);

                if (index < 0 || !tags[index + 1].includes(valid_articles[j])) {
                    valid_articles[j] = 'null';
                    break;
                }
            }

            // Making sure each element isn't contained within each 'bad' tag
            for (let l = 0; l < bad.length; l++) {
                index = get_tag_index(bad[l]);

                if (index >= 0 && tags[index + 1].includes(valid_articles[j])) {
                    valid_articles[j] = 'null';
                    break;
                }
            }
        }
    }

    let lst = '';

    // Creating a sequence of buttons in list elements to go inside the list
    for (let m = 0; m < valid_articles.length; m++)
        if (valid_articles[m] !== 'null')
            lst += '<li><button onclick="set_current_article(this)">' + valid_articles[m] + '</button></li>';

    return '<ul>' + lst + '</ul>'; // Returning the final list
}

/// Intermediary function to read the text from an article add add it to the tags list
function set_tags(file_name) {
    fetch('articles/' + file_name + '.md')
        .then((res) => res.text())
        .then((text) => {
            process_tags(file_name, text);
        });
}

/// Function to add a tag and its tagged articles to the tags list
function process_tags(file_name, text) {
    let split = trim_array(text.split('\n'));

    if (split.length > 1) {
        let line = split[2];
        let index = find_next_index_of(line, 0, '}');

        // Making sure the article does actually have a list of tags
        if (line[0] === '{' && index >= 0) {
            // The list of article tags
            let tagsList = line.substring(1, index).split(',');

            for (let i = 0; i < tagsList.length; i++) {
                if (tagsList[0] !== '') {
                    // Adding the tag to the first index, then adding a new empty list
                    // so that future articles that are tagged with it can go there
                    if (!tags[0].includes(tagsList[i])) {
                        tags[0].push(tagsList[i]);
                        tags.push([]);
                    }

                    // Adding the article to the tags' lists of tagged articles
                    tags[tags[0].indexOf(tagsList[i]) + 1].push(file_name);
                }
            }
        }
    }
}