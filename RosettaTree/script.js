document.addEventListener("DOMContentLoaded", () => {
    // 1. SCROLL REVEAL ANIMATION (Membuat Elemen Muncul Halus Saat Di-scroll)
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.section-reveal').forEach((section) => {
        observer.observe(section);
    });

    // 2. ACTIVE NAVBAR LINK ON SCROLL (Mengubah Warna Menu Sesuai Posisi Layar)
    const sections = document.querySelectorAll("section");
    const navLinks = document.querySelectorAll(".nav-link");

    window.addEventListener("scroll", () => {
        let current = "";
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (scrollY >= sectionTop - 150) {
                current = section.getAttribute("id");
            }
        });

        navLinks.forEach(link => {
            link.classList.remove("active");
            if (link.getAttribute("href").includes(current)) {
                link.classList.add("active");
            }
        });
    });

    // 3. LOGIKA SIMULATOR HUFFMAN 
    const btnProcess = document.getElementById("btnProcess");
    const textInput = document.getElementById("textInput");
    const resultTableBody = document.querySelector("#resultTable tbody");
    const treeSvg = document.getElementById("treeSvg");
    const compressionStats = document.getElementById("compressionStats");
    const manualCalcBox = document.getElementById("manualCalcBox");
    const quizChips = document.querySelectorAll(".chip-btn");

    if (btnProcess) {
        btnProcess.addEventListener("click", () => {
            const text = textInput.value.toUpperCase();
            if (!text) { alert("Masukkan teks terlebih dahulu!"); return; }
            processHuffman(text);
        });

        // Event Kuis Interaktif
        quizChips.forEach(chip => {
            chip.addEventListener("click", () => {
                const targetText = chip.getAttribute("data-text");
                textInput.value = targetText;
                processHuffman(targetText.toUpperCase());
                // Scroll sedikit agar simulator di tengah layar
                document.getElementById("simulasi").scrollIntoView({ behavior: 'smooth' });
            });
        });
        
        // Render awal
        processHuffman(textInput.value.toUpperCase());
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

        updateTableStatsAndManual(text, freqMap, codes);
        renderTree(root);
    }

    function updateTableStatsAndManual(originalText, freqMap, codes) {
        resultTableBody.innerHTML = "";
        const sortedChars = Object.keys(freqMap).sort();
        let totalBitsAfter = 0;
        let manualMathStrings = [];

        sortedChars.forEach(char => {
            const row = document.createElement("tr");
            const displayChar = char === " " ? "[Spasi]" : char;
            const code = codes[char];
            const freq = freqMap[char];
            const bitLen = code.length;
            
            totalBitsAfter += freq * bitLen;
            manualMathStrings.push(`(${freq} × ${bitLen})`);

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
            <p>ASCII (8-bit): <strong>${totalBitsBefore} bit</strong></p>
            <p>Hasil Huffman: <strong>${totalBitsAfter} bit</strong></p>
            <p style="margin-top: 10px; font-size:1rem;">Efisiensi: <span style="background: rgba(255,255,255,0.2); padding: 2px 8px; border-radius: 4px;">${ratio}%</span></p>
        `;

        const manualEq = manualMathStrings.join(" + ");
        manualCalcBox.innerHTML = `
            <h4>✨ Validasi Perhitungan Manual</h4>
            <p style="margin-bottom: 8px;">Rumus: Σ (Frekuensi × Panjang Bit)</p>
            <div style="background: #f8fafc; padding: 10px; border-radius: 8px; font-family: monospace; border: 1px solid #e2e8f0; font-size:0.85rem;">
                = ${manualEq} <br>
                = <strong>${totalBitsAfter} bit</strong>
            </div>
            <p style="margin-top: 8px; font-size: 0.8rem;">(Hasil perhitungan rumus manual sesuai dengan sistem simulator).</p>
        `;
    }

    function renderTree(root) {
        treeSvg.innerHTML = ""; 
        const svgWidth = treeSvg.clientWidth || 600;
        const elementsToDraw = [];

        function traverse(node, depth, xStart, xEnd, pX, pY, isLeft) {
            if (!node) return;
            const x = (xStart + xEnd) / 2;
            const y = 40 + depth * 70; // Jarak Vertikal Rapat Elegan

            if (pX !== null && pY !== null) {
                elementsToDraw.push({
                    type: 'line', x1: pX, y1: pY, x2: x, y2: y, label: isLeft ? "0" : "1",
                    lx: (pX + x) / 2 - 5, ly: (pY + y) / 2 - 5
                });
            }

            elementsToDraw.push({
                type: 'node', x, y, isLeaf: node.char !== null,
                label: node.char ? `${node.char === " " ? "Spc" : node.char}:${node.freq}` : `${node.freq}`
            });

            traverse(node.left, depth + 1, xStart, x, x, y, true);
            traverse(node.right, depth + 1, x, xEnd, x, y, false);
        }

        traverse(root, 0, 20, svgWidth - 20, null, null, null);

        // Gambar Garis Sisi SVG
        elementsToDraw.forEach(el => {
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
                text.setAttribute("font-size", "12px"); text.setAttribute("class", "svg-edge-text");
                text.textContent = el.label;
                treeSvg.appendChild(text);
            }
        });

        // Gambar Simpul Node SVG
        elementsToDraw.forEach(el => {
            if (el.type === 'node') {
                const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
                g.setAttribute("class", "svg-node");
                g.style.transformOrigin = `${el.x}px ${el.y}px`;

                const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                circle.setAttribute("cx", el.x); circle.setAttribute("cy", el.y);
                circle.setAttribute("r", el.isLeaf ? "20" : "15");
                circle.setAttribute("fill", el.isLeaf ? "#e11d48" : "#ffffff");
                circle.setAttribute("stroke", el.isLeaf ? "#ffffff" : "#e11d48");
                circle.setAttribute("stroke-width", "2.5");
                g.appendChild(circle);

                const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
                text.setAttribute("x", el.x); text.setAttribute("y", el.y + 4);
                text.setAttribute("text-anchor", "middle");
                text.setAttribute("fill", el.isLeaf ? "#ffffff" : "#e11d48");
                text.setAttribute("font-size", "11px"); text.setAttribute("font-weight", "600");
                text.textContent = el.label;
                g.appendChild(text);
                treeSvg.appendChild(g);
            }
        });
    }
});