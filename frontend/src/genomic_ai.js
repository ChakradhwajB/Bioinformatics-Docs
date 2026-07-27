// Client-side interactive implementation for Genomic AI & Deep Learning Visualizer

let aiState = {
  seq: "TATAAAAGGCCGCTAGCTAGCTAGCTAGGCTAATGCCATGGGAA",
  currentStep: -1,
  isPlaying: false,
  playTimer: null,
  totalSteps: 4
};

document.addEventListener("DOMContentLoaded", () => {
  const predictBtn = document.getElementById("predict-btn") || document.getElementById("encode-btn");
  const sampleBtn = document.getElementById("sample-btn");

  const playBtn = document.getElementById("player-play");
  const prevBtn = document.getElementById("player-prev");
  const nextBtn = document.getElementById("player-next");
  const resetBtn = document.getElementById("player-reset");

  if (predictBtn) predictBtn.addEventListener("click", runGenomicAIInference);

  if (sampleBtn) {
    sampleBtn.addEventListener("click", () => {
      const seqInput = document.getElementById("dna-seq-input") || document.getElementById("seq-input");
      if (seqInput) seqInput.value = "TATAAAAGGCCGCTAGCTAGCTAGCTAGGCTAATGCCATGGGAA";
      runGenomicAIInference();
    });
  }

  if (playBtn) playBtn.addEventListener("click", togglePlay);
  if (prevBtn) prevBtn.addEventListener("click", stepPrev);
  if (nextBtn) nextBtn.addEventListener("click", stepNext);
  if (resetBtn) resetBtn.addEventListener("click", stepReset);

  runGenomicAIInference();
});

function runGenomicAIInference() {
  stopPlayback();
  const seqInput = document.getElementById("dna-seq-input") || document.getElementById("seq-input");
  if (!seqInput) return;

  const seq = (seqInput.value || "TATAAAAGGCCGCTAGCTAGCTAGCTAGGCTAATGCCATGGGAA").toUpperCase().trim();
  if (!seq) return;

  aiState = {
    seq,
    currentStep: -1,
    isPlaying: false,
    playTimer: null,
    totalSteps: 4
  };

  updateInspectorText();
  renderModelOutput();
}

function renderModelOutput() {
  const outputContainer = document.getElementById("model-output-container") || document.getElementById("output-console");
  if (!outputContainer) return;

  const { seq, currentStep } = aiState;
  const L = seq.length;

  const map = { 'A': [1,0,0,0], 'C': [0,1,0,0], 'G': [0,0,1,0], 'T': [0,0,0,1] };
  const oneHot = seq.split("").map(c => map[c] || [0,0,0,0]);

  const hasTATA = seq.includes("TATAAA");
  const tataScore = hasTATA ? 0.94 : 0.21;
  const promoterProb = Math.min(0.99, tataScore + (L > 30 ? 0.05 : 0.01));

  let outputText = `[GENOMIC AI FORWARD PASS EXECUTION]\n`;
  outputText += `Input DNA Sequence Length: ${L} bp\n\n`;

  if (currentStep === -1 || currentStep === 0) {
    outputText += `--- LAYER 1: ONE-HOT TENSOR ENCODING ---\n`;
    outputText += `Tensor Shape: [1, ${L}, 4]\n`;
    outputText += `First 8 Base Vectors:\n`;
    oneHot.slice(0, 8).forEach((vec, idx) => {
      outputText += `  Pos ${idx} (${seq[idx]}): [${vec.join(", ")}]\n`;
    });
  }

  if (currentStep === -1 || currentStep === 1) {
    outputText += `\n--- LAYER 2: 1D CNN MOTIF DETECTOR ---\n`;
    outputText += `Kernel Size k=6, 128 Filters, ReLU Activation\n`;
    outputText += `Motif Detector Results: ${hasTATA ? "TATA-box Promoter Motif Detected (ReLU Score: +4.82)" : "No Canonical TATA-box Detected (ReLU Score: 0.00)"}\n`;
  }

  if (currentStep === -1 || currentStep === 2) {
    outputText += `\n--- LAYER 3: TRANSFORMER MULTI-HEAD SELF-ATTENTION ---\n`;
    outputText += `Embedding Dim d_model=128, 4 Attention Heads\n`;
    outputText += `Softmax Attention Matrix: max(QK^T / sqrt(d_k)) = 0.887 (Long-Range Enhancer Link)\n`;
  }

  if (currentStep === -1 || currentStep === 3) {
    outputText += `\n--- LAYER 4: CLASSIFICATION / VARIANT EFFECT PREDICTION ---\n`;
    outputText += `Linear Output Layer + Sigmoid Activation\n`;
    outputText += `Predicted Active Promoter Probability: ${(promoterProb * 100).toFixed(1)}%\n`;
    outputText += `Interpretation: ${promoterProb > 0.5 ? "HIGH CONFIDENCE PROMOTER REGION" : "INACTIVE INTERGENIC REGION"}\n`;
  }

  outputContainer.innerHTML = `<pre class="text-indigo-950 font-mono text-xs font-bold leading-relaxed whitespace-pre-wrap bg-slate-50/80 p-4 rounded-xl border border-slate-200 shadow-xs">${outputText}</pre>`;
}

function updateInspectorText() {
  const inspector = document.getElementById("ai-inspector");
  if (!inspector) return;

  const { seq, currentStep } = aiState;

  if (currentStep === -1) {
    inspector.innerHTML = `<strong>Genomic AI Model Loaded:</strong> Input Sequence (${seq.length} bp). Click <strong>Play Model Forward Pass</strong> to step through neural network layers.`;
  } else {
    const layerNames = [
      "Layer 1: One-Hot Tensor Encoding (4xL Matrix)",
      "Layer 2: 1D CNN Motif Scanning (PWM Convolution)",
      "Layer 3: Transformer Self-Attention (Softmax Weighting)",
      "Layer 4: Classification Output (Sigmoid Probability)"
    ];
    inspector.innerHTML = `<strong>Step ${currentStep + 1} / 4:</strong> Executing <code class="text-indigo-600 font-bold font-mono">${layerNames[currentStep]}</code>.`;
  }
}

function togglePlay() {
  const playBtn = document.getElementById("player-play");
  if (aiState.isPlaying) {
    stopPlayback();
  } else {
    if (aiState.currentStep >= aiState.totalSteps - 1) {
      aiState.currentStep = -1;
    }
    aiState.isPlaying = true;
    if (playBtn) playBtn.textContent = "Pause";
    aiState.playTimer = setInterval(() => {
      if (aiState.currentStep < aiState.totalSteps - 1) {
        aiState.currentStep++;
        updateInspectorText();
        renderModelOutput();
      } else {
        stopPlayback();
      }
    }, 1000);
  }
}

function stopPlayback() {
  aiState.isPlaying = false;
  if (aiState.playTimer) {
    clearInterval(aiState.playTimer);
    aiState.playTimer = null;
  }
  const playBtn = document.getElementById("player-play");
  if (playBtn) playBtn.textContent = "Play Model Forward Pass";
}

function stepNext() {
  stopPlayback();
  if (aiState.currentStep < aiState.totalSteps - 1) {
    aiState.currentStep++;
    updateInspectorText();
    renderModelOutput();
  }
}

function stepPrev() {
  stopPlayback();
  if (aiState.currentStep > 0) {
    aiState.currentStep--;
    updateInspectorText();
    renderModelOutput();
  }
}

function stepReset() {
  stopPlayback();
  aiState.currentStep = -1;
  updateInspectorText();
  renderModelOutput();
}
