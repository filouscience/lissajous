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

    // remove existing dots (kills the animation timeline, if it exists)
    const dots = container.getElementsByClassName("dot1");
    while(dots[0]) {
        container.removeChild(dots[0]);
    }

    // place dots along the trajectory
    for (let i = 0; i < N; i += 1) {
        let t = i/num;
        let x =  ampl_x * Math.sin(w_x * t + phi0_x) + window.innerWidth / 2;
        let y = -ampl_y * Math.sin(w_y * t + phi0_y) + window.innerHeight / 2;

        let my_dot = document.createElement("div");
        my_dot.classList.add("dot1");
        my_dot.style.width = 2 + "px";
        my_dot.style.height = 2 + "px";
        my_dot.style.left = x + "px";
        my_dot.style.top = y + "px";
        my_dot.style.opacity = "0";
        container.appendChild(my_dot);
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
    // create new animation timeline
    const my_timeline = anime.createTimeline();
    my_timeline.add( // add animation staggered across timeline
        [".dot1"], // targets
        {
            loop: true,
            easing: "linear",
            opacity: [
                { to: 1, duration: onset},
                { to: 1-1*fade/(vis_time-onset), duration: fade},
                { to: 0, duration: wait}
            ],
            scale: [
                { to: 5, duration: onset},
                { to: 5-4*fade/(vis_time-onset), duration: fade},
                { to: 1, duration: wait}
            ],
            autoplay: true
        },
        anime.stagger(1000/num) // time position
    );
}

