var i = {
  t: function () {
    try {
      var el = document.getElementById("divicw");
      if (!el) return;

      var script = document.createElement("script");
      script.src = "https://attachuk.imi.chat/widget/js/imichatinit.js?t=" + new Date().toISOString();

      el.insertAdjacentElement("afterend", script);

      script.addEventListener("load", function () {
        console.log(new Date().toISOString(), "Livechat script loaded successfully!");
      });

      script.addEventListener("error", function () {
        console.log(new Date().toISOString(), "Error loading Livechat script");
        i.o(el);
      });

    } catch (err) {
      console.error(err);
    }
  },

  s: function () {
    var frame = document.getElementById("tls_al_frm");
    if (frame) frame.remove();
  }
};

i.t();
