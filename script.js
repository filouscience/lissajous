const onset_time = 20; // visibility onset time [ms]
const freq_res = 100; // input frequency resolution

function gcd(a,b) {
    let u, v;
    if (a > b) {
        u = a;
        v = b;
    } else {
        u = b;
        v = a;
    }
    if (v > 0) {
        return gcd(v, u % v);
    } else {
        return u;
    }
    // numerical error: e.g. ( 2 % 1.9 == 0.10000000000000009 )
    // better only use gcd with integers
}

function on_freq_change() {
    const freq_x = parseFloat(document.getElementById("frq_x").value);
    const freq_y = parseFloat(document.getElementById("frq_y").value);
    const freq_x_m = Math.floor(freq_res * freq_x);
    const freq_y_m = Math.floor(freq_res * freq_y);
    const T = 1 / ( gcd(freq_x_m, freq_y_m) / freq_res ); // total period [s]
    document.getElementById("frq_x").value = freq_x_m / freq_res;
    document.getElementById("frq_y").value = freq_y_m / freq_res;
    document.getElementById("period").value = T;
}

function init() {
    // nothing needed.
}

function do_it() {

    const ampl_x = parseInt(document.getElementById("amp_x").value);
    const freq_x = parseFloat(document.getElementById("frq_x").value);
    const phi0_x = parseFloat(document.getElementById("ph0_x").value) * Math.PI;
    const ampl_y = parseInt(document.getElementById("amp_y").value);
    const freq_y = parseFloat(document.getElementById("frq_y").value);
    const phi0_y = parseFloat(document.getElementById("ph0_y").value) * Math.PI;

    const num = parseInt(document.getElementById("num").value); // density of dots [s-1]
    const vis_time = parseFloat(document.getElementById("vis").value) * 1000; // visible time [ms]

    const freq_x_m = Math.floor(freq_res * freq_x);
    const freq_y_m = Math.floor(freq_res * freq_y);
    const w_x = freq_x_m / freq_res * Math.PI * 2;
    const w_y = freq_y_m / freq_res * Math.PI * 2;

    const T = 1 / ( gcd(freq_x_m,freq_y_m) / freq_res ); // total period [s]
    const N = num*T; // total number of dots to plot the tarjectory []

    const container = document.querySelector(".anime-container");

    // remove existing dots
    const dots1 = container.getElementsByClassName("dot1");
    while(dots1[0]) {
        container.removeChild(dots1[0]);
    }
    const dots2 = container.getElementsByClassName("dot2");
    while(dots2[0]) {
        container.removeChild(dots2[0]);
    }

    // place two sets of dots along the trajectory
    for (let i = 0; i < N; i += 1) {
        let t = i/num;
        let x =  ampl_x * Math.sin(w_x * t + phi0_x) + window.innerWidth / 2;
        let y = -ampl_y * Math.sin(w_y * t + phi0_y) + window.innerHeight / 2;

        let my_dot1 = document.createElement("div");
        my_dot1.classList.add("dot1");
        my_dot1.style.width = 2 + "px";
        my_dot1.style.height = 2 + "px";
        my_dot1.style.left = x + "px";
        my_dot1.style.top = y + "px";
        my_dot1.style.opacity = "0";
        container.appendChild(my_dot1);

        let my_dot2 = document.createElement("div");
        my_dot2.classList.add("dot2");
        my_dot2.style.width = 2 + "px";
        my_dot2.style.height = 2 + "px";
        my_dot2.style.left = x + "px";
        my_dot2.style.top = y + "px";
        my_dot2.style.opacity = "0";
        container.appendChild(my_dot2);
    }

    let tot_time = 1000*T;
    let onset = 0;
    let fade = 0;
    let wait = 0;
    if (tot_time >= onset_time) {
        onset = onset_time;
    }
    if (tot_time >= vis_time) {
        fade = vis_time-onset;
        wait = tot_time-vis_time;
    } else {
        fade = tot_time-onset;
    }

    // WORKAROUND
    // animation has to complete (including fade) before strating new loop.
    // two animation instances (the two sets of dots) can loop independently (hopefully) without gaps: 

    const anim_dots1 = anime({
        targets: document.querySelectorAll(".dot1"),
        loop: true,
        easing: "linear",
        opacity: [
            { value: 1, duration: onset, delay: anime.stagger(1000/num) },
            { value: 1-1*fade/(vis_time-onset), duration: fade }
        ],
        scale: [
            { value: 5, duration: onset, delay: anime.stagger(1000/num) },
            { value: 5-4*fade/(vis_time-onset), duration: fade }
        ],
        endDelay: wait,
        autoplay: false,

        // start anim_dots2 half-way through the fisrt loop of anim_dots1
        update: (anim) => {
            if (!anim_dots2.began && anim.progress >= 50.0) {
                anim_dots2.seek( (anim.progress-50.0) / 100 * anim.duration );
                anim_dots2.play();
            }
        }
    });

    const anim_dots2 = anime({
        targets: document.querySelectorAll(".dot2"),
        loop: true,
        easing: "linear",
        opacity: [
            { value: 1, duration: onset, delay: anime.stagger(1000/num) },
            { value: 1-1*fade/(vis_time-onset), duration: fade }
        ],
        scale: [
            { value: 5, duration: onset, delay: anime.stagger(1000/num) },
            { value: 5-4*fade/(vis_time-onset), duration: fade }
        ],
        endDelay: wait,
        autoplay: false
    });

    anim_dots1.play();
}

