let caption = [];
let d = false;

setInterval(function() {

	// 현재 시간을 가져온다
	let time_element = document.querySelectorAll(
		".vjs-current-time-display"
	);
	let time_str = time_element[0].innerHTML;
	let time_m = parseInt(time_str.split(":")[0]);
	let time_s = parseInt(time_str.split(":")[1]);

    // 자막 텍스트를 가져온다
	let caption_element = document.querySelectorAll(
		".vjs-text-track-display > div > div > div"
	);
	let caption_str = caption_element[0].innerHTML;

	// 현재 시간과 자막 텍스트를 저장
	if (typeof caption[time_m] === "undefined") {
		caption[time_m] = [];
	}
	caption[time_m][time_s] = caption_str;

	// 일시중지 클릭되었으면 파일 다운로드
	let btn = document.querySelectorAll(
		".vjs-control-bar > button > .vjs-control-text"
	);
	let btn_text = btn[0].innerHTML;
	
	if (btn_text == "재생 (enter, space)" && d == false) {
	
	    console.log(caption);
	
	    caption_file_name = getVideoTitle() + ".srt";
		caption_file_contents = setCaptionFile(caption);
		
		downloadFile(caption_file_name, caption_file_contents);
		d = true;
		
	}
	
	if (btn_text == "일시중지 (enter, space)") {
		d = false;
	}

}, 100);

/** m:s를 "h:m:s,ms" 포맷으로 변환 */
function setTimeFormat(time_text) {

	let time_arr = time_text.split(":");
	let time_new = "";
	
	if (time_arr.length == 2) {
		time_arr[2] = time_arr[1];
		time_arr[1] = time_arr[0];
		time_arr[0] = "0";
	}
	for (var j = 0; j < time_arr.length; j++) {
		time_arr[j] = time_arr[j].padStart(2, "0");
	}
	
	time_new = time_arr.join(":");
	time_new = time_new + ",000";

	return time_new;

}

/** caption 배열을 srt 포맷 문자열로 변환 */
function setCaptionFile(caption_arr) {

    if (caption_arr.length === 0) {
        return;
    }

	let caption_file = "";
	let caption_current_str = "";

	let num = 1;
	
	let start = setTimeFormat("00:00");
	let prev = setTimeFormat("00:00");
	let end = setTimeFormat("00:00");

    for (let m = 0; m < caption_arr.length; m++) {
    
        if (typeof caption_arr[m] === "undefined") {
            continue;
        }
    
        for (let s = 0; s < caption_arr[m].length; s++) {
            
            if (typeof caption_arr[m][s] === "undefined") {
                continue;
            }
            
            if (caption_arr[m][s] != caption_current_str) {
                
                 end = prev;
                if (start == setTimeFormat(m + ":" + s)) {
                    end = start;
                }
                
                caption_file += (num + "\r\n");
                caption_file += (start + " --> " + end + "\r\n");
                caption_file += (caption_current_str + "\r\n\r\n");
                
                num += 1;
                
                caption_current_str = caption_arr[m][s];
                start = setTimeFormat(m + ":" + s);
                
            } else {
            
                prev = setTimeFormat(m + ":" + s);
            
            }
        
        }
    }
    
    return caption_file;

}

/** 동영상 타이틀을 가져온다 */
function getVideoTitle() {
	
	let title_element = document.querySelectorAll(
		".v_player_con > h3 > strong"
	);
	let title = title_element[0].innerHTML;
    
    if (title.length < 1) {
        title = "unknown";
    }

	return title;

}

/** 파일 생성 및 다운로드 */
function downloadFile(filename, contents) {

	let element = document.createElement("a");
	
	element.setAttribute(
		"href", 
		"data:text/plain;charset=utf-8," + encodeURIComponent(contents)
	);
	element.setAttribute("download", filename);
    element.style.display = "none";
	
	document.body.appendChild(element);

	element.click();

	document.body.removeChild(element);

    return;

}

