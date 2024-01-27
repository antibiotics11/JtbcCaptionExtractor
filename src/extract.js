class JtbcReplyVideo {

    /**
     * @param {string|null} title 동영상 제목
     * @param {string|null} length 동영상 길이
     * @param {any[]} caption 자막 배열
     */
    constructor(title = null, length = null, caption = []) {
        this.title   = title;   // 동영상 제목
        this.length  = length;  // 동영상 길이
        this.caption = caption; // 자막 배열
    }

}

class FileDownloader {

    constructor(filename = null, content = null) {

        if (filename === null) {
            console.error("파일 이름이 지정되지 않았습니다.");
            return;
        }

        this.fileElement = null;
        this.create(filename, content ?? "");

    }

    /**
     * 파일을 생성한다.
     *
     * @param {string} filename
     * @param {string} content
     */
    create(filename, content) {

        let fileElement = document.createElement("a");
        fileElement.setAttribute(
            "href",
            "data:text/plain;charset=utf-8," + encodeURIComponent(content)
        );
        fileElement.setAttribute("download", filename);
        fileElement.style.display = "none";

        this.fileElement = fileElement;

    }

    /**
     * 파일을 다운로드한다.
     */
    download() {

        if (this.fileElement === null) {
            console.error("다운로드할 파일이 설정되지 않았습니다.");
            return;
        }

        document.body.appendChild(this.fileElement);
        this.fileElement.click();

        document.body.removeChild(this.fileElement);

    }

}

class SrtCaption {

    /**
     * h:m:s를 "h:m:s,ms" 포맷 문자열로 변환한다.
     *
     * @param {string} time
     * @returns {string}
     */
    static convertTimeFormat(time) {

        let timePieces = time.split(":");
        let formattedTime = "";

        if (timePieces.length === 2) {
            timePieces[2] = timePieces[1];
            timePieces[1] = timePieces[0];
            timePieces[0] = "0";
        }

        for (let i = 0; i < timePieces.length; i++) {
            timePieces[i] = timePieces[i].padStart(2, "0");
        }

        formattedTime = timePieces.join(":");
        formattedTime = formattedTime + ",000";

        return formattedTime

    }

    /**
     * 자막 배열을 srt 문자열로 변환한다.
     *
     * @param {any[]} captionArray
     * @return {string}
     */
    static convertSrt(captionArray) {

        if (captionArray.length === 0) {
            return "";
        }

        let srt = "";
        let tmp = "";
        let num = 1;

        let start = this.convertTimeFormat("00:00");
        let prev  = this.convertTimeFormat("00:00");
        let end   = this.convertTimeFormat("00:00");

        for (let m = 0; m < captionArray.length; m++) {

            if (typeof captionArray[m] == "undefined") {
                continue;
            }

            for (let s = 0; s < captionArray[m].length; s++) {

                if (typeof captionArray[m][s] == "undefined") {
                    continue;
                }

                if (captionArray[m][s] !== tmp) {

                    end = prev;
                    if (start === this.convertTimeFormat(m + ":" + s)) {
                        end = start;
                    }

                    srt += (num + "\r\n");
                    srt += (start + " --> " + end + "\r\n");
                    srt += (tmp + "\r\n\r\n");

                    num += 1;

                    tmp = captionArray[m][s];
                    start = this.convertTimeFormat(m + ":" + s);

                } else {

                    prev = this.convertTimeFormat(m + ":" + s);

                }

            }

        }

        console.log(srt);
        return srt;

    }

}

let video = new JtbcReplyVideo();
let downloaded = false;

setInterval(() => {

    // 플레이어 제목을 가져온다.
    if (video.title === null) {
        let playerTitle = document.querySelectorAll(".v_player_con > h3 > strong");
        if (playerTitle[0].innerHTML !== null) {
            video.title = playerTitle[0].innerHTML.trim();
            console.log("동영상 제목: " + video.title);
        }
    }

    // 플레이어의 길이를 가져온다.
    let playerLength = document.querySelectorAll(".vjs-duration-display");
    let length = playerLength[0].innerHTML.trim();
    let lengthM = parseInt(length.split(":")[0]);
    let lengthS = parseInt(length.split(":")[1]);
    if (lengthS === 0) {
        lengthM--;
        lengthS = 59;
    }
    video.length = lengthM + ":" + lengthS;

    // 플레이어의 현재 시간을 가져온다.
    let playerTime = document.querySelectorAll(".vjs-current-time-display");
    let time = playerTime[0].innerHTML.trim();
    let timeM = parseInt(time.split(":")[0]);
    let timeS = parseInt(time.split(":")[1]);

    // 플레이어의 현재 자막을 가져온다.
    let playerCaption = document.querySelectorAll(".vjs-text-track-display > div > div > div");
    if (playerCaption.length === 0) {
        return;
    }
    let caption = playerCaption[0].innerHTML ?? "";

    video.caption[timeM] ??= [];
    video.caption[timeM][timeS] = caption;

    console.log(time + "/" + video.length + " => " + caption);

    /*
    let playerButton = document.querySelectorAll(".vjs-control-bar > button > .vjs-control-text");
    let buttonText = playerButton[0].innerHTML;
    */

    // 플레이어 종료시 자막을 저장한다.
    if (!downloaded && (timeM === lengthM && timeS === lengthS) && video.caption.length !== 0) {

        downloaded = true;
        // srt 포맷된 문자열을 파일로 다운로드한다.
        (new FileDownloader(
            video.title + ".srt",
            SrtCaption.convertSrt(video.caption))
        ).download();

    }

}, 100);
