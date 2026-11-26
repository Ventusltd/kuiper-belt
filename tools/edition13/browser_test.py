import json, os, threading, functools, http.server
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[2]
server=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(http.server.SimpleHTTPRequestHandler,directory=str(ROOT)))
threading.Thread(target=server.serve_forever,daemon=True).start()
base='http://127.0.0.1:'+str(server.server_port)
url=base+'/editions/202611261800/'
with sync_playwright() as p:
 for engine in ('chromium','webkit'):
  browser=getattr(p,engine).launch(**({'args':['--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader']} if engine=='chromium' else {}))
  for w,h in [(1440,900),(390,844),(844,390)]:
   page=browser.new_page(viewport={'width':w,'height':h})
   errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
   page.goto(url,wait_until='domcontentloaded')
   page.wait_for_function("window.KY?.inspect().done && window.KY?.hooks.N===97540883985",timeout=60000)
   assert page.locator('#kc-total').inner_text()=='97,540,883,985'
   assert page.locator('#kc-unique').inner_text()=='299,425'
   assert '83/95' in page.locator('#kc-coverage').inner_text()
   assert page.evaluate("window.KY.inspect().refused.length") == 0
   menu=page.locator('#kmb-title-file')
   menu.click(); assert menu.get_attribute('aria-expanded')=='true'
   assert page.locator('#kmb-panel-file').is_visible()
   page.screenshot(path=f'evidence/{engine}-{w}x{h}-FILE.png')
   menu.click();page.screenshot(path=f'evidence/{engine}-{w}x{h}.png')
   assert not errors,errors
   print(engine,w,h,'FILE and exact counters PASS')
   page.close()
  # A corrupted live pointer must fall back to sealed fixed edition, not invent a count.
  page=browser.new_page()
  page.route('**/live/current.json',lambda r:r.fulfill(status=200,json={'schema':'bad'}))
  page.goto(url+'?live=1')
  page.wait_for_function("window.KY?.hooks.N===97540883985")
  assert page.locator('#kuiper-census').get_attribute('data-state')=='stale'
  print(engine,'bad live pointer fallback PASS')
  browser.close()
server.shutdown()
