# Info passaggi: esempio in test

- Edita il file `config\build\build-config.json` e inserisci `"environment": "test"`
- Edita il relativo file di configurazione json: `config\default_test.json`
- Se hai modificato una scheda che ha dei duplicati, per esempio '**scomparti**', </br>
  splitta le schede: `npm run split-json` le metterà in `config/json_split/` </br>
  Fai generare i duplicati con: `node .\customization_project\SchedaRaccDati\duplicate-card.js` </br>
  questo duplicherà: </br>
  `config/json_split/scomparti.json` e metterà l'output in: </br>
  `customization_project\SchedaRaccDati\duplicate_card_out\` </br>
  Copia 'a mano' il contenuto e incollalo ritornando su `config\default_test.json`

- Esegui `npm run build-all` che dal `config\default_test.json` costruirà in `/output` tutti gli html
- Se esegui `npm run build` pulisce e rifà gli split.
- Ora metti aggiungiamo il codice extra (Il menu): `npm run extra-scheda-racc-dati`.

- avvio server test

```bash
node .\server4test\server-express.js
```
