import os
from bs4 import BeautifulSoup

pages = ['io.html', 'genetics.html', 'kmers.html', 'find_motif.html', 'dot_plot.html', 'distances.html', 'needleman_wunsch.html', 'smith_waterman.html', 'trie.html', 'suffix_array.html']

for page in pages:
    path = os.path.join('frontend', 'pages', page)
    if not os.path.exists(path): continue
    with open(path, 'r', encoding='utf-8') as f:
        soup = BeautifulSoup(f, 'html.parser')
    
    modified = False
    main = soup.find('main')
    if main and not soup.find(id='sandbox-container'):
        sb_container = soup.new_tag('div', id='sandbox-container')
        quiz_container = soup.new_tag('div', id='quiz-container')
        main.append(sb_container)
        main.append(quiz_container)
        modified = True
        
    body = soup.find('body')
    if body and not soup.find('script', src="../src/sandbox.js"):
        script_quiz = soup.new_tag('script', src="../src/quiz.js")
        script_sandbox = soup.new_tag('script', src="../src/sandbox.js")
        body.append(script_quiz)
        body.append(script_sandbox)
        modified = True
        
    if modified:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(str(soup))

print('Updated all 10 module pages successfully.')
