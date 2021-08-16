# **iren-dyn-form**
Dynamic html form from json

# Clean splitted json file and output files
Remove all files inside ./config/json_split a ./output

**npm run clean-output**


# build all: 
Create json splitted in config/json_split and html files in output/

**npm run all-json-html**

# Build json splitted
From a single source file (eg: config/default.json) creates multiple json files. Output is in config/json_split.

**npm run split-json**

# Create html composed 
From multiple json files creted by **json-split** creates multiple html files. Output is in output/

**npm run html-builder**

# Create a main html from a single default file.
From a single source file (eg: config/default.json) creates a single html file, it contains all cards. Output is in output/.

**npm run html-main**