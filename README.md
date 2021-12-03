# **iren-dyn-form**

Dynamic html form from json

## Clean splitted json file and output files

Remove all files inside ./config/json_split a ./output

```bash
npm run clean
```

## build

Create json splitted in config/json_split and html files in output/

```bash
npm run build
```

## Build json splitted

From a single source file (eg: config/default_test.json) creates multiple json files. Output is in config/json_split.

```bash
npm run split-json
```

## Create html composed

From multiple json files creted by **json-split** creates multiple html files. Output is in output/

```bash
npm run build-all
```

## Create a main html from a single default file

From a single source file (eg: config/default_test.json) creates a single html file, it contains all cards. Output is in output/.

```bash
npm run build-single
```

## Build extra code for 'Scheda raccolta dati'

```bash
npm run extra-scheda-racc-dati
```
