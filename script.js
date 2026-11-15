const year = document.getElementById('year');
if (year) year.textContent = new Date().getFullYear();
const form = document.getElementById('consult');
const dateInput = document.getElementById('date');
const timeInput = document.getElementById('time');
const status = document.getElementById('status');
function seoulToday() {
 return new Intl.DateTimeFormat('en-CA', {timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
}
function updateTimes() {
 dateInput.min = seoulToday();
 const previous = timeInput.value;
 timeInput.replaceChildren(new Option('시간을 선택하세요', ''));
 if (!/^\d{4}-\d{2}-\d{2}$/.test(dateInput.value)) return;
 const day = new Date(`${dateInput.value}T12:00:00+09:00`).getUTCDay();
 const closing = day === 0 || day === 6 ? 18 : 20;
 const now = new Date();
 for(let minutes=11*60;minutes<closing*60;minutes+=30) {
  const time = `${String(Math.floor(minutes/60)).padStart(2,'0')}:${String(minutes%60).padStart(2,'0')}`;
  if (new Date(`${dateInput.value}T${time}:00+09:00`) <= now) continue;
  timeInput.add(new Option(time,time));
 }
 if ([...timeInput.options].some(option => option.value === previous)) timeInput.value = previous;
 if (timeInput.options.length === 1) timeInput.options[0].text = '예약 가능 시간이 없습니다';
}
updateTimes();
dateInput.addEventListener('change',updateTimes);
form.elements.name.addEventListener('input',event=>event.target.setCustomValidity(''));
document.querySelectorAll('[data-program]').forEach(card => card.addEventListener('click', () => {
 const item = {'드라이버 피팅':'드라이버','아이언 피팅':'아이언·웨지','풀백 피팅':'전체 점검'}[card.dataset.program];
 form.querySelectorAll('[name="items"]').forEach(input=>{input.checked=input.value===item;});
 form.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
}));
form.addEventListener('submit',async event => {
 event.preventDefault();
 const name = form.elements.name.value.trim();
 if(!name){form.elements.name.setCustomValidity('성함을 입력해 주세요.');form.elements.name.reportValidity();return;}
 const visit = new Date(`${dateInput.value}T${timeInput.value}:00+09:00`);
 if(dateInput.value<seoulToday() || !Number.isFinite(visit.getTime()) || visit<=new Date()) {updateTimes();status.textContent='현재 이후의 방문 일시를 선택해 주세요.';return;}
 const data = new FormData(form);
 const text = `바른골프피팅센터 동래점 예약 문의\n성함: ${name}\n연락처: ${data.get('phone')}\n희망 방문: ${data.get('date')} ${data.get('time')}\n피팅 품목: ${data.getAll('items').join(', ') || '상담 후 결정'}\n사용 클럽: ${data.get('specs').trim() || '미입력'}\n주요 고민: ${data.getAll('concerns').join(', ') || '미입력'}\n전달사항: ${data.get('message').trim() || '없음'}\n※ 매장 확인 후 예약 확정`;
 try {await navigator.clipboard.writeText(text);status.textContent='예약 내용을 복사했습니다. 매장에 아직 전송되지 않았습니다. 카카오톡 상담창에 붙여넣거나 전화로 예약을 확인해 주세요.';}
 catch {const copy=document.getElementById('booking-copy');copy.hidden=false;copy.value=text;copy.focus();copy.select();status.textContent='아래 내용을 직접 복사해 주세요. 매장에 전송되지 않았습니다.';}
});
const channel = window.BR_GOLF_CONFIG?.kakaoChannelUrl;
if(channel && /^https:\/\/pf\.kakao\.com\/[A-Za-z0-9_\/-]+$/.test(channel)) {
 const link=document.getElementById('floating-contact');link.href=channel;link.textContent='카카오톡 1:1 상담 ↗';link.classList.add('kakao');link.target='_blank';link.rel='noopener noreferrer';
 document.getElementById('booking-notice').textContent='작성한 예약 내용을 복사한 후 카카오톡 상담창에 붙여넣어 보내주세요. 자동 전송되지 않으며, 방문 일정은 매장 확인 후 확정됩니다.';
}
const photoDialog = document.getElementById('photo-dialog');
document.querySelectorAll('[data-photo]').forEach(button => button.addEventListener('click', () => {
 const image = document.getElementById('photo-full');image.src=button.dataset.photo;image.alt=button.querySelector('img').alt;
 document.getElementById('photo-caption').textContent=image.alt;photoDialog.showModal();document.body.classList.add('photo-open');
}));
document.querySelector('.photo-close').addEventListener('click',()=>photoDialog.close());
photoDialog.addEventListener('click',event=>{if(event.target===photoDialog){const box=photoDialog.getBoundingClientRect();if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)photoDialog.close();}});
photoDialog.addEventListener('close',()=>document.body.classList.remove('photo-open'));
