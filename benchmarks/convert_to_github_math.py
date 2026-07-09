import os
import re

def convert_blocks_to_github_math(text):
    # Regex to find block math $$ ... $$ (non-greedy, including newlines)
    def block_repl(match):
        # Extract the inner math content
        math_content = match.group(1).strip()
        
        # Restore escaped underscores (\_) to standard underscores (_)
        math_content = re.sub(r'\\_', '_', math_content)
        
        # Restore multiple backslashes to standard double backslashes (\\)
        # We replace any sequence of 4 backslashes with 2 backslashes
        math_content = re.sub(r'\\\\\\\\', r'\\\\', math_content)
        math_content = re.sub(r'(?<!\\)\\\\(?!\\)', r'\\\\', math_content)
        
        return f"```math\n{math_content}\n```"

    # Replace block math $$ ... $$ with ```math ... ```
    text = re.sub(r'\$\$(.*?)\$\$', block_repl, text, flags=re.DOTALL)
    return text

def main():
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    docs_dir = os.path.join(base_dir, "docs")
    benchmarks_dir = os.path.join(base_dir, "benchmarks")
    artifacts_dir = "C:\\Users\\gamer\\.gemini\\antigravity-cli\\brain\\cb3795ac-0c45-4ee9-bd7c-2e1d0f399069"
    
    targets = []
    
    # Add files in docs/
    for root, _, files in os.walk(docs_dir):
        for f in files:
            if f.endswith(".md"):
                targets.append(os.path.join(root, f))
                
    # Add files in benchmarks/
    for root, _, files in os.walk(benchmarks_dir):
        for f in files:
            if f.endswith(".md"):
                targets.append(os.path.join(root, f))
                
    # Add files in artifacts directory
    if os.path.exists(artifacts_dir):
        for f in os.listdir(artifacts_dir):
            if f.endswith(".md"):
                targets.append(os.path.join(artifacts_dir, f))

    for filepath in targets:
        print(f"Processing: {filepath}")
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()
            
        fixed_content = convert_blocks_to_github_math(content)
        
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(fixed_content)

    print("All block math blocks successfully converted to GitHub's native ```math blocks!")

if __name__ == "__main__":
    main()
