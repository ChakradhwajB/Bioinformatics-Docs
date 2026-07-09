import os
import re

def escape_underscores_in_math(text):
    # Regex to find block math $$ ... $$ (non-greedy, including newlines)
    def block_repl(match):
        math = match.group(0)
        # Escape underscores inside math, but don't double escape
        math_clean = re.sub(r'(?<!\\)_', r'\_', math)
        return math_clean
        
    # Regex to find inline math $ ... $
    # We use a negative lookbehind and lookahead to avoid matching $$ block markers
    def inline_repl(match):
        math = match.group(0)
        # Escape underscores inside math, but don't double escape
        math_clean = re.sub(r'(?<!\\)_', r'\_', math)
        return math_clean

    # Replace block math first
    text = re.sub(r'\$\$.*?\$\$', block_repl, text, flags=re.DOTALL)
    
    # Replace inline math (avoiding matching the $$ parts by matching single $ spans)
    # We match $ followed by non-$ characters, followed by $
    text = re.sub(r'(?<!\$)\$[^\$\n]+?\$(?!\$)', inline_repl, text)
    
    return text

def main():
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    docs_dir = os.path.join(base_dir, "docs")
    benchmarks_dir = os.path.join(base_dir, "benchmarks")
    
    targets = []
    
    # Find all md files in docs/
    for root, _, files in os.walk(docs_dir):
        for f in files:
            if f.endswith(".md"):
                targets.append(os.path.join(root, f))
                
    # Find all md files in benchmarks/
    for root, _, files in os.walk(benchmarks_dir):
        for f in files:
            if f.endswith(".md"):
                targets.append(os.path.join(root, f))

    for filepath in targets:
        print(f"Processing: {os.path.relpath(filepath, base_dir)}")
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()
            
        fixed_content = escape_underscores_in_math(content)
        
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(fixed_content)

    print("All subscript underscores inside math blocks have been successfully escaped!")

if __name__ == "__main__":
    main()
