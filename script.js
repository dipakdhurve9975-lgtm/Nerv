(function () {
  var navToggle = document.getElementById("nav-toggle");
  var navRow = navToggle ? navToggle.closest(".nav-row") : null;

  if (navToggle) {
    navToggle.addEventListener("click", function () {
      var open = navRow.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  (function () {
    var toggle = document.getElementById("theme-toggle");

    function applyTheme(t) {
      if (t === "light") {
        document.documentElement.setAttribute("data-theme", "light");
      } else {
        document.documentElement.removeAttribute("data-theme");
      }
      try { localStorage.setItem("nerv-theme", t); } catch (e) {}
    }

    var saved;
    try { saved = localStorage.getItem("nerv-theme"); } catch (e) {}
    if (saved === "light") applyTheme("light");

    if (toggle) {
      toggle.addEventListener("click", function () {
        var next =
          document.documentElement.getAttribute("data-theme") === "light" ? "dark" : "light";
        applyTheme(next);
      });
    }
  })();

  (function () {
    var floor = document.getElementById("chibi-floor");
    if (!floor) return;

    var chibis = {};
    floor.querySelectorAll(".chibi").forEach(function (c) {
      chibis[c.dataset.name] = c;
    });

    var SCRIPT = [
      { who: "manager", text: "Plan set: pull accounts, draft emails, hold anything over the limit." },
      { who: "data", text: "5 overdue accounts pulled. 1 record missing a contact \u2014 flagging it." },
      { who: "finance", text: "2 invoices exceed \u20b950,000. Routing to approval." },
      { who: "comms", text: "4 emails drafted, tone matched to each account." },
      { who: "manager", text: "Approval received on Telegram. Continuing the run." },
      { who: "comms", text: "Emails sent. 1 account flagged for manual follow-up." },
      { who: "data", text: "Audit log updated \u2014 every step timestamped." },
      { who: "finance", text: "Nothing outstanding over the limit. Closing the loop." }
    ];

    var i = 0;

    function step() {
      floor.querySelectorAll(".chibi").forEach(function (c) {
        c.classList.remove("talking");
        c.querySelector(".chibi-bubble").className = "chibi-bubble";
      });
      var line = SCRIPT[i % SCRIPT.length];
      i++;
      var c = chibis[line.who];
      if (!c) return;
      c.classList.add("talking");
      var b = c.querySelector(".chibi-bubble");
      b.className = "chibi-bubble typing";
      setTimeout(function () {
        b.className = "chibi-bubble show";
        b.textContent = line.text;
      }, 900);
    }

    step();
    setInterval(step, 3800);
  })();

  (function () {
    var PAPER_PLANE =
      '<svg viewBox="0 0 24 24" aria-hidden="true" fill="#fff"><path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.9-.74 1.13-1.49.71l-4.1-3.02-1.98 1.9c-.22.22-.4.4-.76.44z"/></svg>';

    var ACTIONS = [
      { act: "ask", label: "\u2328\uFE0F Ask the office", prompt: "Type a goal for the office\u2026" },
      { act: "status", label: "\uD83D\uDCCA Status", reply: "\uD83D\uDCCA Manager: 3 agents online, 1 approval waiting on you." },
      { act: "approve", label: "\u2705 Approve pending", reply: "\u2705 Approved. Finance Agent resuming the run." },
      { act: "reject", label: "\u274C Reject pending", reply: "\u274C Rejected \u2014 that step is now flagged for manual follow-up." },
      { act: "log", label: "\uD83D\uDCCB Audit log", reply: "\uD83D\uDCCB Last 3 steps, timestamped, sent to this chat." }
    ];

    document.querySelectorAll(".tg-bot").forEach(function (bot) {
      var ask = ACTIONS[0];
      var html =
        '<button class="tg-btn" type="button" aria-label="Open Telegram bot commands" aria-haspopup="true" aria-expanded="false">' +
        PAPER_PLANE +
        "</button>" +
        '<div class="tg-menu" role="menu">' +
        '<div class="tg-ask"><input type="text" placeholder="' +
        ask.prompt +
        '" aria-label="' +
        ask.prompt +
        '"><button class="tg-send" type="button">Send</button></div>' +
        ACTIONS.map(function (a) {
          return (
            '<button class="tg-act" type="button" role="menuitem" data-act="' +
            a.act +
            '">' +
            a.label +
            "</button>"
          );
        }).join("") +
        "</div>";
      bot.innerHTML = html;

      var btn = bot.querySelector(".tg-btn");
      var menu = bot.querySelector(".tg-menu");
      var input = bot.querySelector(".tg-ask input");

      function setOpen(open) {
        bot.classList.toggle("open", open);
        bot.classList.remove("asking");
        btn.setAttribute("aria-expanded", open ? "true" : "false");
        if (open) menu.querySelector(".tg-act[data-act='ask']").focus();
      }

      function showToast(msg) {
        var old = bot.querySelector(".tg-toast");
        if (old) old.remove();
        var toast = document.createElement("div");
        toast.className = "tg-toast";
        toast.textContent = msg;
        bot.appendChild(toast);
        requestAnimationFrame(function () {
          toast.classList.add("show");
        });
        setTimeout(function () {
          toast.classList.remove("show");
          setTimeout(function () {
            toast.remove();
          }, 250);
        }, 2800);
      }

      function sendAsk() {
        var text = input.value.trim();
        if (!text) return;
        showToast('\u2328\uFE0F Goal sent: "' + text + '" \u2192 delivered to the Manager Agent.');
        input.value = "";
        setOpen(false);
      }

      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        setOpen(!bot.classList.contains("open"));
      });

      menu.addEventListener("click", function (e) {
        var actBtn = e.target.closest(".tg-act");
        if (actBtn) {
          e.stopPropagation();
          if (actBtn.dataset.act === "ask") {
            bot.classList.toggle("asking");
            input.focus();
            return;
          }
          var a = ACTIONS.find(function (x) { return x.act === actBtn.dataset.act; });
          if (a && a.reply) showToast(a.reply);
          setOpen(false);
        }
      });

      input.addEventListener("keydown", function (e) {
        if (e.key === "Enter") sendAsk();
      });

      var send = bot.querySelector(".tg-send");
      send.addEventListener("click", function (e) {
        e.stopPropagation();
        sendAsk();
      });
    });

    document.addEventListener("click", function () {
      document.querySelectorAll(".tg-bot.open").forEach(function (b) {
        b.classList.remove("open");
        b.querySelector(".tg-btn").setAttribute("aria-expanded", "false");
      });
    });
  })();
})();
