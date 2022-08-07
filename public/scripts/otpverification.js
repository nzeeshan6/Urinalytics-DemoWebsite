function resend() {
    var timer = document.getElementById('resend-timer');
    var endtime = new Date();
    endtime.setMinutes(endtime.getMinutes() + 1);
    var interval = setInterval(() => {
        var now = new Date();

        var seconds = Math.floor((endtime.getTime() - now.getTime()) / 1000);

        if (seconds < 0) {
            clearInterval(interval);
            timer.innerHTML = "Resend";
            timer.addEventListener('click', () => {
                timer.innerHTML = `<div class="spinner-border" role="status">
<span class="sr-only"></span>
</div>`
                let data = fetch("/resend-otp", { method: "post" });
                data.then(response => response.json()).then(realData => {
                    if (realData) {
                        resend();
                    }
                })
            })

        }
        else {
            timer.innerHTML = `Resend in ${seconds} secs`;
        }

    }, 1000)



}
resend();
function move(e, previous, current, next) {
    console.log(e);
    var length = document.getElementById(current).value.length;
    var data = document.getElementById(current).value;

    const validData = /^[0-9]+$/;
    if (length) {
        // console.log(data.match(validData));
        if (next != "") {
            if (data.match(validData))
                document.getElementById(next).focus();
            else {
                document.getElementById(current).focus();
                document.getElementById(current).value = "";
            }
        }


    }
    else {
        if (previous != "")
            document.getElementById(previous).focus();
    }
}