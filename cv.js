(function () {
  // Timeline: ruler from 2021 to the current year, clips run to "now".
  var START = 2021;
  var now = new Date();
  var end = now.getFullYear() + 1;
  var span = end - START;
  var pos = function (y) { return (y - START) / span; };
  var nowPos = pos(now.getFullYear() + now.getMonth() / 12);
  var tl = document.getElementById("tl");
  tl.style.setProperty("--now", nowPos);
  var ruler = document.getElementById("tl-ruler");
  for (var y = START; y < end; y++) {
    var s = document.createElement("span");
    s.textContent = y;
    s.style.left = (pos(y) * 100) + "%";
    ruler.appendChild(s);
  }
  tl.querySelectorAll(".clip").forEach(function (c) {
    c.style.setProperty("--from", pos(+c.dataset.start));
  });
  requestAnimationFrame(function () { tl.classList.add("is-playing"); });

  document.getElementById("year").textContent = now.getFullYear();
  document.getElementById("print-btn").addEventListener("click", function () { window.print(); });

  // Works: Drive thumbnail as poster; play swaps in the Drive player inline.
  var preview = function (id) { return "https://drive.google.com/file/d/" + id + "/preview"; };
  document.querySelectorAll(".media[data-drive]").forEach(function (m) {
    var id = m.dataset.drive;
    var btn = m.querySelector(".play");
    var cover = new Image();
    cover.alt = "";
    cover.loading = "lazy";
    cover.src = "https://drive.google.com/thumbnail?id=" + id + "&sz=w1280";
    cover.onerror = function () {
      var n = document.createElement("span");
      n.className = "no-thumb";
      n.textContent = document.documentElement.lang === "en" ? "Preview unavailable" : "معاينة غير متاحة";
      cover.replaceWith(n);
      cover = n;
    };
    m.insertBefore(cover, btn);
    m.resetPoster = function () { m.classList.remove("is-live"); m.replaceChildren(cover, btn); };
    btn.addEventListener("click", function () {
      var f = document.createElement("iframe");
      f.src = preview(id);
      f.title = btn.getAttribute("aria-label");
      f.allow = "autoplay; fullscreen";
      f.allowFullscreen = true;
      m.classList.add("is-live");
      m.replaceChildren(f);
      f.focus();
    });
  });

  // Fullscreen viewer: whole screen on phones and desktops alike.
  var viewer = document.getElementById("viewer");
  var vFrame = viewer.querySelector("iframe");
  var lastTrigger = null;
  document.querySelectorAll(".fs-btn").forEach(function (b) {
    b.addEventListener("click", function () {
      var work = b.closest(".work");
      var m = work.querySelector(".media");
      var title = work.querySelector("h3").textContent;
      if (!viewer.showModal) { window.open(preview(m.dataset.drive), "_blank", "noopener"); return; }
      m.resetPoster(); // stop the inline copy so audio doesn't play twice
      lastTrigger = b;
      document.getElementById("viewer-title").textContent = title;
      vFrame.title = title;
      vFrame.src = preview(m.dataset.drive);
      viewer.showModal();
      if (viewer.requestFullscreen) viewer.requestFullscreen().catch(function () {});
    });
  });
  viewer.querySelector(".viewer-close").addEventListener("click", function () {
    if (document.fullscreenElement) document.exitFullscreen().catch(function () {});
    viewer.close();
  });
  viewer.addEventListener("close", function () {
    vFrame.src = "about:blank";
    if (lastTrigger) lastTrigger.focus();
  });
})();
