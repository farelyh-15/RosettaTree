document.addEventListener("DOMContentLoaded", () => {
    const btnProcess = document.getElementById("btnProcess");
    const textInput = document.getElementById("textInput");
    const resultTableBody = document.querySelector("#resultTable tbody");
    const treeSvg = document.getElementById("treeSvg");
    const compressionStats = document.getElementById("compressionStats");
    const manualCalcBox = document.getElementById("manualCalcBox");
    const quizChips = document.querySelectorAll(".chip-btn");

    // Validasi & Listener Tombol Proses
    if (btnProcess) {
        btnProcess.addEventListener("click", () => {
            const text = textInput.value.toUpperCase();
            if (!text) { alert("Teks tidak boleh kosong!"); return; }
            processHuffman(text);
        });

        // Listener untuk Bank Kasus Soal (Chips)
        quizChips.forEach(chip => {
            chip.addEventListener("click", () => {
                textInput.value = chip.getAttribute("data-text");
                processHuffman(textInput.value);
            });
        });
        
        // Pemrosesan awal teks bawaan saat web pertama dibuka
        processHuffman(textInput.value);
    }

    // Fungsi Matematika Utama Algoritma Huffman
    function processHuffman(text) {
        // Step 1: Hitung kemunculan frekuensi masing-masing karakter
        const freqMap = {};
        for (let char of text) { freqMap[char] = (freqMap[char] || 0) + 1; }

        let nodes = Object.keys(freqMap).map(char => ({ char, freq: freqMap[char], left: null, right: null }));
        if (nodes.length === 0) return;

        let root;
        if (nodes.length === 1) {
            root = { char: null, freq: nodes[0].freq, left: nodes[0], right: null };
        } else {
            // Step 2: Melakukan penggabungan node biner terkecil ke dalam antrean
            while (nodes.length > 1) {
                nodes.sort((a, b) => a.freq - b.freq);
                const left = nodes.shift();
                const right = nodes.shift();
                nodes.push({ char: null, freq: left.freq + right.freq, left, right });
            }
            root = nodes[0];
        }

        // Step 3: Melakukan penelusuran rekursif pohon untuk generate bit (0/1)
        const codes = {};
        function generateCodes(node, currentCode) {
            if (!node) return;
            if (node.char !== null) { codes[node.char] = currentCode || "0"; return; }
            generateCodes(node.left, currentCode + "0");
            generateCodes(node.right, currentCode + "1");
        }
        generateCodes(root, "");

        updateUI(text, freqMap, codes);
        drawTreeSVG(root);
    }

    // Fungsi Memperbarui Tabel Data & Hitungan Rumus
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
                <td>${bitLen}</td>
                <td><span class="badge-code">${code}</span></td>
            `;
            resultTableBody.appendChild(row);
        });

        const totalBitsBefore = originalText.length * 8; 
        const ratio = ((totalBitsAfter / totalBitsBefore) * 100).toFixed(2);

        compressionStats.innerHTML = `
            <p>Ukuran Asli (8-bit ASCII): <strong>${totalBitsBefore} bit</strong></p>
            <p>Ukuran Hasil Kompresi: <strong>${totalBitsAfter} bit</strong></p>
            <p style="margin-top:5px;">Rasio Efisiensi: <strong>${ratio}%</strong></p>
        `;

        manualCalcBox.innerHTML = `
            <div style="font-weight:600; margin-bottom:5px; color: #9f1239;">Validasi Hitung Manual:</div>
            <div style="font-family: monospace; word-break: break-all;">
                Total = ${mathStrings.join(" + ")}<br>
                Total = <strong>${totalBitsAfter} bit</strong>
            </div>
        `;
    }

    // Fungsi Render Struktur Grafis Pohon ke Elemen SVG secara Dinamis
    function drawTreeSVG(root) {
        treeSvg.innerHTML = ""; 
        const elements = [];
        const VIRTUAL_WIDTH = 800; // Lebar kanvas internal virtual tetap
        
        function traverse(node, depth, xStart, xEnd, pX, pY, isLeft) {
            if (!node) return;
            const x = (xStart + xEnd) / 2;
            const y = 40 + depth * 75; // Menentukan kerenggangan level vertikal simpul

            if (pX !== null && pY !== null) {
                elements.push({
                    type: 'line', x1: pX, y1: pY, x2: x, y2: y, label: isLeft ? "0" : "1",
                    lx: (pX + x) / 2 - 5, ly: (pY + y) / 2 - 5
                });
            }

            elements.push({
                type: 'node', x, y, isLeaf: node.char !== null,
                label: node.char ? `${node.char === " " ? "Sps" : node.char}:${node.freq}` : `${node.freq}`
            });

            traverse(node.left, depth + 1, xStart, x, x, y, true);
            traverse(node.right, depth + 1, x, xEnd, x, y, false);
        }

        traverse(root, 0, 20, VIRTUAL_WIDTH - 20, null, null, null);

        // Cetak Garis/Penghubung Sisi (Edges)
        elements.forEach(el => {
            if (el.type === 'line') {
                const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
                line.setAttribute("x1", el.x1); line.setAttribute("y1", el.y1);
                line.setAttribute("x2", el.x2); line.setAttribute("y2", el.y2);
                line.setAttribute("stroke", "#fda4af"); line.setAttribute("stroke-width", "2.5");
                line.setAttribute("class", "svg-edge");
                treeSvg.appendChild(line);

                const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
                text.setAttribute("x", el.lx); text.setAttribute("y", el.ly);
                text.setAttribute("fill", "#e11d48"); text.setAttribute("font-weight", "600");
                text.setAttribute("font-size", "14px"); 
                text.textContent = el.label;
                treeSvg.appendChild(text);
            }
        });

        // Cetak Lingkaran/Titik Simpul (Nodes) dengan Delay Berurutan
        let indexNode = 0;
        elements.forEach(el => {
            if (el.type === 'node') {
                const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
                g.setAttribute("class", "svg-node");
                g.style.animationDelay = `${indexNode * 0.04}s`;
                indexNode++;
                
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
                text.setAttribute("font-size", "12px"); text.setAttribute("font-weight", "600");
                text.textContent = el.label;
                
                g.appendChild(circle);
                g.appendChild(text);
                treeSvg.appendChild(g);
            }
        });
    }
});
