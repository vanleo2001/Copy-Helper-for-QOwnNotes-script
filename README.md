# Copy-Helper-for-QOwnNotes

A Greasemonkey user script to help me convert selected HTML to markdown for next using in QOwnNotes.

It will convert all html tags to markdown except <img> tag. <img> tag will be converted in QOwnNotes and Images will download into local "media" folder. 

When use copy function in firefox, some line breaks will be auto inserted into html source in clipboard. If it is converted to markdown when using "paste html and media" function in QOwnNotes, these line breaks will also save. So I write a script to remove it. This script will romove unnecessary white space also.


## Requirements

* [**Greasemonkey**](https://addons.mozilla.org/en-US/firefox/addon/greasemonkey/) (on Firefox)


## How to Install

* Make sure you have installed the Greasemonkey add-on on your firefox browser.

* [click here](https://github.com/vanleo2001/Copy-Helper-for-QOwnNotes-script/raw/master/Copy-Helper-for-QOwnNotes.user.js) to install.

## How to Use
* Highlight the section of a web page you wish to copy. Right-click, and select "Copy Helper for QOwnNotes". 
* Or press ctrl key and highlight the section of a web page you wish to copy, the text will auto copy.
* Use "Paste html or media" in menu or shortcut "ctrl+shift+v" in QOwnNotes.