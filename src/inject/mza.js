var s = document.createElement('script');
s.src = chrome.runtime.getURL('src/inject/mza_script.js');
(document.head||document.documentElement).appendChild(s);
// s.onload = function() {
//     s.remove();
// };
