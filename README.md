***WARNING:*** **Pantry** is currently experiencing issues with loading scripts in certain environments. It appears to work fine within certain IDE frameworks, but fails to load properly when opened raw. Very annoying. I'll be addressing this issue as soon as I can.

# Pantry
*A tag-based wiki system inspired by [TiddlyWiki](https://tiddlywiki.com)*

## Setup

1. Install and extract the repository
2. Navigate to the `settings.txt` file. After the colon on each line, fill in the following:
   1. The title of the wiki
   2. The name of the creator
   3. The date(s) of creation of the wiki
   4. The name of the default 'splash page' article
   5. Whether this wiki is in private mode *(set to `false` if you have no private articles/tags)*
   6. The names of the private tags used to exclude sensitive articles from the public mode *(leave empty if you have no private articles/tags)*

*e.g.*
```
title:WikiTitle
creator:Your Name
date:2023
default:Introduction
private:false
private_tags:private,todo
```

3. Navigate to the `registry.txt` file, and write the names of each article in your wiki (not including the file extension) on a separate new line

*e.g.*
```
article1
article2
article3
...
```

## Usage

Before writing any articles, create a folder named `articles`, and place it in the root directory here. Place any article files you write inside this folder (make sure to write their names in the `registry.txt` file!). Articles are written in a modified form of [Markdown](https://www.markdownguide.org). Here are the rules for writing articles:

- **Naming**
   - Articles are saved as `.md` files, with the name of the file corresponding to the title of the article
   - Slashes (`/`) and colons (`:`) aren't permitted in titles of articles. Use either underscores (`_`) are spaces to represent these characters *(other special characters in file names may also break the wiki)*
- **Header**
   - The first line should be a level 1 header of the name of the article
   - The third line should be a list of the tags of the article, separated by commas and wrapped in curly braces (`{}`) *(these tags represent the 'groups' of articles that the article may pertain to)*
- **Body**
   - Plain text should be written as-is
   - Line breaks / new lines will be preserved
   - Write `---` in a new line to add a **horizontal rule**
   - Write `> ` before any line to turn it into a **quote block** *(quotes can be multi-line)* *(see quote example below)*
   - Write `- ` or `1. ` before any line to write **unordered** or **ordered list**s (respectively) *(see list example below)*
      - Multi-hierarchy lists can be written in a similar fashion by including three spaces before the list marker *(see list example below)*
   - Write any number of `#`s and a space before any line to turn it into a **header** of that respective level *(e.g. `## Header2`)*
   - Write `^` before and after any link/path to an image in a new line to insert an **image** *(can be a local or external image)* *(e.g. `^path/to/image/img.jpg^`)*
   - Write `%` before and after any list of comma-separated article names / tags in a new line to insert an **automatic list** of articles tagged with those tags *(write `|` after the list and another comma-separated list to *exclude* those tags from the automatic list)* *(e.g. `%important,research|private,todo%`)*
   - Write `*` before and after text to make it **italic**, and `**` for **bold** *(these can be combined for bold-italic)*
   - Write `~~` before and after any text to make it **strikethrough**
   - Write square brackets (`[]`) around any article name / tag to turn it into a clickable **button** *(you can write `|` before the end bracket followed by a display name for the button)* *(e.g. `[Display Name|article1]`)*
   - Write square brackets (`[]`) followed immediately by normal brackets (`()`) to insert a **link** *(the display name for the link should go in the square brackets, and the link should go in the normal brackets)* *(can be a local or external link)* *(e.g. `[Display Name|path/to/webpage/index.html]`)*

Your wiki is now ready to go! Simply open the `pantry` folder or the `index.html` file in a web browser of your choice to view it in action. As **Pantry** is a web-built system, it can also be hosted on a website, and viewed publicly (just remember to set the `private` field in `settings.txt` to `false` before you publish it, if you have any private tags).

## Quote example

```
> Line 1
>
> Line 2
> Line 3
> 
> Line 5
> 
> Line 7
```

## List example

```
1. Element 1
   - Sub-element 1.1
   - Sub-element 1.2
      - Sub-sub-element 1.2.1
      - Sub-sub-element 1.2.2
   - Sub-element 1.3
2. Element 2
   1. Sub-element 2.1
   2. Sub-element 2.2
3. Element 3
```

## Colour customization

Wiki colours can be customized. Simply change the hex values of the various CSS `:root` variables in the `style.css` file, in the `scripts` folder. Various other CSS elements can of course also be changed in the same file.
