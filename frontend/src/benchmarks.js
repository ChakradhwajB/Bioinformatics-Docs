document.addEventListener("DOMContentLoaded", () => {
  const lengthSlider = document.getElementById("seq-length");
  const lengthVal = document.getElementById("length-val");
  const runBtn = document.getElementById("run-btn");

  if (lengthSlider && lengthVal) {
    lengthSlider.addEventListener("input", (e) => {
      lengthVal.textContent = e.target.value;
    });
  }

  if (runBtn) {
    runBtn.addEventListener("click", runLiveBenchmark);
  }
});

// Generate random DNA sequences of a given length
function generateRandomDNA(len) {
  const alphabet = ["A", "C", "G", "T"];
  let res = "";
  for (let i = 0; i < len; i++) {
    res += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return res;
}

let naiveCallCount = 0;
function naiveLevenshtein(s1, s2, i, j) {
  naiveCallCount++;
  if (i === 0) return j;
  if (j === 0) return i;

  if (s1[i - 1] === s2[j - 1]) {
    return naiveLevenshtein(s1, s2, i - 1, j - 1);
  }

  return 1 + Math.min(
    naiveLevenshtein(s1, s2, i - 1, j),       // Deletion
    naiveLevenshtein(s1, s2, i, j - 1),       // Insertion
    naiveLevenshtein(s1, s2, i - 1, j - 1)    // Substitution
  );
}

let dpOpCount = 0;
function dpLevenshtein(s1, s2) {
  const n = s1.length;
  const m = s2.length;
  const dp = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0));

  for (let i = 0; i <= n; i++) {
    dp[i][0] = i;
    dpOpCount++;
  }
  for (let j = 0; j <= m; j++) {
    dp[0][j] = j;
    dpOpCount++;
  }

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      dpOpCount++;
      if (s1[i - 1] === s2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(
          dp[i - 1][j],
          dp[i][j - 1],
          dp[i - 1][j - 1]
        );
      }
    }
  }
  return dp[n][m];
}

async function runLiveBenchmark() {
  const runBtn = document.getElementById("run-btn");
  const lengthSlider = document.getElementById("seq-length");
  const maxN = parseInt(lengthSlider.value);

  runBtn.disabled = true;
  runBtn.textContent = "Simulating...";
  runBtn.classList.add("opacity-50");

  const naiveCallsEl = document.getElementById("naive-calls");
  const naiveTimeEl = document.getElementById("naive-time");
  const dpOpsEl = document.getElementById("dp-ops");
  const dpTimeEl = document.getElementById("dp-time");

  const naiveBar = document.getElementById("naive-stack-bar");
  const dpBar = document.getElementById("dp-ops-bar");

  // Reset UI
  naiveCallsEl.textContent = "-";
  naiveTimeEl.textContent = "-";
  dpOpsEl.textContent = "-";
  dpTimeEl.textContent = "-";
  naiveBar.style.width = "0%";
  dpBar.style.width = "0%";

  // Generate sequences
  const s1 = generateRandomDNA(maxN);
  const s2 = generateRandomDNA(maxN);

  // 1. Run Dynamic Programming (instantly)
  dpOpCount = 0;
  const t0_dp = performance.now();
  dpLevenshtein(s1, s2);
  const t1_dp = performance.now();
  const dpTime = t1_dp - t0_dp;

  dpOpsEl.textContent = dpOpCount.toLocaleString();
  dpTimeEl.textContent = dpTime.toFixed(4) + " ms";
  dpBar.style.width = "100%";

  // 2. Run Naive Recursion in setTimeout to let UI update
  naiveCallCount = 0;
  naiveBar.style.width = "40%";
  
  // Await small deferral for visual effect
  await new Promise(r => setTimeout(r, 400));

  const t0_naive = performance.now();
  naiveLevenshtein(s1, s2, maxN, maxN);
  const t1_naive = performance.now();
  const naiveTime = t1_naive - t0_naive;

  naiveCallsEl.textContent = naiveCallCount.toLocaleString();
  naiveTimeEl.textContent = naiveTime.toFixed(4) + " ms";
  naiveBar.style.width = "100%";

  // 3. Draw live SVG curve comparison for points 1 to maxN
  drawComplexityChart(maxN);

  runBtn.disabled = false;
  runBtn.textContent = "Run Live Comparison";
  runBtn.classList.remove("opacity-50");
}

function drawComplexityChart(maxN) {
  const svg = document.getElementById("complexity-graph");
  const naivePath = document.getElementById("naive-path");
  const dpPath = document.getElementById("dp-path");
  const pointsContainer = document.getElementById("data-points");

  pointsContainer.innerHTML = "";

  const naiveCoords = [];
  const dpCoords = [];

  // Calculate scales
  // X: maps 1 to maxN into range [40, 480]
  // Y: maps 0 to maxOperations into range [200, 20]
  const xStart = 40;
  const xEnd = 480;
  const yStart = 200;
  const yEnd = 20;

  // Let's compute calls for lengths 1 to maxN
  for (let l = 1; l <= maxN; l++) {
    // Generate dummy matching strands for consistent curves
    const str1 = "A".repeat(l);
    const str2 = "T".repeat(l); // all mismatches = worst case

    // Naive count
    naiveCallCount = 0;
    naiveLevenshtein(str1, str2, l, l);
    const naiveVal = naiveCallCount;

    // DP count
    dpOpCount = 0;
    dpLevenshtein(str1, str2);
    const dpVal = dpOpCount;

    naiveCoords.push({ n: l, val: naiveVal });
    dpCoords.push({ n: l, val: dpVal });
  }

  // Max value for scaling Y axis
  const maxVal = Math.max(...naiveCoords.map(c => c.val));

  const getX = (n) => xStart + ((n - 1) / (maxN - 1 || 1)) * (xEnd - xStart);
  const getY = (val) => yStart - (val / (maxVal || 1)) * (yStart - yEnd);

  // Build SVG path strings
  let naiveD = "";
  let dpD = "";

  naiveCoords.forEach((pt, idx) => {
    const x = getX(pt.n);
    const y = getY(pt.val);
    if (idx === 0) naiveD += `M ${x} ${y}`;
    else naiveD += ` L ${x} ${y}`;

    // Add dots
    createSvgDot(x, y, "#f43f5e", `Naive (N=${pt.n}): ${pt.val} calls`, pointsContainer);
  });

  dpCoords.forEach((pt, idx) => {
    const x = getX(pt.n);
    const y = getY(pt.val);
    if (idx === 0) dpD += `M ${x} ${y}`;
    else dpD += ` L ${x} ${y}`;

    // Add dots
    createSvgDot(x, y, "#10b981", `DP (N=${pt.n}): ${pt.val} ops`, pointsContainer);
  });

  naivePath.setAttribute("d", naiveD);
  dpPath.setAttribute("d", dpD);
}

function createSvgDot(cx, cy, color, tooltipText, container) {
  const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  circle.setAttribute("cx", cx);
  circle.setAttribute("cy", cy);
  circle.setAttribute("r", "4");
  circle.setAttribute("fill", color);
  circle.setAttribute("class", "cursor-pointer hover:r-6 transition-all duration-150");

  const title = document.createElementNS("http://www.w3.org/2000/svg", "title");
  title.textContent = tooltipText;
  circle.appendChild(title);

  container.appendChild(circle);
}
