var ctag = "";                                      // Current URL Hash
var cbtn = document.getElementById('home');         // Current Tab Selected
var cpg = document.getElementById('_home');         // Current Page Displayed
var tab = document.getElementById('tab-wrapper');   // Tab Pointer
      
var viewPage = function (pg) {
    let nbtn = document.getElementById(pg);
    let npg = document.getElementById("_" + pg);
    cpg.setAttribute('style', 'display: none;');
    npg.setAttribute('style', 'display: block;');
    cbtn.setAttribute('class', '');
    nbtn.setAttribute('class', 'show');

    // Move Pointer
    let nbb = nbtn.getBoundingClientRect();
    tab.style.top = (nbb.top - 50) + "px";
        
    window.location.hash = pg;
    cbtn = nbtn;
    cpg = npg;
}
      
if (window.location.hash == ""){
    cpg.setAttribute('style', 'display: block;');
    window.location.hash = "home";
} else {
    let hash = window.location.hash.slice(1, window.location.hash.length);
    try {
        viewPage(hash);
    } catch(err) {
        viewPage('home');
    }
}