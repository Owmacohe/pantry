/// Function to loop forward through a string, starting at some index, looking for the index of a given character
function find_next_index_of(line, current_index, symbol) {
    for (let i = current_index + 1; i < line.length; i++)
        if (line[i] === symbol) return i;

    return -1;
}

/// Function to loop backward through a string, starting at some index, looking for the index of a given character
function find_previous_index_of(line, current_index, symbol) {
    for (let i = current_index - 1; i > -1; i--)
        if (line[i] === symbol) return i;

    return -1;
}

/// Clears the text of the search field
function reset_search() {
    document.getElementById('search').children[1].value = '';
}

/// Function called when searching for an article to display
function search(event, input) {
    if (event.keyCode === 13 && loaded) {
        // The name of the article that was found for the search
        let name = get_search(input.value);

        if (name !== null) {
            set_current_article(name, false);
            reset_search();
        }
    }
}

/// Function to search through the list of articles and find one with the given name
function get_search(name) {
    name = name.trim();

    if (name === '') return null; // Stopping the search if the value is just all whitespace

    for (let i = 0; i < file_list.length; i++)
        // Checking to see if any article names contain the search value
        if (file_list[i].toLowerCase().includes(name.toLowerCase()))
            // Making sure the found article isn't private
            if (!is_tag_private(file_list[i]))
                return file_list[i];

    return null;
}

/// Checks whether an entire article is empty (after the title and tags)
function is_text_empty(text) {
    let split = text.split('\n');

    for (let i = 4; i < split.length; i++)
        if (split[i] !== '')
            return false;

    return true;
}

/// Function to check and see if the given article is tagged with a private tag
function is_tag_private(file_name) {
    if (!is_wiki_private)
        for (let i = 0; i < private_tags.length; i++)
            if (tags[get_tag_index(private_tags[i]) + 1].includes(file_name))
                return true;

    return false;
}

/// Quick function to make sure each element in an array is trimmed down to remove the whitespace
function trim_array(array) {
    for (let i = 0; i < array.length; i++) {
        array[i] = array[i].trim();
    }

    return array;
}