document.addEventListener("DOMContentLoaded", () => {
    const btnProcess = document.getElementById("btnProcess");
    const textInput = document.getElementById("textInput");
    const resultTableBody = document.querySelector("#resultTable tbody");
    const treeSvg = document.getElementById("treeSvg");
    const compressionStats = document.getElementById("compressionStats");
    const manualCalcBox = document.getElementById("manualCalcBox");
    const quizChips = document.querySelectorAll(".chip-btn");

    const btnPrevStep = document.getElementById("btnPrevStep");
    const btnPlayPause = document.getElementById("btnPlayPause");
    const btnNextStep = document.getElementById("btnNextStep");
    const stepIndicator = document.getElementById("stepIndicator");

    let stepCombinations = []; // Timeline status gabungan per langkah
    let currentStepIndex = 0;   
    let autoPlayInterval = null;

    if (btnProcess) {
        btnProcess.addEventListener("click", () => {
            const text = textInput.value.toUpperCase();
            if (!text) { alert("Teks tidak boleh kosong!"); return; }
            stopAutoPlay();
            processHuffman(text);
        });

        quizChips.forEach(chip => {
            chip.addEventListener("click", () => {
                textInput.value = chip.getAttribute("data-text");
                stopAutoPlay();
                processHuffman(textInput.value);
            });
        });

        btnNextStep.addEventListener("click", () => {
            stopAutoPlay();
            if (currentStepIndex < stepCombinations.length - 1) {
                currentStepIndex++;
                renderTreeFromSteps();
            }
        });

        btnPrevStep.addEventListener("click", () => {
            stopAutoPlay();
            if (currentStepIndex > 0) {
                currentStepIndex--;
                renderTreeFromSteps();
            }
        });

        btnPlayPause.addEventListener("click", () => {
            if (autoPlayInterval) {
                stopAutoPlay();
            } else {
                startAutoPlay();
            }
        });
        
        processHuffman(textInput.value);
    }

    function processHuffman(text) {
        const freqMap = {};
        for (let char of text) { freqMap[char] = (freqMap[char] || 0) + 1; }

        // Bangun antrean awal node dengan ID acak yang unik stabil
        let queue = Object.keys(freqMap).map(char => ({
            id: 'leaf_' + char + '_' + Math.random().toString(36).substr(2, 5),
            char,
            freq: freqMap[char],
            left: null,
            right: null
        }));

        if (queue.length === 0) return;

        // Urutkan alfabet dasar asli
        queue.sort((a, b) => a.freq - b.freq || a.char.localeCompare(b.char));

        let mergeHistory = [];
        let root;

        if (queue.length === 1) {
            root = {
                id: 'root_single_' + Math.random().toString(36).substr(2, 5),
                char: null, freq: queue[0].freq, left: queue[0], right: null
            };
            mergeHistory.push({ parentId: root.id, leftId: queue[0].id, rightId: null });
        } else {
            // Jalankan algoritma huffman murni dan simpan riwayat kronologis penggabungan rumpun
            let forest = [...queue];
            while (forest.length > 1) {
                forest.sort((a, b) => a.freq - b.freq);
                const left = forest.shift();
                const right = forest.shift();
                
                const parent = {
                    id: 'internal_' + left.freq + '_' + right.freq + '_' + Math.random().toString(36).substr(2, 5),
                    char: null,
                    freq: left.freq + right.freq,
                    left,
                    right
                };
                
                mergeHistory.push({ parentId: parent.id, leftId: left.id, rightId: right.id });
                forest.push(parent);
            }
            root = forest[0];
        }

        // Tentukan nilai koordinat absolut tunggal untuk seluruh pohon agar tidak terputus/meloncat
        let coords = {};
        let edges = [];
        
        function assignCoords(node, depth, xStart, xEnd) {
            if (!node) return;
            const x = (xStart + xEnd) / 2;
            const y = 50 + depth * 75;

            coords[node.id] = {
                id: node.id, x, y, isLeaf: node.char !== null,
                label: node.char ? `${node.char === " " ? "Spc" : node.char}:${node.freq}` : `${node.freq}`
            };

            if (node.left) {
                edges.push({ parentId: node.id, childId: node.left.id, bit: "0", x1: x, y1: y, x2: (xStart + x) / 2, y2: 50 + (depth + 1) * 75 });
                assignCoords(node.left, depth + 1, xStart, x);
            }
            if (node.right) {
                edges.push({ parentId: node.id, childId: node.right.id, bit: "1", x1: x, y1: y, x2: (x + xEnd) / 2, y2: 50 + (depth + 1) * 75 });
                assignCoords(node.right, depth + 1, x, xEnd);
            }
        }
        assignCoords(root, 0, 40, 760);

        // Buat Array Timeline Simulasi Berurutan (Step 0: Daun Saja -> Step Akhir: Pohon Utuh)
        stepCombinations = [];
        let leafNodesOnly = Object.values(coords).filter(c => c.isLeaf);
        
        // Simpan Langkah Awal (0)
        stepCombinations.push({ nodes: [...leafNodesOnly], edges: [] });

        let currentNodes = [...leafNodesOnly];
        let currentEdges = [];

        // Masukkan rumpun per gabungan induk ke riwayat langkah
        mergeHistory.forEach(merge => {
            const pNode = coords[merge.parentId];
            if (pNode) currentNodes.push(pNode);

            const eLeft = edges.find(e => e.parentId === merge.parentId && e.childId === merge.leftId);
            if (eLeft) currentEdges.push(eLeft);

            const eRight = edges.find(e => e.parentId === merge.parentId && e.childId === merge.rightId);
            if (eRight) currentEdges.push(eRight);

            stepCombinations.push({
                nodes: [...currentNodes],
                edges: [...currentEdges]
            });
        });

        // Generate teks kode awalan
        const codes = {};
        function generateCodes(node, currentCode) {
            if (!node) return;
            if (node.char !== null) { codes[node.char] = currentCode || "0"; return; }
            generateCodes(node.left, currentCode + "0");
            generateCodes(node.right, currentCode + "1");
        }
        generateCodes(root, "");

        updateUI(text, freqMap, codes);
        
        // Atur posisi awal langsung ke langkah terakhir (pohon lengkap)
        currentStepIndex = stepCombinations.length - 1;
        renderTreeFromSteps();
    }

    function renderTreeFromSteps() {
        treeSvg.innerHTML = "";
        if (stepCombinations.length === 0) return;

        stepIndicator.textContent = `Langkah: ${currentStepIndex} / ${stepCombinations.length - 1}`;
        
        const activeState = stepCombinations[currentStepIndex];
        if (!activeState) return;

        // 1. Render Sisi Garis Penghubung Terlebih Dahulu
        activeState.edges.forEach(edge => {
            const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
            line.setAttribute("x1", edge.x1); line.setAttribute("y1", edge.y1);
            line.setAttribute("x2", edge.x2); line.setAttribute("y2", edge.y2);
            line.setAttribute("stroke", "#fda4af"); line.setAttribute("stroke-width", "2.5");
            line.setAttribute("class", "svg-edge");
            treeSvg.appendChild(line);

            const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
            text.setAttribute("x", (edge.x1 + edge.x2) / 2 - 5);
            text.setAttribute("y", (edge.y1 + edge.y2) / 2 - 5);
            text.setAttribute("fill", "#e11d48"); text.setAttribute("font-weight", "700");
            text.setAttribute("font-size", "14px");
            text.setAttribute("class", "svg-edge-text");
            text.textContent = edge.bit;
            treeSvg.appendChild(text);
        });

        // 2. Render Bulatan Simpul Node di Atas Garis (Mencegah Tabrakan Visual)
        activeState.nodes.forEach(node => {
            const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
            g.setAttribute("class", "svg-node");
            
            const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            circle.setAttribute("cx", node.x); circle.setAttribute("cy", node.y);
            circle.setAttribute("r", node.isLeaf ? "22" : "16");
            circle.setAttribute("fill", node.isLeaf ? "#e11d48" : "#ffffff");
            circle.setAttribute("stroke", node.isLeaf ? "#ffffff" : "#e11d48");
            circle.setAttribute("stroke-width", "2.5");

            const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
            text.setAttribute("x", node.x); text.setAttribute("y", node.y + 4);
            text.setAttribute("text-anchor", "middle");
            text.setAttribute("fill", node.isLeaf ? "#ffffff" : "#e11d48");
            text.setAttribute("font-size", "11px"); text.setAttribute("font-weight", "600");
            text.textContent = node.label;
            
            g.appendChild(circle);
            g.appendChild(text);
            treeSvg.appendChild(g);
        });
    }

    function updateUI(originalText, freqMap, codes) {
        resultTableBody.innerHTML = "";
        const sortedChars = Object.keys(freqMap).sort();
        let totalBitsAfter = 0;
        let mathStrings = [];

        sortedChars.forEach(char => {
            const row = document.createElement("tr");
            const displayChar = char === " " ? "[Spasi]" : char;
            const code = codes[char];
            const freq = freqMap[char];
            const bitLen = code.length;
            
            totalBitsAfter += freq * bitLen;
            mathStrings.push(`(${freq}×${bitLen})`);

            row.innerHTML = `
                <td><strong>${displayChar}</strong></td>
                <td>${freq}</td>
                <td>${bitLen} bit</td>
                <td><span class="badge-code">${code}</span></td>
            `;
            resultTableBody.appendChild(row);
        });

        const totalBitsBefore = originalText.length * 8; 
        const ratio = ((totalBitsAfter / totalBitsBefore) * 100).toFixed(2);

        compressionStats.innerHTML = `
            <p><span>ASCII Asli (8-bit):</span> <strong>${totalBitsBefore} bit</strong></p>
            <p><span>Hasil Huffman:</span> <strong>${totalBitsAfter} bit</strong></p>
            <p style="margin-top:4px;border-top:1px dashed rgba(255,255,255,0.3);padding-top:4px;"><span>Rasio Efisiensi:</span> <strong>${ratio}%</strong></p>
        `;

        manualCalcBox.innerHTML = `
            <div style="font-weight:600; margin-bottom:4px; color: #e11d48;">Validasi Rumus Matematika:</div>
            <div style="font-family: monospace; font-size:0.8rem; color:#475569; background:#fff; padding:6px; border-radius:4px; border:1px solid #e2e8f0; word-break: break-all;">
                Σ(f × l) = ${mathStrings.join(" + ")} = <strong>${totalBitsAfter} bit</strong>
            </div>
        `;
    }

    function startAutoPlay() {
        if (currentStepIndex >= stepCombinations.length - 1) currentStepIndex = 0;
        btnPlayPause.textContent = "⏸ Jeda";
        autoPlayInterval = setInterval(() => {
            if (currentStepIndex < stepCombinations.length - 1) {
                currentStepIndex++;
                renderTreeFromSteps();
            } else {
                stopAutoPlay();
            }
        }, 1300);
    }

    function stopAutoPlay() {
        if (autoPlayInterval) {
            clearInterval(autoPlayInterval);
            autoPlayInterval = null;
        }
        btnPlayPause.textContent = "▶ Putar Otomatis";
    }
});
