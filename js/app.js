const progressBar = (() => {
  const assets = document.querySelectorAll("img");

  let totalAssets = assets.length;
  let loadedAssets = 0;

  const progress = () => {
    const progressPercentage = Math.min((loadedAssets / totalAssets) * 100, 100);

    document.getElementById("bar").style.width = progressPercentage.toString() + "%";
    document.getElementById("progress-info").innerText = `Wedding card, code & Design by Rafi & Olvia 
    (${loadedAssets}) [${progressPercentage.toFixed(0)}%]`;

    if (loadedAssets == totalAssets) {
      if ("scrollRestoration" in history) {
        history.scrollRestoration = "manual";
      }

      document.body.scrollTop = 0;
      document.documentElement.scrollTop = 0;

      window.scrollTo(0, 0);

      tamu();
      opacity("loading");
    }
  };

  assets.forEach((asset) => {
    if (asset.complete && asset.naturalWidth !== 0) {
      loadedAssets++;
      progress();
    } else {
      asset.addEventListener("load", () => {
        loadedAssets++;
        progress();
      });
    }
  });
})();

const audio = (() => {
  let instance = null;

  let createOrGet = () => {
    if (!(instance instanceof HTMLAudioElement)) {
      instance = new Audio();
      instance.autoplay = true;
      instance.src = document.getElementById("tombol-musik").getAttribute("data-url");
      instance.load();
      instance.currentTime = 0;
      instance.volume = 0.7;
      instance.muted = false;
      instance.loop = true;
    }

    return instance;
  };

  return {
    play: () => createOrGet().play(),
    pause: () => createOrGet().pause(),
  };
})();

// OK
const pagination = (() => {
  const perPage = 10;
  let pageNow = 0;
  let resultData = 0;

  let page = document.getElementById("page");
  let prev = document.getElementById("previous");
  let next = document.getElementById("next");

  let disabledPrevious = () => {
    prev.classList.add("disabled");
  };

  let disabledNext = () => {
    next.classList.add("disabled");
  };

  let buttonAction = async (button) => {
    let tmp = button.innerHTML;
    button.disabled = true;
    button.innerHTML = `<span class="spinner-border spinner-border-sm me-1"></span>Loading...`;
    await comment.ucapan();
    document.getElementById("daftar-ucapan").scrollIntoView({ behavior: "smooth" });
    button.disabled = false;
    button.innerHTML = tmp;
  };

  return {
    getPer: () => {
      return perPage;
    },
    getNext: () => {
      return pageNow;
    },
    reset: async () => {
      pageNow = 0;
      resultData = 0;
      page.innerText = 1;
      next.classList.remove("disabled");
      await comment.ucapan();
      disabledPrevious();
    },
    setResultData: (len) => {
      resultData = len;
      if (resultData < perPage) {
        disabledNext();
      }
    },
    previous: async (button) => {
      if (pageNow < 0) {
        disabledPrevious();
      } else {
        pageNow -= perPage;
        disabledNext();
        await buttonAction(button);
        page.innerText = parseInt(page.innerText) - 1;
        next.classList.remove("disabled");
        if (pageNow <= 0) {
          disabledPrevious();
        }
      }
    },
    next: async (button) => {
      if (resultData < perPage) {
        disabledNext();
      } else {
        pageNow += perPage;
        disabledPrevious();
        await buttonAction(button);
        page.innerText = parseInt(page.innerText) + 1;
        prev.classList.remove("disabled");
      }
    },
  };
})();

// Not complete
const comment = (() => {
  const kirim = document.getElementById("kirim");
  const hadiran = document.getElementById("form-kehadiran");
  const balas = document.getElementById("reply");
  const formnama = document.getElementById("form-nama");
  const formpesan = document.getElementById("form-pesan");
  const batal = document.getElementById("batal");
  const sunting = document.getElementById("ubah");
  let tempID = null;

  // OK
  const resetForm = () => {
    kirim.style.display = "block";
    hadiran.style.display = "block";
    batal.style.display = "none";
    balas.style.display = "none";
    sunting.style.display = "none";
    document.getElementById("label-kehadiran").style.display = "block";
    document.getElementById("balasan").innerHTML = null;
    formnama.value = null;
    hadiran.value = 0;
    formpesan.value = null;
    formnama.disabled = false;
    hadiran.disabled = false;
    formpesan.disabled = false;
  };

  // OK
  const send = async () => {
    let nama = formnama.value;
    let hadir = hadiran.value;
    let komentar = formpesan.value;
    let token = localStorage.getItem("token") ?? "";

    if (token.length == 0) {
      alert("Terdapat kesalahan, token kosong !");
      window.location.reload();
      return;
    }

    if (nama.length == 0) {
      alert("nama tidak boleh kosong");
      return;
    }

    if (nama.length >= 35) {
      alert("panjangan nama maksimal 35");
      return;
    }

    if (hadir == 0) {
      alert("silahkan pilih kehadiran");
      return;
    }

    if (komentar.length == 0) {
      alert("pesan tidak boleh kosong");
      return;
    }

    formnama.disabled = true;
    hadiran.disabled = true;
    formpesan.disabled = true;
    kirim.disabled = true;

    let tmp = kirim.innerHTML;
    kirim.innerHTML = `<span class="spinner-border spinner-border-sm me-1"></span>Loading...`;

    let isSuccess = false;
    await request("POST", "/api/comment")
      .token(token)
      .body({
        nama: nama,
        hadir: hadir == 1,
        komentar: komentar,
      })
      .then((res) => {
        if (res.code == 201) {
          owns.set(res.data.uuid, res.data.own);
          isSuccess = true;
        }
      })
      .catch((err) => {
        alert(`Terdapat kesalahan: ${err}`);
      });

    if (isSuccess) {
      await pagination.reset();
      document.getElementById("daftar-ucapan").scrollIntoView({ behavior: "smooth" });
      resetForm();
    }

    kirim.disabled = false;
    kirim.innerHTML = tmp;
  };

  // OK
  const balasan = async (button) => {
    button.disabled = true;
    let tmp = button.innerText;
    button.innerText = "Loading...";

    let id = button.getAttribute("data-uuid");
    let token = localStorage.getItem("token") ?? "";

    if (token.length == 0) {
      alert("Terdapat kesalahan, token kosong !");
      window.location.reload();
      return;
    }

    const BALAS = document.getElementById("balasan");
    BALAS.innerHTML = renderLoading(1);
    hadiran.style.display = "none";
    document.getElementById("label-kehadiran").style.display = "none";

    await request("GET", "/api/comment/" + id)
      .token(token)
      .then((res) => {
        if (res.code == 200) {
          kirim.style.display = "none";
          batal.style.display = "block";
          balas.style.display = "block";

          tempID = id;

          BALAS.innerHTML = `
                    <div class="my-3">
                        <label class="form-label">Balasan</label>
                        <div id="id-balasan" data-uuid="${id}" class="card-body bg-light shadow p-3 rounded-4">
                            <div class="d-flex flex-wrap justify-content-between align-items-center">
                                <p class="text-dark text-truncate m-0 p-0" style="font-size: 0.95rem;">
                                    <strong>${escapeHtml(res.data.nama)}</strong>
                                </p>
                                <small class="text-dark m-0 p-0" style="font-size: 0.75rem;">${res.data.created_at}</small>
                            </div>
                            <hr class="text-dark my-1">
                            <p class="text-dark m-0 p-0" style="white-space: pre-line">${escapeHtml(res.data.komentar)}</p>
                        </div>
                    </div>`;
        }
      })
      .catch((err) => {
        resetForm();
        alert(`Terdapat kesalahan: ${err}`);
      });

    document.getElementById("ucapan").scrollIntoView({ behavior: "smooth" });
    button.disabled = false;
    button.innerText = tmp;
  };

  // OK
  const innerComment = (data) => {
    return `
        <div class="d-flex flex-wrap justify-content-between align-items-center">
            <div class="d-flex flex-wrap justify-content-start align-items-center">
                <button style="font-size: 0.8rem;" onclick="comment.balasan(this)" data-uuid="${data.uuid}" class="btn btn-sm btn-outline-dark rounded-3 py-0">Balas</button>
                ${
                  owns.has(data.uuid)
                    ? `
                <button style="font-size: 0.8rem;" onclick="comment.edit(this)" data-uuid="${data.uuid}" class="btn btn-sm btn-outline-dark rounded-3 py-0 ms-1">Ubah</button>
                <button style="font-size: 0.8rem;" onclick="comment.hapus(this)" data-uuid="${data.uuid}" class="btn btn-sm btn-outline-dark rounded-3 py-0 ms-1">Hapus</button>`
                    : ""
                }
            </div>
            <button style="font-size: 0.8rem;" onclick="like(this)" data-uuid="${data.uuid}" class="btn btn-sm btn-outline-dark rounded-2 py-0 px-0">
                <div class="d-flex justify-content-start align-items-center">
                    <p class="my-0 mx-1" data-suka="${data.like.love}">${data.like.love} suka</p>
                    <i class="py-1 me-1 p-0 ${likes.has(data.uuid) ? "fa-solid fa-heart text-danger" : "fa-regular fa-heart"}"></i>
                </div>
            </button>
        </div>
        ${innerCard(data.comments)}`;
  };

  // OK
  const innerCard = (comment) => {
    let result = "";

    comment.forEach((data) => {
      result += `
            <div class="card-body border-start bg-light py-2 ps-2 pe-0 my-2 ms-2 me-0" id="${data.uuid}">
                <div class="d-flex flex-wrap justify-content-between align-items-center">
                    <p class="text-dark text-truncate m-0 p-0" style="font-size: 0.95rem;">
                        <strong>${escapeHtml(data.nama)}</strong>
                    </p>
                    <small class="text-dark m-0 p-0" style="font-size: 0.75rem;">${data.created_at}</small>
                </div>
                <hr class="text-dark my-1">
                <p class="text-dark mt-0 mb-1 mx-0 p-0" style="white-space: pre-line">${escapeHtml(data.komentar)}</p>
                ${innerComment(data)}
            </div>`;
    });

    return result;
  };

  // OK
  const renderCard = (data) => {
    const DIV = document.createElement("div");
    DIV.classList.add("mb-3");
    DIV.innerHTML = `
        <div class="card-body bg-light shadow p-3 m-0 rounded-4" data-parent="true" id="${data.uuid}">
            <div class="d-flex flex-wrap justify-content-between align-items-center">
                <p class="text-dark text-truncate m-0 p-0" style="font-size: 0.95rem;">
                    <strong class="me-1">${escapeHtml(data.nama)}</strong><i class="fa-solid ${data.hadir ? "fa-circle-check text-success" : "fa-circle-xmark text-danger"}"></i>
                </p>
                <small class="text-dark m-0 p-0" style="font-size: 0.75rem;">${data.created_at}</small>
            </div>
            <hr class="text-dark my-1">
            <p class="text-dark mt-0 mb-1 mx-0 p-0" style="white-space: pre-line">${escapeHtml(data.komentar)}</p>
            ${innerComment(data)}
        </div>`;
    return DIV;
  };

  // OK
  const ucapan = async () => {
    const UCAPAN = document.getElementById("daftar-ucapan");
    UCAPAN.innerHTML = renderLoading(pagination.getPer());

    let token = localStorage.getItem("token") ?? "";
    if (token.length == 0) {
      alert("Terdapat kesalahan, token kosong !");
      window.location.reload();
      return;
    }

    await request("GET", `/api/comment?per=${pagination.getPer()}&next=${pagination.getNext()}`)
      .token(token)
      .then((res) => {
        if (res.code == 200) {
          UCAPAN.innerHTML = null;
          res.data.forEach((data) => UCAPAN.appendChild(renderCard(data)));
          pagination.setResultData(res.data.length);

          if (res.data.length == 0) {
            UCAPAN.innerHTML = `<div class="h6 text-center">Tidak ada data</div>`;
          }
        }
      })
      .catch((err) => alert(`Terdapat kesalahan: ${err}`));
  };

  // OK
  const renderLoading = (num) => {
    let result = "";

    for (let index = 0; index < num; index++) {
      result += `
            <div class="mb-3">
                <div class="card-body bg-light shadow p-3 m-0 rounded-4">
                    <div class="d-flex flex-wrap justify-content-between align-items-center placeholder-glow">
                        <span class="placeholder bg-secondary col-5"></span>
                        <span class="placeholder bg-secondary col-3"></span>
                    </div>
                    <hr class="text-dark my-1">
                    <p class="card-text placeholder-glow">
                        <span class="placeholder bg-secondary col-6"></span>
                        <span class="placeholder bg-secondary col-5"></span>
                        <span class="placeholder bg-secondary col-12"></span>
                    </p>
                </div>
            </div>`;
    }

    return result;
  };

  // OK
  const reply = async () => {
    let nama = formnama.value;
    let komentar = formpesan.value;
    let token = localStorage.getItem("token") ?? "";
    let id = document.getElementById("id-balasan").getAttribute("data-uuid");

    if (token.length == 0) {
      alert("Terdapat kesalahan, token kosong !");
      window.location.reload();
      return;
    }

    if (nama.length == 0) {
      alert("nama tidak boleh kosong");
      return;
    }

    if (nama.length >= 35) {
      alert("panjangan nama maksimal 35");
      return;
    }

    if (komentar.length == 0) {
      alert("pesan tidak boleh kosong");
      return;
    }

    formnama.disabled = true;
    formpesan.disabled = true;

    batal.disabled = true;
    balas.disabled = true;
    let tmp = balas.innerHTML;
    balas.innerHTML = `<span class="spinner-border spinner-border-sm me-1"></span>Loading...`;

    let isSuccess = false;
    await request("POST", "/api/comment")
      .token(token)
      .body({
        nama: nama,
        id: id,
        komentar: komentar,
      })
      .then((res) => {
        if (res.code == 201) {
          isSuccess = true;
          owns.set(res.data.uuid, res.data.own);
        }
      })
      .catch((err) => {
        alert(`Terdapat kesalahan: ${err}`);
      });

    if (isSuccess) {
      await ucapan();
      document.getElementById(id).scrollIntoView({ behavior: "smooth", block: "center" });
      resetForm();
    }

    batal.disabled = false;
    balas.disabled = false;
    balas.innerHTML = tmp;
    formnama.disabled = false;
    formpesan.disabled = false;
  };

  // OK
  const ubah = async () => {
    let token = localStorage.getItem("token") ?? "";
    let id = sunting.getAttribute("data-uuid");
    let hadir = hadiran.value;
    let komentar = formpesan.value;

    if (token.length == 0) {
      alert("Terdapat kesalahan, token kosong !");
      window.location.reload();
      return;
    }

    if (document.getElementById(id).getAttribute("data-parent") === "true" && hadir == 0) {
      alert("silahkan pilih kehadiran");
      return;
    }

    if (komentar.length == 0) {
      alert("pesan tidak boleh kosong");
      return;
    }

    hadiran.disabled = true;
    formpesan.disabled = true;

    sunting.disabled = true;
    batal.disabled = true;
    let tmp = sunting.innerHTML;
    sunting.innerHTML = `<span class="spinner-border spinner-border-sm me-1"></span>Loading...`;

    let isSuccess = false;
    await request("PUT", "/api/comment/" + owns.get(id))
      .body({
        hadir: parseInt(hadir) == 1,
        komentar: komentar,
      })
      .token(token)
      .then((res) => {
        if (res.data.status) {
          isSuccess = true;
        }
      })
      .catch((err) => {
        alert(`Terdapat kesalahan: ${err}`);
      });

    if (isSuccess) {
      await ucapan();
      document.getElementById(id).scrollIntoView({ behavior: "smooth", block: "center" });
      resetForm();
    }

    sunting.innerHTML = tmp;
    sunting.disabled = false;
    batal.disabled = false;
    hadiran.disabled = false;
    formpesan.disabled = false;
  };

  // OK
  const hapus = async (button) => {
    if (!confirm("Kamu yakin ingin menghapus?")) {
      return;
    }

    let token = localStorage.getItem("token") ?? "";
    let id = button.getAttribute("data-uuid");

    if (token.length == 0) {
      alert("Terdapat kesalahan, token kosong !");
      window.location.reload();
      return;
    }

    button.disabled = true;
    let tmp = button.innerText;
    button.innerText = "Loading..";

    let isSuccess = false;
    await request("DELETE", "/api/comment/" + owns.get(id))
      .token(token)
      .then((res) => {
        if (res.data.status) {
          owns.unset(id);
          isSuccess = true;
        }
      })
      .catch((err) => {
        alert(`Terdapat kesalahan: ${err}`);
      });

    button.innerText = tmp;
    button.disabled = false;

    if (isSuccess) {
      ucapan();
    }
  };

  // OK
  const edit = async (button) => {
    button.disabled = true;
    let tmp = button.innerText;
    button.innerText = "Loading...";

    let id = button.getAttribute("data-uuid").toString();
    let token = localStorage.getItem("token") ?? "";

    if (token.length == 0) {
      alert("Terdapat kesalahan, token kosong !");
      window.location.reload();
      return;
    }

    await request("GET", "/api/comment/" + id)
      .token(token)
      .then((res) => {
        if (res.code == 200) {
          tempID = id;
          batal.style.display = "block";
          sunting.style.display = "block";
          kirim.style.display = "none";
          sunting.setAttribute("data-uuid", id);
          formpesan.value = res.data.komentar;
          formnama.value = res.data.nama;
          formnama.disabled = true;

          if (document.getElementById(id).getAttribute("data-parent") !== "true") {
            document.getElementById("label-kehadiran").style.display = "none";
            hadiran.style.display = "none";
          } else {
            hadiran.value = res.data.hadir ? 1 : 2;
            document.getElementById("label-kehadiran").style.display = "block";
            hadiran.style.display = "block";
          }

          document.getElementById("ucapan").scrollIntoView({ behavior: "smooth" });
        }
      })
      .catch((err) => {
        alert(`Terdapat kesalahan: ${err}`);
      });

    button.disabled = false;
    button.innerText = tmp;
  };

  // OK
  return {
    ucapan: ucapan,
    kirim: send,
    renderLoading: renderLoading,

    hapus: hapus,
    edit: edit,
    ubah: ubah,

    balasan: balasan,
    reply: reply,
    batal: () => {
      if (tempID) {
        document.getElementById(tempID).scrollIntoView({ behavior: "smooth", block: "center" });
        tempID = null;
      }
      resetForm();
    },
  };
})();

// OK
const storage = (table) =>
  ((table) => {
    const get = (key = null) => {
      if (!localStorage.getItem(table)) {
        localStorage.setItem(table, JSON.stringify({}));
      }

      if (key) {
        return JSON.parse(localStorage.getItem(table))[key];
      }

      return JSON.parse(localStorage.getItem(table));
    };

    const set = (key, value) => {
      let storage = get();
      storage[key] = value;
      localStorage.setItem(table, JSON.stringify(storage));
    };

    const unset = (key) => {
      let storage = get();
      delete storage[key];
      localStorage.setItem(table, JSON.stringify(storage));
    };

    const has = (key) => Object.keys(get()).includes(key);

    return {
      get: get,
      set: set,
      unset: unset,
      has: has,
    };
  })(table);

const likes = storage("likes");

const owns = storage("owns");

// OK
const request = (method, path) => {
  let url = document.querySelector("body").getAttribute("data-url");

  let req = {
    method: method,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  };

  return {
    async then(...prms) {
      if (url.slice(-1) == "/") {
        url = url.slice(0, -1);
      }

      return fetch(path ? url + path : url, req)
        .then((res) => res.json())
        .then((res) => {
          if (res.error.length == 0) {
            return res;
          }

          throw res.error[0];
        })
        .then(...prms);
    },
    token(token) {
      if (token) {
        req.headers["Authorization"] = "Bearer " + token;
      }

      return this;
    },
    body(body) {
      if (body) {
        req.body = JSON.stringify(body);
      }

      return this;
    },
  };
};

// OK
const escapeHtml = (unsafe) => {
  return unsafe.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
};

// OK
const salin = (btn, msg = null, timeout = 1500) => {
  navigator.clipboard.writeText(btn.getAttribute("data-nomer"));

  let tmp = btn.innerHTML;
  btn.innerHTML = msg ?? "Tersalin";
  btn.disabled = true;
  let id = null;

  id = setTimeout(() => {
    btn.innerHTML = tmp;
    btn.disabled = false;
    btn.focus();

    clearTimeout(id);
    id = null;
    return;
  }, timeout);
};

// OK
const timer = () => {
  let countDownDate = new Date(document.getElementById("tampilan-waktu").getAttribute("data-waktu").replace(" ", "T")).getTime();
  let time = null;

  time = setInterval(() => {
    let distance = countDownDate - new Date().getTime();

    if (distance < 0) {
      clearInterval(time);
      time = null;
      return;
    }

    document.getElementById("hari").innerText = Math.floor(distance / (1000 * 60 * 60 * 24));
    document.getElementById("jam").innerText = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    document.getElementById("menit").innerText = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    document.getElementById("detik").innerText = Math.floor((distance % (1000 * 60)) / 1000);
  }, 1000);
};

// OK
const animation = () => {
  const duration = 10 * 1000;
  const animationEnd = Date.now() + duration;
  let skew = 1;

  let randomInRange = (min, max) => {
    return Math.random() * (max - min) + min;
  };

  (function frame() {
    const timeLeft = animationEnd - Date.now();
    const ticks = Math.max(200, 500 * (timeLeft / duration));

    skew = Math.max(0.8, skew - 0.001);

    confetti({
      particleCount: 1,
      startVelocity: 0,
      ticks: ticks,
      origin: {
        x: Math.random(),
        y: Math.random() * skew - 0.2,
      },
      colors: ["FFC0CB", "FF69B4", "FF1493", "C71585"],
      shapes: ["heart"],
      gravity: randomInRange(0.5, 1),
      scalar: randomInRange(1, 2),
      drift: randomInRange(-0.5, 0.5),
    });

    if (timeLeft > 0) {
      requestAnimationFrame(frame);
    }
  })();
};

// OK
const buka = async () => {
  document.getElementById("daftar-ucapan").innerHTML = comment.renderLoading(pagination.getPer());
  document.querySelector("body").style.overflowY = "scroll";

  opacity("welcome");
  document.getElementById("tombol-musik").style.display = "block";
  AOS.init();
  audio.play();

  await confetti({
    origin: { y: 0.8 },
    zIndex: 1057,
  });
  animation();

  await login();
  timer();
};

// OK
const play = (btn) => {
  if (btn.getAttribute("data-status") !== "true") {
    btn.setAttribute("data-status", "true");
    audio.play();
    btn.innerHTML = '<i class="fa-solid fa-circle-pause"></i>';
  } else {
    btn.setAttribute("data-status", "false");
    audio.pause();
    btn.innerHTML = '<i class="fa-solid fa-circle-play"></i>';
  }
};

// OK
const modalFoto = (img) => {
  document.getElementById("showModalFoto").src = img.src;
  new bootstrap.Modal("#modalFoto").show();
};

// OK
const tamu = () => {
  let name = new URLSearchParams(window.location.search).get("to") ?? "";

  if (name.length == 0) {
    document.getElementById("nama-tamu").remove();
    return;
  }

  let div = document.createElement("div");
  div.classList.add("m-2");
  div.innerHTML = `<p class="mt-0 mb-1 mx-0 p-0 text-light">Kepada Yth Bapak/Ibu/Saudara/i</p><h2 class="text-light">${escapeHtml(name)}</h2>`;

  document.getElementById("form-nama").value = escapeHtml(name);
  document.getElementById("nama-tamu").appendChild(div);
};

// OK
const login = async () => {
  let body = document.querySelector("body");

  await request("POST", "/api/session")
    .body({
      email: body.getAttribute("data-email"),
      password: body.getAttribute("data-password"),
    })
    .then((res) => {
      if (res.code == 200) {
        localStorage.removeItem("token");
        localStorage.setItem("token", res.data.token);
        comment.ucapan();
      }
    })
    .catch((err) => {
      alert(`Terdapat kesalahan: ${err}`);
      window.location.reload();
      return;
    });
};

// OK
const like = async (button) => {
  let token = localStorage.getItem("token") ?? "";
  let id = button.getAttribute("data-uuid");

  if (token.length == 0) {
    alert("Terdapat kesalahan, token kosong !");
    window.location.reload();
    return;
  }

  let heart = button.firstElementChild.lastElementChild;
  let info = button.firstElementChild.firstElementChild;

  button.disabled = true;
  info.innerText = "Loading..";

  if (likes.has(id)) {
    await request("PATCH", "/api/comment/" + likes.get(id))
      .token(token)
      .then((res) => {
        if (res.data.status) {
          likes.unset(id);

          heart.classList.remove("fa-solid", "text-danger");
          heart.classList.add("fa-regular");

          info.setAttribute("data-suka", (parseInt(info.getAttribute("data-suka")) - 1).toString());
          info.innerText = info.getAttribute("data-suka") + " suka";
        }
      })
      .catch((err) => {
        alert(`Terdapat kesalahan: ${err}`);
      });
  } else {
    await request("POST", "/api/comment/" + id)
      .token(token)
      .then((res) => {
        if (res.code == 201) {
          likes.set(id, res.data.uuid);

          heart.classList.remove("fa-regular");
          heart.classList.add("fa-solid", "text-danger");

          info.setAttribute("data-suka", (parseInt(info.getAttribute("data-suka")) + 1).toString());
          info.innerText = info.getAttribute("data-suka") + " suka";
        }
      })
      .catch((err) => {
        alert(`Terdapat kesalahan: ${err}`);
      });
  }

  button.disabled = false;
};

// OK
const opacity = (nama) => {
  let op = parseInt(document.getElementById(nama).style.opacity);
  let clear = null;

  clear = setInterval(() => {
    if (op >= 0) {
      op -= 0.025;
      document.getElementById(nama).style.opacity = op;
    } else {
      clearInterval(clear);
      clear = null;
      document.getElementById(nama).remove();
      return;
    }
  }, 10);
};
