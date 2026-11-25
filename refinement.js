// Keep the reservation form intact; use a native accessible dialog on demand.
const bookingDialog = document.querySelector('#booking-dialog');
if (bookingDialog) {
  let bookingTrigger;
  document.addEventListener('click', event => {
    const open = event.target.closest('[data-booking-open]');
    const link = event.target.closest('a[href]');
    const url = link ? new URL(link.href, location.href) : null;
    const formLink = url && url.origin === location.origin && url.hash === '#consult';
    if (open || formLink) {
      event.preventDefault();
      bookingTrigger = open || link;
      if (!bookingDialog.open) bookingDialog.showModal();
    }
    if (event.target.closest('[data-booking-close]')) bookingDialog.close();
  });
  bookingDialog.addEventListener('click', event => {
    if (event.target !== bookingDialog) return;
    const bounds = bookingDialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) bookingDialog.close();
  });
  bookingDialog.addEventListener('close', () => bookingTrigger?.focus());
  if (location.hash === '#consult') bookingDialog.showModal();
}

// Preserve every article in the HTML for discovery and reveal twelve at a time.
const journal = document.querySelector('#journal');
if (journal) {
  const posts = [...journal.querySelectorAll('.blog-post')];
  const step = 12;
  if (posts.length > step) {
    let visible = step;
    const more = document.createElement('button');
    more.type = 'button';
    more.className = 'blog-more';
    more.setAttribute('aria-controls', 'journal-posts');
    journal.querySelector('.blog-post-list').id = 'journal-posts';
    const count = document.createElement('p');
    count.className = 'blog-count';
    count.setAttribute('role', 'status');
    const render = () => {
      posts.forEach((post, index) => post.hidden = index >= visible);
      count.textContent = `전체 ${posts.length}개 글 중 ${visible}개`;
      more.textContent = visible < posts.length ? `글 ${Math.min(step, posts.length - visible)}개 더 보기 +` : '접기 −';
      more.setAttribute('aria-expanded', String(visible === posts.length));
    };
    more.addEventListener('click', () => {
      const firstNew = visible;
      if (visible === posts.length) {
        visible = step;
        render();
        more.scrollIntoView({block:'center'});
      } else {
        visible = Math.min(posts.length, visible + step);
        render();
        posts[firstNew]?.focus({preventScroll:true});
      }
    });
    journal.append(count, more);
    render();
  }
}
