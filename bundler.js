const RoshBundler = require("rosh-bundler").RoshBundler;

// instantiate the bundler
let bundler = new RoshBundler();

bundler.add_css_lib("style.scss", "style.css");
bundler.add_js_lib("js/*.js", "script.js");
bundler.add_html_page("index.html");
bundler.add_copy("Chart.min.js");
// run the bundler
bundler.run();
