<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>RosettaTree - Modern Huffman Prefix Code</title>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    
    <style>
        :root {
            --primary: #e11d48;
            --primary-light: #fda4af;
            --secondary: #fb7185;
            --bg-main: #fdf2f8;
            --surface: #ffffff;
            --text-dark: #1e1b4b;
            --text-muted: #64748b;
            --glass-bg: rgba(255, 255, 255, 0.7);
            --glass-border: rgba(255, 255, 255, 0.5);
            --shadow-soft: 0 20px 40px rgba(225, 29, 72, 0.08);
            --radius-lg: 24px;
            --radius-md: 16px;
            --radius-pill: 50px;
        }

        * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Poppins', sans-serif; }
        
        html { scroll-behavior: smooth; scroll-padding-top: 100px; }
        body { background-color: var(--bg-main); color: var(--text-dark); overflow-x: hidden; }

        /* Navbar */
        .glass-nav {
            position: fixed; top: 15px; left: 50%; transform: translateX(-50%);
            width: 90%; max-width: 1200px; background: var(--glass-bg);
            backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
            border: 1px solid var(--glass-border); padding: 1rem 2rem;
            border-radius: var(--radius-pill); display: flex; justify-content: space-between;
            align-items: center; z-index: 1000; box-shadow: 0 10px 30px rgba(0,0,0,0.05);
        }
        .logo { font-size: 1.5rem; font-weight: 700; letter-spacing: -0.5px; }
        .logo span { color: var(--primary); }
        nav { display: flex; gap: 2rem; }
        .nav-link { text-decoration: none; color: var(--text-muted); font-weight: 500; transition: all 0.3s ease; position: relative; }
        .nav-link:hover, .nav-link.active { color: var(--primary); }
        .nav-link.active::after { content: ''; position: absolute; bottom: -5px; left: 0; width: 100%; height: 2px; background: var(--primary); border-radius: 2px; }

        /* Sections */
        section { min-height: 100vh; padding: 100px 5%; display: flex; flex-direction: column; justify-content: center; max-width: 1300px; margin: 0 auto; }
        .section-title { text-align: center; margin-bottom: 3rem; }
        .section-title h2 { font-size: 2.5rem; font-weight: 700; color: var(--text-dark); }
        .section-title p { color: var(--text-muted); font-size: 1.1rem; }

        /* Hero */
        .hero { position: relative; text-align: center; align-items: center; }
        .hero-content { max-width: 800px; z-index: 2; }
        .badge { background: linear-gradient(135deg, #ffe4e6, #fce7f3); color: var(--primary); padding: 0.5rem 1.5rem; border-radius: var(--radius-pill); font-weight: 600; font-size: 0.9rem; margin-bottom: 1.5rem; display: inline-block; border: 1px solid white; }
        .hero h1 { font-size: 4rem; line-height: 1.1; font-weight: 700; margin-bottom: 1.5rem; letter-spacing: -1px; }
        .gradient-text { background: linear-gradient(135deg, var(--primary), #9f1239); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .hero p { font-size: 1.15rem; color: var(--text-muted); line-height: 1.8; margin-bottom: 2.5rem; }
        
        .hero-buttons { display: flex; gap: 1rem; justify-content: center; }
        .btn { padding: 0.9rem 2.5rem; border-radius: var(--radius-pill); font-weight: 600; font-size: 1rem; cursor: pointer; text-decoration: none; transition: all 0.3s ease; border: none; }
        .btn-primary { background: var(--primary); color: white; box-shadow: 0 10px 20px rgba(225, 29, 72, 0.3); }
        .btn-primary:hover { transform: translateY(-3px); box-shadow: 0 15px 25px rgba(225, 29, 72, 0.4); }
        .btn-outline { background: transparent; color: var(--primary); border: 2px solid var(--primary-light); }
        .btn-outline:hover { background: var(--primary-light); color: white; border-color: transparent; }

        /* Background Blobs */
        .background-blobs { position: absolute; width: 100%; height: 100%; top: 0; left: 0; z-index: 1; overflow: hidden; pointer-events: none; }
        .blob { position: absolute; filter: blur(80px); opacity: 0.6; border-radius: 50%; animation: floatBlob 10s infinite alternate ease-in-out; }
        .blob-1 { top: 10%; left: 10%; width: 400px; height: 400px; background: #ffe4e6; }
        .blob-2 { bottom: 10%; right: 10%; width: 350px; height: 350px; background: #fce7f3; animation-delay: -5s; }
        @keyframes floatBlob { 0% { transform: translate(0, 0) scale(1); } 100% { transform: translate(50px, 50px) scale(1.1); } }

        /* Teori Grid */
        .modern-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; }
        .glass-card { background: var(--glass-bg); backdrop-filter: blur(10px); border: 1px solid white; border-radius: var(--radius-lg); padding: 2.5rem; box-shadow: var(--shadow-soft); transition: transform 0.3s ease; }
        .glass-card:hover { transform: translateY(-5px); }
        .icon-wrap { font-size: 2.5rem; margin-bottom: 1rem; }
        .glass-card h3 { font-size: 1.3rem; margin-bottom: 1rem; color: var(--text-dark); }
        .glass-card p { color: var(--text-muted); line-height: 1.7; font-size: 0.95rem; }
        .span-full { grid-column: 1 / -1; }
        .compare-box { display: flex; gap: 2rem; flex-wrap: wrap; padding: 1.5rem; }
        .compare { flex: 1; min-width: 250px; padding: 1.5rem; border-radius: var(--radius-md); }
        .compare.valid { background: #f0fdf4; border: 1px solid #bbf7d0; }
        .compare.invalid { background: #fff1f2; border: 1px solid #fecdd3; }

        /* Simulator */
        .quiz-chips { display: flex; flex-wrap: wrap; gap: 1rem; justify-content: center; margin-bottom: 3rem; }
        .chip-btn { background: white; border: 1px solid var(--primary-light); color: var(--primary); padding: 0.6rem 1.5rem; border-radius: var(--radius-pill); font-weight: 500; font-size: 0.95rem; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 4px 6px rgba(0,0,0,0.02); }
        .chip-btn:hover { background: var(--primary); color: white; transform: translateY(-2px); }

        .app-layout { display: grid; grid-template-columns: 0.8fr 1.2fr; gap: 2rem; }
        .input-modern { display: flex; gap: 1rem; margin-bottom: 2rem; }
        .input-modern input { flex: 1; padding: 1rem 1.5rem; border: 2px solid #fce7f3; border-radius: var(--radius-pill); font-size: 1rem; outline: none; background: white; transition: border 0.3s; }
        .input-modern input:focus { border-color: var(--primary); }

        .table-wrapper { overflow-x: auto; background: white; border-radius: var(--radius-md); padding: 1rem; margin-bottom: 1.5rem; border: 1px solid #f3f4f6;}
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 1rem; text-align: left; font-size: 0.95rem; border-bottom: 1px solid #f1f5f9; }
        th { color: var(--text-muted); font-weight: 600; text-transform: uppercase; font-size: 0.8rem; letter-spacing: 1px; }
        .badge-code { background: #ffe4e6; color: var(--primary); font-family: monospace; padding: 4px 10px; border-radius: 8px; font-weight: bold; }

        .modern-stats { background: linear-gradient(135deg, var(--primary), #be123c); color: white; padding: 1.5rem; border-radius: var(--radius-md); }
        .modern-stats p { margin-bottom: 0.5rem; font-size: 0.9rem; opacity: 0.9; }
        .modern-stats strong { font-weight: 600; opacity: 1; }

        .modern-manual-calc { margin-top: 1.5rem; background: white; padding: 1.5rem; border-radius: var(--radius-md); border-left: 4px solid var(--primary); font-size: 0.9rem; color: var(--text-muted); }
        .modern-manual-calc h4 { color: var(--text-dark); margin-bottom: 0.5rem; font-size: 1rem; }

        .canvas-container { background: #fafaf9; border-radius: var(--radius-md); overflow: auto; min-height: 450px; display: flex; justify-content: center; align-items: center; }
        
        /* Animasi SVG */
        .svg-edge { stroke-dasharray: 400; stroke-dashoffset: 400; animation: drawLine 1.5s cubic-bezier(0.25, 1, 0.5, 1) forwards; }
        .svg-edge-text { opacity: 0; animation: fadeInText 0.4s ease 1s forwards; font-family: 'Poppins'; }
        .svg-node { opacity: 0; animation: popInNode 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
        
        @keyframes drawLine { to { stroke-dashoffset: 0; } }
        @keyframes fadeInText { to { opacity: 1; } }
        @keyframes popInNode { from { transform: scale(0); opacity: 0; } to { transform: scale(1); opacity: 1; } }

        .section-reveal { opacity: 0; transform: translateY(30px); transition: all 0.8s ease; }
        .section-reveal.visible { opacity: 1; transform: translateY(0); }

        footer { text-align: center; padding: 2rem; color: var(--text-muted); font-size: 0.9rem; }

        @media (max-width: 900px) {
            .app-layout { grid-template-columns: 1fr; }
            .hero h1 { font-size: 2.8rem; }
            section { padding: 80px 5%; }
            .glass-nav { padding: 1rem; width: 95%; flex-direction: column; gap: 10px; }
        }
    </style>
</head>
<body>
    <header class="glass-nav">
        <div class="logo">Rosetta<span>Tree</span></div>
        <nav>
            <a href="#beranda" class="nav-link active">Beranda</a>
            <a href="#teori" class="nav-link">Teori</a>
            <a href="#simulasi" class="nav-link">Simulator</a>
        </nav>
    </header>

    <section id="beranda" class="hero section-reveal">
        <div class="background-blobs">
            <div class="blob blob-1"></div>
            <div class="blob blob-2"></div>
        </div>
        <div class="hero-content">
            <span class="badge">Matematika Diskrit</span>
            <h1>Visualisasi Elegan <br><span class="gradient-text">Kode Awalan & Pohon Huffman</span></h1>
            <p>Platform interaktif modern yang membantu Anda menganalisis kompresi data secara mendalam. Terinspirasi dari <em>Rosetta Stone</em>, dirancang untuk memecahkan kerumitan pohon biner menjadi visual yang mulus dan mudah dipahami.</p>
            <div class="hero-buttons">
                <a href="#simulasi" class="btn btn-primary">Mulai Simulasi</a>
                <a href="#teori" class="btn btn-outline">Pelajari Konsep</a>
            </div>
        </div>
    </section>

    <section id="teori" class="theory-section section-reveal">
        <div class="section-title">
            <h2>Konsep Dasar</h2>
            <p>Mengapa kita membutuhkan Kode Awalan?</p>
        </div>
        
        <div class="modern-grid">
            <div class="glass-card">
                <div class="icon-wrap">🌳</div>
                <h3>Pohon Berakar & Biner</h3>
                <p>Graf terhubung tanpa sirkuit yang diberi arah. Pada pohon biner, simpul maksimal memiliki 2 anak (Kiri untuk bit <code>0</code>, Kanan untuk bit <code>1</code>).</p>
            </div>
            <div class="glass-card">
                <div class="icon-wrap">🏷️</div>
                <h3>Syarat Mutlak Kode Awalan</h3>
                <p>Tidak boleh ada satu pun kode yang menjadi awalan (<em>prefix</em>) bagi kode lainnya. Ini menjamin data dapat didekodekan komputer tanpa ambiguitas.</p>
            </div>
            
            <div class="glass-card span-full compare-box">
                <div class="compare valid">
                    <h4>✅ Valid (Prefix Code)</h4>
                    <p>Contoh: <code>A=0</code>, <code>B=10</code>, <code>C=110</code>. <br>Pesan dibaca berurutan tanpa celah kesalahan.</p>
                </div>
                <div class="compare invalid">
                    <h4>❌ Tidak Valid</h4>
                    <p>Contoh: <code>A=1</code>, <code>C=10</code>. <br>Ambiguitas terjadi karena A (1) adalah awalan dari C (10).</p>
                </div>
            </div>
        </div>
    </section>

    <section id="simulasi" class="simulator-section section-reveal">
        <div class="section-title">
            <h2>Simulator Interaktif</h2>
            <p>Pilih kasus uji atau ketik teks kustom untuk melihat bagaimana pohon terbentuk.</p>
        </div>

        <div class="quiz-chips">
            <button class="chip-btn" data-text="STRUKTUR DATA">STRUKTUR DATA</button>
            <button class="chip-btn" data-text="LOGIKA INFORMATIKA">LOGIKA INFORMATIKA</button>
            <button class="chip-btn" data-text="ALGORITMA">ALGORITMA</button>
            <button class="chip-btn" data-text="CYBER SECURITY">CYBER SECURITY</button>
            <button class="chip-btn" data-text="MAHASISWA SUKSES">MAHASISWA SUKSES</button>
        </div>

        <div class="app-layout">
            <div class="app-panel data-panel glass-card">
                <div class="input-modern">
                    <input type="text" id="textInput" placeholder="Ketik kalimat di sini..." value="STRUKTUR DATA">
                    <button id="btnProcess" class="btn btn-primary">Proses</button>
                </div>
                
                <div class="table-wrapper">
                    <table id="resultTable">
                        <thead>
                            <tr>
                                <th>Simbol</th>
                                <th>Freq (f)</th>
                                <th>Bit (l)</th>
                                <th>Kode</th>
                            </tr>
                        </thead>
                        <tbody></tbody>
                    </table>
                </div>
                <div id="compressionStats" class="modern-stats"></div>
            </div>

            <div class="app-panel visual-panel glass-card">
                <div id="canvasContainer" class="canvas-container">
                    <svg id="treeSvg" width="100%" height="450"></svg>
                </div>
                <div id="manualCalcBox" class="modern-manual-calc"></div>
            </div>
        </div>
    </section>

    <footer>
        <p>RosettaTree &copy; 2026 - Modern Data Compression Visualizer</p>
    </footer>

    <script>
        document.addEventListener("DOMContentLoaded", () => {
            // Animasi Scroll Reveal
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

            // Navbar Scroll Spy
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

            // Logika Simulator
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

                quizChips.forEach(chip => {
                    chip.addEventListener("click", () => {
                        const targetText = chip.getAttribute("data-text");
                        textInput.value = targetText;
                        processHuffman(targetText.toUpperCase());
                        document.getElementById("simulasi").scrollIntoView({ behavior: 'smooth' });
                    });
                });
                
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
                        // Berikan jeda delay animasi secara dinamis berdasarkan kedalaman
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
                    <p style="margin-top: 8px; font-size: 0.8rem;">(Hasil perhitungan manual sesuai dengan mesin simulator).</p>
                `;
            }

            function renderTree(root) {
                treeSvg.innerHTML = ""; 
                const svgWidth = treeSvg.clientWidth || 600;
                const elementsToDraw = [];

                function traverse(node, depth, xStart, xEnd, pX, pY, isLeft) {
                    if (!node) return;
                    const x = (xStart + xEnd) / 2;
                    const y = 40 + depth * 70; // Jarak rapat

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

                let delayIndex = 0; // Untuk animasi pop up
                
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

                elementsToDraw.forEach(el => {
                    if (el.type === 'node') {
                        const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
                        g.setAttribute("class", "svg-node");
                        g.style.transformOrigin = `${el.x}px ${el.y}px`;
                        
                        // Menambahkan delay biar munculnya berurutan
                        g.style.animationDelay = `${delayIndex * 0.05}s`;
                        delayIndex++;

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
    </script>
</body>
</html>
