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
 timeInput.replaceChildren(new Option(dateInput.value ? '시간을 선택하세요' : '날짜를 먼저 선택하세요', ''));
 if (!/^\d{4}-\d{2}-\d{2}$/.test(dateInput.value)) return;
 const day = new Date(`${dateInput.value}T12:00:00+09:00`).getUTCDay();
 const closing = day === 0 || day === 6 ? 18 : 20;
 const hours = document.getElementById('booking-hours');
 if (hours) hours.textContent = `${day === 0 || day === 6 ? '토·일요일' : '평일'} 영업시간 11:00~${closing}:00 · 30분 단위 선택, 마감 30분 전까지 방문 시작 가능`;
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
 const item = {'드라이버 피팅':'스윙분석','아이언 피팅':'스윙분석','풀백 피팅':'클럽점검'}[card.dataset.program];
 form.querySelectorAll('[name="items"]').forEach(input=>{input.checked=input.value===item;});
 form.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
}));
form.addEventListener('submit', event => {
 const name = form.elements.name.value.trim();
 if (!name) {event.preventDefault();form.elements.name.setCustomValidity('성함을 입력해 주세요.');form.elements.name.reportValidity();return;}
 const visit = new Date(`${dateInput.value}T${timeInput.value}:00+09:00`);
 const day = visit.getUTCDay();
 const closing = day === 0 || day === 6 ? '18:00' : '20:00';
 if (dateInput.value < seoulToday() || !Number.isFinite(visit.getTime()) || visit <= new Date() || timeInput.value < '11:00' || timeInput.value >= closing) {
  event.preventDefault();updateTimes();status.textContent='영업시간 내의 현재 이후 방문 일시를 선택해 주세요.';return;
 }
 const data = new FormData(form);
 document.getElementById('reservation-summary').value = `[바른골프피팅 동래점] 새로운 시타/피팅 예약이 접수되었습니다.\n- 예약자: ${name} 님\n- 연락처: ${data.get('phone')}\n- 희망일시: ${data.get('date')} ${data.get('time')} (한국 시간)\n- 희망품목: ${data.getAll('items').join(', ') || '상담 후 결정'}\n- 현재 사용 클럽: ${data.get('specs').trim() || '미입력'}\n- 주요 고민: ${data.getAll('concerns').join(', ') || '미입력'}\n- 사전 전달사항: ${data.get('message').trim() || '없음'}`;
 status.textContent='메일 접수 서비스로 이동합니다. 다음 화면의 보안 확인을 완료해 주세요.';
 // Allow the native POST. Never claim email delivery before the service responds.
});
const channel = window.BR_GOLF_CONFIG?.kakaoChannelUrl;
if(channel && /^https:\/\/pf\.kakao\.com\/[A-Za-z0-9_\/-]+$/.test(channel)) {
 const link=document.getElementById('floating-contact');link.href=channel;link.textContent='카카오톡 1:1 상담 ↗';link.classList.add('kakao');link.target='_blank';link.rel='noopener noreferrer';
}
const photoDialog = document.getElementById('photo-dialog');
document.querySelectorAll('[data-photo]').forEach(button => button.addEventListener('click', () => {
 const image = document.getElementById('photo-full');image.src=button.dataset.photo;image.alt=button.querySelector('img').alt;
 document.getElementById('photo-caption').textContent=image.alt;photoDialog.showModal();document.body.classList.add('photo-open');
}));
document.querySelector('.photo-close').addEventListener('click',()=>photoDialog.close());
photoDialog.addEventListener('click',event=>{if(event.target===photoDialog){const box=photoDialog.getBoundingClientRect();if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)photoDialog.close();}});
photoDialog.addEventListener('close',()=>document.body.classList.remove('photo-open'));
