"use strict";

(function () {
  class GenericRecord {
    prompt() {
      this.filename = prompt(t("prompt_filename"), "");
      if (this.filename === null) {
        return false;
      }
      this.comments = prompt(t("prompt_comments"), "");
      if (this.comments === null) {
        return false;
      }

      this.isValid = true;
      return true;
    }

    getFilename() {
      return this.filename;
    }

    getMeta() {
      return {
        url: window.location.href,
        comments: (this.comments || ""),
      }
    }
  }

  class Matrika {
    constructor(book, page, orig_place, birth, marriage, death) {
      this.book = book;
      this.orig_place = orig_place;
      this.birth = birth;
      this.marriage = marriage;
      this.death = death;
    }
    prompt(page) {
      this.type = prompt(t("prompt_type"), "");
      if (this.type === null) {
        return false;
      }
      this.year = prompt(t("prompt_year"), "");
      if (this.year === null) {
        return false;
      }
      this.person = prompt(t("prompt_person"), "");
      if (this.person === null) {
        return false;
      }
      this.place = prompt(t("prompt_place"), this.orig_place);
      if (this.place === null) {
        return false;
      }
      this.parents = prompt(t("prompt_parents"));
      if (this.parents === null) {
        return false;
      }
      this.comments = prompt(t("prompt_comments"));
      if (this.comments === null) {
        return false;
      }

      this.page = page;
      this.isValid = true;
      return true;
    }

    getFilename() {
      return `${this.type} ${this.year} - ${this.person} - ${this.place} - ${this.book} pg ${this.page}`;
    }

    getMeta() {
      return {
        url: window.location.href,
        matrika: {
          book: this.book,
          page: this.page,
          originPlace: this.orig_place,
          place: this.place,
          birth: this.birth,
          marriage: this.marriage,
          death: this.death,
        },
        person: this.person ? [this.person] : [],
        parents: this.parents ? [this.parents] : [],
        comments: (this.comments || ""),
      }
    }
  }

  class Scitaci {
    constructor(place, archive, year, address) {
      this.place = place;
      this.archive = archive;
      this.year = year;
      this.address = address;
    }
    prompt(page) {
      this.houseNo = prompt(t("prompt_house_number"), "");
      if (this.houseNo === null) {
        return false;
      }
      this.person = prompt(t("prompt_person"), "");
      if (this.person === null) {
        return false;
      }
      this.comments = prompt(t("prompt_comments"));
      if (this.comments === null) {
        return false;
      }

      this.page = page;
      this.isValid = true;
      return true;
    }

    getFilename() {
      return `Scitaci operat - ${this.year} ${this.place} - ${this.person} - ${this.address} ${this.houseNo} - ${this.archive} pg ${this.page}`;
    }

    getMeta() {
      return {
        url: window.location.href,
        operat: {
          archive: this.archive,
          page: this.page,
          place: this.place,
          street: this.address,
          houseNo: this.houseNo,
        },
        person: this.person ? [this.person] : [],
        comments: (this.comments || null)
      };
    }
  }

  let lang = document.documentElement.lang || "en";

  let trans = {
    en: {
      button: "Download",
      prompt_type: "Type of archive (N / O / Z)",
      prompt_year: "Please enter year",
      prompt_person: "Please enter name of the person(s)",
      prompt_place: "Please enter name of the place",
      prompt_parents: "Parents (eg. Joe Doe and Jane Doe)",
      prompt_comments: "Comments",
      prompt_house_number: "House number",
      prompt_filename: "Filename",
    },
    cs: {
      button: "Stáhnout",
      prompt_type: "Archiv (N / O / Z)",
      prompt_year: "Rok události",
      prompt_person: "Nalezená osoba",
      prompt_place: "Místo události",
      prompt_parents: "Rodiče (např. Jan Novak a Jana Novakova)",
      prompt_comments: "Komentáře",
      prompt_house_number: "Číslo domu",
      prompt_filename: "Název souboru",
    }
  }

  function t(text) {
    return trans[lang][text] || trans["en"][text] || text;
  }

  function trim(c) {
    var ctx = c.getContext('2d'),
      copy = document.createElement('canvas').getContext('2d'),
      pixels = ctx.getImageData(0, 0, c.width, c.height),
      l = pixels.data.length,
      i,
      bound = {
        top: null,
        left: null,
        right: null,
        bottom: null
      },
      x, y;

    for (i = 0; i < l; i += 4) {
      if (pixels.data[i+3] !== 0) {
        x = (i / 4) % c.width;
        y = ~~((i / 4) / c.width);
    
        if (bound.top === null) {
          bound.top = y;
        }
        
        if (bound.left === null) {
          bound.left = x; 
        } else if (x < bound.left) {
          bound.left = x;
        }
        
        if (bound.right === null) {
          bound.right = x; 
        } else if (bound.right < x) {
          bound.right = x;
        }
        
        if (bound.bottom === null) {
          bound.bottom = y;
        } else if (bound.bottom < y) {
          bound.bottom = y;
        }
      }
    }
      
    var trimHeight = bound.bottom - bound.top,
        trimWidth = bound.right - bound.left,
        trimmed = ctx.getImageData(bound.left, bound.top, trimWidth, trimHeight);
    
    copy.canvas.width = trimWidth;
    copy.canvas.height = trimHeight;
    copy.putImageData(trimmed, 0, 0);
    
    // open new window with trimmed image:
    return copy.canvas;
  }

  function updateLoader(need, loaded, valid, cb) {
    var btn = document.getElementById("dige-download");
    if (need === loaded && valid) {
      cb();
      btn.disabled = false;
    } else {
      btn.disabled = true;
    }
  }


  function initialize() {
    var mzaViewer;
    if (typeof viewer === "object" && viewer.hasOwnProperty("source")) {
      mzaViewer = viewer;
    } else if (typeof g_viewer === "object" && g_viewer.hasOwnProperty("source")) {
      mzaViewer = g_viewer;
    } else if (typeof dragon === "object" && dragon.hasOwnProperty("source")) {
      mzaViewer = dragon;
    }

    function onCancel() {
      alert(t('download_cancel'));
    }
    
    function mzaDownload() {
      var page = $("#input-page").val();
      var level = mzaViewer.source.maxLevel - 1,
        scale = mzaViewer.source.getLevelScale(level),
        width = Math.ceil(mzaViewer.source.width * scale),
        height = Math.ceil(mzaViewer.source.height * scale),
        tileWidth = mzaViewer.source.getTileWidth(level),
        tileHeight = mzaViewer.source.getTileHeight(level),
        rows = mzaViewer.source.getNumTiles(level).y,
        cols = mzaViewer.source.getNumTiles(level).x;

      if (width > 16000 || height > 16000) {
        alert('Image is to big, your browser supports this');
        return;
      }

      var recordPrompt;
      if (window.location.pathname.startsWith("/actapublica/matrika/detail/")) {
        var orig_place = $('main[role="main"] .card:eq(0) .row:eq(0) .col-12:eq(1) strong').text().trim();
        var book = $('main[role="main"] .card:eq(0) .row:eq(0) .col-12:eq(0) strong').text().trim();
        var birth = $('main[role="main"] .card:eq(0) .row:eq(0) .col-12:eq(2) strong').text().trim();
        var marriage = $('main[role="main"] .card:eq(0) .row:eq(0) .col-12:eq(3) strong').text().trim();
        var death = $('main[role="main"] .card:eq(0) .row:eq(0) .col-12:eq(4) strong').text().trim();
        recordPrompt = new Matrika(book, page, orig_place, birth, marriage, death);
      } else if (window.location.pathname.startsWith("/scitacioperaty/digisada/detail/")) {
        var place = $('main[role="main"] .card:eq(0) .row:eq(0) .col-12:eq(0) strong').text().trim();
        var archive = $('main[role="main"] .card:eq(0) .row:eq(0) .col-12:eq(2) strong').text().trim();
        var year = $('main[role="main"] .card:eq(0) .row:eq(1) .col-12:eq(2) strong').text().trim();
        var address = $('main[role="main"] .card:eq(0) .row:eq(2) .col-12:eq(0) strong').text().trim();
        recordPrompt = new Scitaci(place, archive, year, address);
      } else {
        recordPrompt = new GenericRecord();
      }

      var canvas = document.createElement("canvas");
      canvas.width  = width;
      canvas.height = height;
      canvas.style.position = "absolute";
      canvas.style.top = -100000;
      canvas.style.left = -100000;
      canvas.style.display = "none";
      document.body.appendChild(canvas);
      var ctx = canvas.getContext('2d');

      var need = rows * cols;
      var loaded = 0;

      if (!(rows > 0 && rows < 200 && cols > 0 && cols < 200)) {
        alert('Error when downloading the image');
        return;
      }

      for (var x = 0; x < cols; x++) {
        for (var y = 0; y < rows; y++) {
          (function () { // https://stackoverflow.com/questions/19586137/addeventlistener-using-for-loop-and-passing-values
            var img = new Image;
            var ox = x;
            var oy = y;
            img.onload = function() {
              ctx.drawImage(img, ox * tileWidth, oy * tileHeight);
              loaded += 1;
              updateLoader(need, loaded, recordPrompt.isValid, onCompleted);
            };
            img.onerror = function() {
              loaded += 1;
              updateLoader(need, loaded, recordPrompt.isValid, onCompleted);
            }
            img.src = mzaViewer.source.getTileUrl(level, x, y);
          }()); // immediate invocation
        }
      }

      if (!recordPrompt.prompt(page)) {
        return;
      }
      updateLoader(need, loaded, recordPrompt.isValid, onCompleted);

      function onCompleted() {
        var img = canvas.toDataURL("image/png");
        var element = document.createElement('a');
        element.setAttribute('href', img);
        element.setAttribute('download', recordPrompt.getFilename());
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);

        var element = document.createElement('a');
        element.setAttribute('href', 'data:application/octet-stream,' + encodeURI(JSON.stringify(recordPrompt.getMeta())));
        element.setAttribute('download', recordPrompt.getFilename() + ".json");
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
      }
    }

    let button = $(`<button id="dige-download" type="button" class="btn btn-light mr-1" title="${t("button")}" style="display: inline-block; position: relative;">${t("button")}</button>`);
    button.on('click', mzaDownload);
    $('#seadragon-toolbar button[type="button"]:last-of-type').after(button);
  }


  initialize();

}());
