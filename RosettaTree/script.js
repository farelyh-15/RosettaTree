document.addEventListener("DOMContentLoaded", () => {
    const btnProcess = document.getElementById("btnProcess");
    const textInput = document.getElementById("textInput");
    const resultTableBody = document.querySelector("#resultTable tbody");
    const treeSvg = document.getElementById("treeSvg");
    const compressionStats = document.getElementById("compressionStats");
    const manualCalcBox = document.getElementById("manualCalcBox");
    const quizChips = document.querySelectorAll(".chip-btn");

    // Elemen Kontrol Playback Baru
    const btnPrevStep = document.getElementById("btnPrevStep");
    const btnPlayPause = document.getElementById("btnPlayPause");
    const btnNextStep = document.getElementById("btnNextStep");
    const stepIndicator = document.getElementById("stepIndicator");

    let totalElementsArray = []; 
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

        // Kontrol Tombol Langkah Bertahap
        btnNextStep.addEventListener("click", () => {
            stopAutoPlay();
            if (currentStepIndex < totalElementsArray.length) {
                currentStepIndex++;
                renderCurrentTreeStep();
            }
        });

        btnPrevStep.addEventListener("click", () => {
            stopAutoPlay();
            if (currentStepIndex > 0) {
                currentStepIndex--;
                renderCurrentTreeStep();
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

        let nodes = Object.keys(freqMap).map(char => ({ char, freq: freqMap[char], left: null, right: null }));
        if (nodes.length === 0) return;

        let root;
        if (nodes.length === 1) {
            root = { char: null, freq: nodes[0].freq, left: nodes[0], right: null };
        } else {
            while (nodes.length > 1) {
                nodes.sort((a, b) => a.freq - b.freq);
                const left = nodes.shift();
                const right = nodes.shift();
                nodes.push({ char: null, freq: left.freq + right.freq, left, right });
            }
            root = nodes[0];
        }

        const codes = {};
        function generateCodes(node, currentCode) {
            if (!node) return;
            if (node.char !== null) { codes[node.char] = currentCode || "0"; return; }
            generateCodes(node.left, currentCode + "0");
            generateCodes(node.right, currentCode + "1");
        }
        generateCodes(root, "");

        updateUI(text, freqMap, codes);
        
        // Buat daftar antrean render grafis pohon biner huffman
        generateTreeTimeline(root);
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

    // Fungsi Mengumpulkan Seluruh Komponen Objek Grafis Pohon ke Array Utama
    function generateTreeTimeline(root) {
        totalElementsArray = [];
        const VIRTUAL_WIDTH = 800; 
        
        function traverse(node, depth, xStart, xEnd, pX, pY, isLeft) {
            if (!node) return;
            const x = (xStart + xEnd) / 2;
            const y = 45 + depth * 75; 

            if (pX !== null && pY !== null) {
                totalElementsArray.push({
                    type: 'line', x1: pX, y1: pY, x2: x, y2: y, label: isLeft ? "0" : "1",
                    lx: (pX + x) / 2 - 5, ly: (pY + y) / 2 - 5, depth: depth
                });
            }

            totalElementsArray.push({
                type: 'node', x, y, isLeaf: node.char !== null,
                label: node.char ? `${node.char === " " ? "Spc" : node.char}:${node.freq}` : `${node.freq}`,
                depth: depth
            });

            traverse(node.left, depth + 1, xStart, x, x, y, true);
            traverse(node.right, depth + 1, x, xEnd, x, y, false);
        }

        traverse(root, 0, 30, VIRTUAL_WIDTH - 30, null, null, null);

        // Sortir penempatan agar elemen dengan kedalaman terbesar (daun) muncul terlebih dahulu secara berurutan
        totalElementsArray.sort((a, b) => b.depth - a.depth);

        // Reset indeks ke posisi akhir agar seluruh pohon langsung terlihat saat pertama proses selesai
        currentStepIndex = totalElementsArray.length;
        renderCurrentTreeStep();
    }

    // Menampilkan Komponen Berdasarkan Indeks Langkah Saat Ini
    function renderCurrentTreeStep() {
        treeSvg.innerHTML = "";
        stepIndicator.textContent = `Langkah: ${currentStepIndex} / ${totalElementsArray.length}`;

        const visibleElements = totalElementsArray.slice(0, currentStepIndex);

        // Render Garis Terlebih Dahulu
        visibleElements.forEach(el => {
            if (el.type === 'line') {
                const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
                line.setAttribute("x1", el.x1); line.setAttribute("y1", el.y1);
                line.setAttribute("x2", el.x2); line.setAttribute("y2", el.y2);
                line.setAttribute("stroke", "#fda4af"); line.setAttribute("stroke-width", "2");
                line.setAttribute("class", "svg-edge");
                treeSvg.appendChild(line);

                const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
                text.setAttribute("x", el.lx); text.setAttribute("y", el.ly);
                text.setAttribute("fill", "#e11d48"); text.setAttribute("font-weight", "600");
                text.setAttribute("font-size", "13px");
                text.setAttribute("class", "svg-edge-text");
                text.textContent = el.label;
                treeSvg.appendChild(text);
            }
        });

        // Render Lingkaran Node di Atas Garis
        visibleElements.forEach(el => {
            if (el.type === 'node') {
                const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
                g.setAttribute("class", "svg-node");
                
                const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                circle.setAttribute("cx", el.x); circle.setAttribute("cy", el.y);
                circle.setAttribute("r", el.isLeaf ? "22" : "16");
                circle.setAttribute("fill", el.isLeaf ? "#e11d48" : "#ffffff");
                circle.setAttribute("stroke", el.isLeaf ? "#ffffff" : "#e11d48");
                circle.setAttribute("stroke-width", "2.5");

                const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
                text.setAttribute("x", el.x); text.setAttribute("y", el.y + 4);
                text.setAttribute("text-anchor", "middle");
                text.setAttribute("fill", el.isLeaf ? "#ffffff" : "#e11d48");
                text.setAttribute("font-size", "11px"); text.setAttribute("font-weight", "600");
                text.textContent = el.label;
                
                g.appendChild(circle);
                g.appendChild(text);
                treeSvg.appendChild(g);
            }
        });
    }

    function startAutoPlay() {
        if (currentStepIndex >= totalElementsArray.length) {
            currentStepIndex = 0; // Mengulang dari awal jika sudah penuh
        }
        btnPlayPause.textContent = "⏸ Jeda";
        btnPlayPause.classList.add("playing");
        autoPlayInterval = setInterval(() => {
            if (currentStepIndex < totalElementsArray.length) {
                currentStepIndex++;
                renderCurrentTreeStep();
            } else {
                stopAutoPlay();
            }
        }, 900); // Penambahan item baru setiap 0.9 detik secara smooth
    }

    function stopAutoPlay() {
        if (autoPlayInterval) {
            clearInterval(autoPlayInterval);
            autoPlayInterval = null;
        }
        btnPlayPause.textContent = "▶ Putar Otomatis";
        btnPlayPause.classList.remove("playing");
    }
});
