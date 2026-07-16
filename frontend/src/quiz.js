const QUIZ_DATA = {
  "io.html": [
    {
      question: "What does the '>' character signify in a FASTA file?",
      options: ["The end of the file", "A sequence identifier/header line", "A comment line", "The start of an RNA sequence"],
      correctIndex: 1,
      hints: ["Not EOF.", "Look at how FASTA starts.", "FASTA doesn't use > for comments.", "It applies to DNA and proteins too."]
    },
    {
      question: "Which of the following characters is typically NOT found in a raw DNA FASTA sequence?",
      options: ["A", "C", "G", "Z"],
      correctIndex: 3,
      hints: ["A is Adenine.", "C is Cytosine.", "G is Guanine.", "Z is not a standard nucleotide."]
    },
    {
      question: "Why do we parse FASTA into JSON or structured objects in applications?",
      options: ["To compress the data", "To make it easier to query by ID and sequence", "To convert it to RNA", "Because browsers only read JSON"],
      correctIndex: 1,
      hints: ["JSON isn't compressed.", "Think about data structures.", "JSON doesn't do biological translation.", "Browsers can read text just fine."]
    }
  ],
  "genetics.html": [
    {
      question: "What is the reverse complement of 'ATGC'?",
      options: ["GCAT", "TACG", "CGTA", "ATGC"],
      correctIndex: 0,
      hints: ["Complement is TACG, but you must reverse it.", "This is just the complement, not reversed.", "Wait, C->G, G->C, T->A, A->T.", "It changes."]
    },
    {
      question: "During transcription, which nucleotide replaces Thymine (T)?",
      options: ["Adenine (A)", "Cytosine (C)", "Guanine (G)", "Uracil (U)"],
      correctIndex: 3,
      hints: ["No.", "No.", "No.", "RNA uses U instead of T."]
    },
    {
      question: "How many nucleotides make up a single codon?",
      options: ["1", "2", "3", "4"],
      correctIndex: 2,
      hints: ["Too small.", "Too small.", "Correct, a triplet.", "Too large."]
    }
  ],
  "kmers.html": [
    {
      question: "How many 3-mers are in the sequence 'GATTACA'?",
      options: ["4", "5", "6", "7"],
      correctIndex: 1,
      hints: ["Count them: GAT, ATT, TTA, TAC, ACA. That's 5.", "Yes.", "Too high.", "Too high."]
    },
    {
      question: "What is the formula for the number of k-mers in a sequence of length N?",
      options: ["N / k", "N - k", "N - k + 1", "N * k"],
      correctIndex: 2,
      hints: ["No.", "Close.", "Correct.", "No."]
    },
    {
      question: "Why do we use k-mers in bioinformatics?",
      options: ["To make the sequence shorter", "To build frequency profiles and find repeats", "To translate to proteins", "To delete mutations"],
      correctIndex: 1,
      hints: ["It actually increases data size sometimes.", "Yes, k-mer profiling is key for analysis.", "That's translation.", "No."]
    }
  ],
  "find_motif.html": [
    {
      question: "What does motif finding typically try to locate?",
      options: ["Random mutations", "Conserved, recurring subsequences", "Stop codons", "The exact center of the genome"],
      correctIndex: 1,
      hints: ["Mutations are usually random, motifs are conserved.", "Yes, motifs are conserved patterns.", "Stop codons are specific, motifs are general.", "Location doesn't matter."]
    },
    {
      question: "If searching for motif 'ATA' in 'GATATATA', what are the 0-indexed start positions?",
      options: ["1, 3, 5", "1, 4", "2, 4, 6", "1, 3"],
      correctIndex: 0,
      hints: ["Correct. G(ATA)TATA at 1, GAT(ATA)TA at 3, GATAT(ATA) at 5.", "Overlapping is allowed.", "0-indexed means G is 0.", "Overlapping is allowed."]
    },
    {
      question: "Why is motif finding important?",
      options: ["It identifies potential regulatory binding sites", "It compresses the genome", "It creates proteins", "It deletes junk DNA"],
      correctIndex: 0,
      hints: ["Yes, transcription factors bind to motifs.", "No.", "No.", "No."]
    }
  ],
  "dot_plot.html": [
    {
      question: "In a dot plot matrix, what does a diagonal line of dots represent?",
      options: ["A region of continuous sequence match", "A gap in the sequence", "A point mutation", "End of sequence"],
      correctIndex: 0,
      hints: ["Yes, a diagonal means i+1 matches j+1 sequentially.", "No.", "No.", "No."]
    },
    {
      question: "If a dot plot is completely empty, what does it mean?",
      options: ["The sequences are identical", "The sequences have no matching characters", "The program crashed", "The sequences are too long"],
      correctIndex: 1,
      hints: ["Identical would have a main diagonal.", "Correct.", "No.", "No."]
    },
    {
      question: "What is a 'window size' (k) in dot plots used for?",
      options: ["To make the plot smaller", "To filter out noise by requiring 'k' matches in a row", "To change the colors", "To speed up calculation"],
      correctIndex: 1,
      hints: ["No.", "Yes, it reduces background noise.", "No.", "No."]
    }
  ],
  "distances.html": [
    {
      question: "Hamming distance can only be calculated if:",
      options: ["The sequences are identical", "The sequences have the same length", "The sequences are DNA", "The sequences have no gaps"],
      correctIndex: 1,
      hints: ["No.", "Yes, Hamming requires equal length.", "No.", "No."]
    },
    {
      question: "Levenshtein distance allows which of the following operations?",
      options: ["Insertions and Deletions only", "Substitutions only", "Insertions, Deletions, and Substitutions", "Reversals"],
      correctIndex: 2,
      hints: ["No.", "No.", "Correct.", "No."]
    },
    {
      question: "What is the Hamming distance between 'ATCG' and 'ATCC'?",
      options: ["0", "1", "2", "3"],
      correctIndex: 1,
      hints: ["No.", "Yes, only the last character differs.", "No.", "No."]
    }
  ],
  "needleman_wunsch.html": [
    {
      question: "Needleman-Wunsch is an algorithm for:",
      options: ["Local Alignment", "Global Alignment", "Motif Finding", "Transcription"],
      correctIndex: 1,
      hints: ["No, that's Smith-Waterman.", "Yes, end-to-end alignment.", "No.", "No."]
    },
    {
      question: "In the DP matrix initialization for NW, the first row and column are filled with:",
      options: ["Zeros", "Increasing gap penalties (0, -1, -2...)", "Match scores", "Random numbers"],
      correctIndex: 1,
      hints: ["No, that's SW.", "Yes, because global alignment must account for leading gaps.", "No.", "No."]
    },
    {
      question: "Which cell do you start traceback from in Needleman-Wunsch?",
      options: ["Top-left (0,0)", "Bottom-right (n,m)", "The cell with the highest score", "The first non-zero cell"],
      correctIndex: 1,
      hints: ["No.", "Yes, it must be end-to-end.", "No, that's SW.", "No."]
    }
  ],
  "smith_waterman.html": [
    {
      question: "Smith-Waterman is an algorithm for:",
      options: ["Local Alignment", "Global Alignment", "Motif Finding", "Transcription"],
      correctIndex: 0,
      hints: ["Yes, finding matching subregions.", "No, that's NW.", "No.", "No."]
    },
    {
      question: "What is the key difference in the transition rule for SW compared to NW?",
      options: ["Scores are capped at 0 (no negative scores)", "Gaps are free", "Mismatches give positive points", "It only uses RNA"],
      correctIndex: 0,
      hints: ["Yes, this allows starting a new local alignment anywhere.", "No.", "No.", "No."]
    },
    {
      question: "Where does traceback begin in Smith-Waterman?",
      options: ["Top-left (0,0)", "Bottom-right (n,m)", "The absolute highest scoring cell in the matrix", "The lowest scoring cell"],
      correctIndex: 2,
      hints: ["No.", "No, that's NW.", "Yes, the peak of the local alignment.", "No."]
    }
  ],
  "trie.html": [
    {
      question: "What is a Trie primarily used for?",
      options: ["Sorting arrays", "Storing and retrieving a set of strings/prefixes efficiently", "Calculating edit distance", "Graph traversal"],
      correctIndex: 1,
      hints: ["No.", "Yes, Prefix Tree.", "No.", "No."]
    },
    {
      question: "If we insert 'CAT' and 'CAR' into a Trie, how many nodes (including root) will be created?",
      options: ["6", "7", "5", "8"],
      correctIndex: 2,
      hints: ["No.", "No.", "Root -> C -> A -> T and R. Total 5 nodes.", "No."]
    },
    {
      question: "What is the time complexity of searching a text of length N for max pattern length L using a Trie?",
      options: ["O(N^2)", "O(N * L)", "O(L)", "O(N)"],
      correctIndex: 1,
      hints: ["No.", "Yes, traversing down L steps for each of N positions.", "No.", "No."]
    }
  ],
  "suffix_array.html": [
    {
      question: "What is a Suffix Array?",
      options: ["An array of prefixes", "A lexicographically sorted array of all suffixes of a string", "An array of random substrings", "A hash table of k-mers"],
      correctIndex: 1,
      hints: ["No.", "Yes, sorted suffixes.", "No.", "No."]
    },
    {
      question: "Why do we append a sentinel character like '$' before building a suffix array?",
      options: ["To mark the start", "Because python requires it", "To ensure no suffix is a prefix of another suffix", "To make it look cool"],
      correctIndex: 2,
      hints: ["No.", "No.", "Yes, it makes sorting unambiguous.", "No."]
    },
    {
      question: "How do we search for a pattern in a Suffix Array?",
      options: ["Linear scan", "Binary search", "Hashing", "Dynamic programming"],
      correctIndex: 1,
      hints: ["Too slow.", "Yes, since the array is sorted.", "No.", "No."]
    }
  ]
};

document.addEventListener("DOMContentLoaded", () => {
  let pageName = window.location.pathname.split("/").pop() || "index.html";
  if (!pageName.endsWith(".html")) pageName += ".html";

  const quizData = QUIZ_DATA[pageName];
  if (!quizData) return;

  const container = document.getElementById("quiz-container");
  if (!container) return;

  const checkbox = document.getElementById("page-complete-checkbox");
  const isPassed = localStorage.getItem(`quiz_passed_${pageName}`) === "true";
  
  // Quiz is now optional for mastery check only, so we no longer disable the checkbox.
  
  renderQuiz(container, quizData, pageName, checkbox, isPassed);
});

function renderQuiz(container, questions, pageName, checkbox, initiallyPassed) {
  let html = `
    <details class="max-w-6xl mx-auto w-full bg-transparent border-0 rounded-none shadow-none mt-6 group">
      <summary class="flex items-center justify-between px-6 py-4 cursor-pointer select-none outline-none">
        <h3 class="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center">
          <svg class="w-4 h-4 mr-1.5 text-indigo-500 transition-transform group-open:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
          Knowledge Check (Optional)
        </h3>
        ${initiallyPassed ? '<span class="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded uppercase tracking-wider">Passed</span>' : '<span class="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded uppercase tracking-wider" id="quiz-status-badge">Click to Expand</span>'}
      </summary>
      <div class="p-6 pt-0 space-y-6 border-t border-slate-100 mt-2" id="quiz-questions-wrapper">
  `;

  questions.forEach((q, qIndex) => {
    html += `
      <div class="quiz-question" data-qindex="${qIndex}">
        <p class="text-xs font-semibold text-slate-800 mb-2">${qIndex + 1}. ${q.question}</p>
        <div class="space-y-1.5 ml-1">
    `;
    q.options.forEach((opt, oIndex) => {
      html += `
          <label class="flex items-center space-x-2 text-[11px] text-slate-700 cursor-pointer hover:bg-slate-50 p-1.5 rounded transition-colors group border border-transparent hover:border-slate-200">
            <input type="radio" name="q${qIndex}" value="${oIndex}" class="text-indigo-600 focus:ring-indigo-500 cursor-pointer">
            <span class="flex-grow">${opt}</span>
          </label>
      `;
    });
    html += `
        </div>
        <div class="quiz-hint hidden mt-2 text-[10px] font-medium p-2 rounded bg-slate-50 border-l-2 border-slate-300 text-slate-600"></div>
      </div>
    `;
  });

  html += `
      </div>
      <div class="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center space-x-3 rounded-b-sm">
        <button id="submit-quiz-btn" class="bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold py-1.5 px-4 rounded shadow-none transition-colors uppercase tracking-wider">
          Submit Answers
        </button>
        <span id="quiz-result-text" class="text-[11px] font-bold"></span>
      </div>
    </details>
  `;

  container.innerHTML = html;

  const submitBtn = document.getElementById("submit-quiz-btn");
  submitBtn.addEventListener("click", () => {
    let score = 0;
    const questionsWrapper = document.getElementById("quiz-questions-wrapper");
    const questionDivs = questionsWrapper.querySelectorAll(".quiz-question");
    
    questionDivs.forEach((qDiv) => {
      const qIndex = parseInt(qDiv.getAttribute("data-qindex"));
      const selected = qDiv.querySelector(`input[name="q${qIndex}"]:checked`);
      const hintDiv = qDiv.querySelector(".quiz-hint");
      
      if (!selected) {
        hintDiv.textContent = "Please select an answer.";
        hintDiv.className = "quiz-hint mt-2 text-[10px] font-medium p-2 rounded bg-amber-50 border-l-2 border-amber-400 text-amber-700 block";
        return;
      }

      const selectedVal = parseInt(selected.value);
      const isCorrect = selectedVal === questions[qIndex].correctIndex;

      if (isCorrect) {
        score++;
        hintDiv.textContent = "Correct!";
        hintDiv.className = "quiz-hint mt-2 text-[10px] font-bold p-2 rounded bg-emerald-50 border-l-2 border-emerald-400 text-emerald-700 block";
      } else {
        hintDiv.textContent = "Incorrect: " + questions[qIndex].hints[selectedVal];
        hintDiv.className = "quiz-hint mt-2 text-[10px] font-medium p-2 rounded bg-rose-50 border-l-2 border-rose-400 text-rose-700 block";
      }
    });

    const resultText = document.getElementById("quiz-result-text");
    const percentage = Math.round((score / questions.length) * 100);
    
    if (percentage >= 80) {
      resultText.textContent = `You scored ${score}/${questions.length} (${percentage}%). Passed!`;
      resultText.className = "text-[11px] font-bold text-emerald-600";
      localStorage.setItem(`quiz_passed_${pageName}`, "true");
      
      const badge = document.getElementById("quiz-status-badge");
      if (badge) {
        badge.outerHTML = '<span class="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded uppercase tracking-wider">Passed</span>';
      }
    } else {
      resultText.textContent = `You scored ${score}/${questions.length} (${percentage}%). 80% required to pass.`;
      resultText.className = "text-[11px] font-bold text-rose-600";
    }
  });
}
