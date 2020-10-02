Qutebrowser doesn't have proper behavior:

* https://github.com/qutebrowser/qutebrowser/issues/3238#issuecomment-702810835
* https://github.com/qutebrowser/qutebrowser/issues/5665
* https://github.com/qutebrowser/qutebrowser/issues/5763

runs every nth time a page is loaded from that origin (because of QB)

create symbolic link in your browser's Greasemonkey scripts folder to
`human_powered.user.js`

run web server from this folder:
```bash
python3 -m http.server 6771 &
```

