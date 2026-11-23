import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeCatalog,parseCatalogJson,parseRss,parseRssDates,replaceJournal,renderList} from '../scripts/sync-blog.mjs';
const post=(id,title='테스트 글')=>({logNo:id,title:encodeURIComponent(title).replace(/%20/g,'+'),addDate:'2026. 11. 16.'});
test('new posts accept Naver relative dates and prefer exact RSS Korean dates',()=>{
 const dates=parseRssDates('<rss><item><link>https://blog.naver.com/yhjo0720/123</link><pubDate>Sun, 22 Nov 2026 23:30:00 GMT</pubDate></item></rss>');
 const pages=[{resultCode:'S',totalCount:1,postList:[{...post('123'),addDate:'21시간 전'}]}];
 assert.equal(normalizeCatalog(pages,dates)[0].date,'2026.11.23');
 assert.equal(normalizeCatalog(pages)[0].date,'21시간 전');
 for(const label of ['5분 전','방금 전','어제']) {
  pages[0].postList[0].addDate=label;assert.equal(normalizeCatalog(pages)[0].date,label);
 }
 pages[0].postList[0].addDate='unexpected response';assert.throws(()=>normalizeCatalog(pages),/Invalid/);
});
test('all public pages must be complete and unique',()=>{
 const pages=[{resultCode:'S',totalCount:'2',postList:[post('1')]},{resultCode:'S',totalCount:'2',postList:[post('2')]}];
 assert.equal(normalizeCatalog(pages).length,2);
 assert.throws(()=>normalizeCatalog(pages.slice(0,1)),/Partial/);
 assert.throws(()=>normalizeCatalog([pages[0],pages[0]]),/duplicate/);
 assert.throws(()=>normalizeCatalog([{resultCode:'S',totalCount:'0',postList:[]}]),/Invalid/);
});
test('decode titles and normalize dates',()=>{
 const [p]=normalizeCatalog([{resultCode:'S',totalCount:1,postList:[post('123','클럽 & 그립 + 피팅')]}]);
 assert.equal(p.title,'클럽 & 그립 + 피팅');assert.equal(p.date,'2026.11.16');assert.equal(p.url,'https://blog.naver.com/yhjo0720/123');
});
test('RSS CDATA images and entities are parsed',()=>{
 const rss='<rss><item><link><![CDATA[https://blog.naver.com/yhjo0720/123?a=1]]></link><description><![CDATA[<img src="https://blogthumb.pstatic.net/a.jpg?x=1&amp;y=2" />]]></description></item></rss>';
 assert.equal(parseRss(rss).get('123'),'https://blogthumb.pstatic.net/a.jpg?x=1&y=2');
});
test('only journal is replaced; titles cannot inject markup',()=>{
 const p={title:'<script>bad</script>',url:'https://blog.naver.com/yhjo0720/123',date:'2026.11.16',image:'assets/example.png'};
 const html='<main>Keep</main><section id="journal"><div class="blog-post-list">old</div></section><footer>Preserve</footer>';
 const updated=replaceJournal(html,[p]);assert.ok(updated.startsWith('<main>Keep</main>'));assert.ok(updated.endsWith('<footer>Preserve</footer>'));assert.ok(updated.includes('&lt;script&gt;'));assert.ok(!renderList([p]).includes('<script>'));
 assert.throws(()=>replaceJournal('<main>no list</main>',[p]),/exactly one/);
});

test('Naver paging markup apostrophes are normalized without evaluating code',()=>{
 const raw=String.raw`{"totalCount":"1","pagingHtml":"onclick=\'go(1)\'"}`;assert.equal(parseCatalogJson(raw).totalCount,'1');assert.equal(parseCatalogJson(raw).pagingHtml,"onclick='go(1)'");
});
