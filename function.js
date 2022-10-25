let caption = [];
let d = false;

setInterval(function() {

	// 자막 텍스트를 가져온다
	let caption_element = document.querySelectorAll(
		'.vjs-text-track-display > div > div > div'
	);
	let caption_str = caption_element[0].innerHTML;

	// 현재 시간을 가져온다
	let time_element = document.querySelectorAll(
		'.vjs-current-time-display'
	);
	let time_str = time_element[0].innerHTML;
	let time = time_str.split(":");
	let time_m = parseInt(time[0]);
	let time_s = parseInt(time[1]);

	// 현재 시간과 자막 텍스트를 저장
	if (typeof caption[time_m] === 'undefined') {
		caption[time_m] = [];
	}
	caption[time_m][time_s] = caption_str;
	//console.log(caption);

	// 일시중지 클릭되었으면 파일 다운로드
	let btn = document.querySelectorAll(
		'.vjs-control-bar > button > .vjs-control-text'
	);
	let btn_text = btn[0].innerHTML;
	if (btn_text == '재생 (enter, space)' && d == false) {
		caption_file = setCaptionFile();
		downloadFile(getVideoTitle() + '.srt', caption_file);
		d = true;
	}
	if (btn_text == '일시중지 (enter, space)') {
		d = false;
	}

}, 100);

// m, s를 "h:m:s,ms" 포맷으로 변환
function setTimeFormat(time_text) {

	let time_arr = time_text.split(':');
	let time = '';
	
	if (time_arr.length == 2) {
		time_arr[2] = time_arr[1];
		time_arr[1] = time_arr[0];
		time_arr[0] = '0';
	}
	for (var j = 0; j < time_arr.length; j++) {
		time_arr[j] = time_arr[j].padStart(2, '0');
	}
	
	time = time_arr.join(':');
	time = time + ',000';

	return time;

}

/** caption 배열을 srt 포맷 문자열로 변환 */
function setCaptionFile() {

	let caption_file = '';
	
	let time_str = '';
	let caption_str = '';

	let i = 1;
	let start = '00:00';
	let end = '00:00';

	for (let m = 0; m < caption.length; m++) {
		if (typeof caption[m] === 'undefined') {
			continue;
		}
		for (let s = 0; s < caption[m].length; s++) {
			if (typeof caption[m][s] === 'undefined') {
				continue;
			}
			if (caption_str == caption[m][s]) {
				continue;
			}

			end = m + ':' + s;
			caption_str = caption[m][s];

			caption_file += i;
			caption_file += ('\r\n' + setTimeFormat(start) + ' --> ' + setTimeFormat(end));
			caption_file += ('\r\n' + caption_str);
			caption_file += '\r\n\r\n';

			i += 1;
			start = end;

		}
	}

	return caption_file;

}

/** 동영상 타이틀을 가져온다 */
function getVideoTitle() {
	
	let title_element = document.querySelectorAll(
		'.v_player_con > h3 > strong'
	);
	let title = title_element[0].innerHTML;

	return title;

}

/** 파일 생성 및 다운로드 */
function downloadFile(filename, contents) {

	var element = document.createElement('a');
	element.setAttribute(
		'href', 
		'data:text/plain;charset=utf-8,' + encodeURIComponent(contents)
	);
	element.setAttribute('download', filename);

	element.style.display = 'none';
	document.body.appendChild(element);

	element.click();

	document.body.removeChild(element);

}

