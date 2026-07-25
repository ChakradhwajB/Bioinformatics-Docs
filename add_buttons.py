import os
from bs4 import BeautifulSoup

pages = ['io.html', 'genetics.html', 'kmers.html', 'find_motif.html', 'dot_plot.html', 'distances.html', 'needleman_wunsch.html', 'suffix_array.html', 'trie.html']

for page in pages:
    path = os.path.join('frontend', 'pages', page)
    if not os.path.exists(path): continue
    with open(path, 'r', encoding='utf-8') as f:
        soup = BeautifulSoup(f, 'html.parser')
    
    modified = False
    for bg in ['bg-emerald-50', 'bg-indigo-50', 'bg-rose-50']:
        divs = soup.find_all('div', class_=lambda c: c and bg in c.split())
        for div in divs:
            if not div.find('button', onclick="window.loadSandboxChallenge(this)"):
                btn = soup.new_tag('button', onclick="window.loadSandboxChallenge(this)", 
                                   class_="mt-2 text-[9px] font-bold bg-white border border-[rgba(0,0,0,0.1)] text-slate-700 px-2.5 py-1 rounded shadow-sm hover:bg-white/50 transition-colors uppercase tracking-wider")
                btn.append(BeautifulSoup("Try in Sandbox &rarr;", "html.parser"))
                div.append(btn)
                modified = True
                
    if modified:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(str(soup.prettify(formatter="html")))

print('Added Sandbox buttons to Practice Problems.')
