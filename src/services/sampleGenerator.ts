import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export async function generateSampleExamPDF(): Promise<ArrayBuffer> {
  const pdfDoc = await PDFDocument.create();
  const timesRomanFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const timesBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const courier = await pdfDoc.embedFont(StandardFonts.Courier);

  // Helper for adding standard page
  const createPage = (title: string, subtitle: string, tag: string) => {
    const page = pdfDoc.addPage([595.28, 841.89]); // A4
    const { width, height } = page.getSize();

    // Header bar
    page.drawRectangle({
      x: 0,
      y: height - 60,
      width: width,
      height: 60,
      color: rgb(0.08, 0.12, 0.2),
    });

    page.drawText('FocusDeck PDF • Distributed Systems Exam Revision', {
      x: 36,
      y: height - 38,
      size: 13,
      font: timesBold,
      color: rgb(0.85, 0.9, 1),
    });

    page.drawText(tag, {
      x: width - 150,
      y: height - 38,
      size: 11,
      font: timesRomanFont,
      color: rgb(0.6, 0.8, 1),
    });

    // Title & subtitle
    page.drawText(title, {
      x: 36,
      y: height - 105,
      size: 22,
      font: timesBold,
      color: rgb(0.1, 0.15, 0.25),
    });

    page.drawText(subtitle, {
      x: 36,
      y: height - 128,
      size: 12,
      font: timesRomanFont,
      color: rgb(0.35, 0.4, 0.5),
    });

    // Horizontal line
    page.drawLine({
      start: { x: 36, y: height - 140 },
      end: { x: width - 36, y: height - 140 },
      thickness: 1,
      color: rgb(0.85, 0.88, 0.92),
    });

    // Footer
    page.drawText('FocusDeck PDF Study Deck • Prune non-examinable pages to retain more', {
      x: 36,
      y: 28,
      size: 9,
      font: timesRomanFont,
      color: rgb(0.55, 0.6, 0.65),
    });

    return { page, width, height };
  };

  // --- PAGE 1: Course Overview & High-Yield Index ---
  {
    const { page, height } = createPage(
      'Computer Science: System Design & Algorithms',
      'Final Comprehensive Exam Revision Deck (Course CS-401)',
      'PAGE 1 of 6'
    );

    page.drawText('Exam Blueprint & Study Strategy:', {
      x: 36,
      y: height - 175,
      size: 14,
      font: timesBold,
      color: rgb(0.15, 0.2, 0.3),
    });

    const lines = [
      '• Target Goal: Focus strictly on high-yield algorithms, caching strategies, and CAP theorem.',
      '• Cognitive Load Advisory: Delete Pages 3 & 5 (Historical Appendix & Formal Proofs) to cut revision time.',
      '• Use the Highlighter tool to mark Big-O complexities and the Pen tool for diagram notes.',
      '• Use Voice Memos to record quick 30-second audio summaries per concept.',
      '• Use Snapshots before pruning so you can restore anything with 1-click.',
    ];

    let yOffset = height - 205;
    for (const line of lines) {
      page.drawText(line, {
        x: 36,
        y: yOffset,
        size: 11,
        font: timesRomanFont,
        color: rgb(0.2, 0.25, 0.32),
      });
      yOffset -= 24;
    }

    // Box highlight for exam notice
    page.drawRectangle({
      x: 36,
      y: height - 420,
      width: 523,
      height: 75,
      color: rgb(0.95, 0.97, 1),
      borderColor: rgb(0.4, 0.6, 0.95),
      borderWidth: 1.5,
    });

    page.drawText('⭐ HIGH YIELD STUDY TIP (Save Mental Energy):', {
      x: 50,
      y: height - 370,
      size: 11,
      font: timesBold,
      color: rgb(0.1, 0.3, 0.7),
    });

    page.drawText(
      'Studies show pruning 25% of redundant lecture slides boosts exam recall by up to 34% by eliminating distractions.',
      {
        x: 50,
        y: height - 395,
        size: 10,
        font: timesRomanFont,
        color: rgb(0.2, 0.25, 0.35),
      }
    );
  }

  // --- PAGE 2: Algorithms & Big-O Complexity Cheatsheet ---
  {
    const { page, height } = createPage(
      'Chapter 1: Algorithm Complexities & Data Structures',
      'Core Time & Space Complexities for Final Exam',
      'PAGE 2 of 6 [HIGH YIELD]'
    );

    page.drawText('Critical Time Complexities Table:', {
      x: 36,
      y: height - 175,
      size: 13,
      font: timesBold,
      color: rgb(0.15, 0.2, 0.3),
    });

    const algos = [
      ['Binary Search', 'O(log n) Avg', 'O(log n) Worst', 'Divide and conquer'],
      ['Quick Sort', 'O(n log n)', 'O(n^2) Worst', 'Pivot choice is critical'],
      ['Merge Sort', 'O(n log n)', 'O(n log n)', 'Stable, requires O(n) space'],
      ['Heap Sort', 'O(n log n)', 'O(n log n)', 'In-place, unstable'],
      ['Dijkstra (Heap)', 'O((V + E) log V)', 'O((V + E) log V)', 'Shortest path, non-negative weights'],
      ['Hash Table Lookup', 'O(1)', 'O(n)', 'Dependent on collision strategy'],
    ];

    let rowY = height - 210;
    for (const [name, avg, worst, note] of algos) {
      page.drawText(name, { x: 36, y: rowY, size: 10, font: timesBold, color: rgb(0.1, 0.1, 0.1) });
      page.drawText(`${avg} | Worst: ${worst}`, { x: 170, y: rowY, size: 9.5, font: courier, color: rgb(0.2, 0.35, 0.6) });
      page.drawText(`Note: ${note}`, { x: 360, y: rowY, size: 8.5, font: timesRomanFont, color: rgb(0.4, 0.45, 0.5) });
      rowY -= 32;
    }
  }

  // --- PAGE 3: Formal Mathematical Proof (Candidate for deletion) ---
  {
    const { page, height } = createPage(
      'Chapter 2: Formal Reductions & NP-Completeness Proof',
      'Optional Theoretical Addendum — Not on 2026 Exam',
      'PAGE 3 of 6 [PRUNABLE]'
    );

    page.drawRectangle({
      x: 36,
      y: height - 210,
      width: 523,
      height: 40,
      color: rgb(1, 0.93, 0.93),
      borderColor: rgb(0.9, 0.3, 0.3),
      borderWidth: 1,
    });

    page.drawText('⚠️ EXAM NOTE: This page is NOT tested in the final. You can prune it to declutter your mind!', {
      x: 50,
      y: height - 192,
      size: 10.5,
      font: timesBold,
      color: rgb(0.8, 0.1, 0.1),
    });

    page.drawText('Lemma 4.2.1: Reduction of 3-SAT to Vertex Cover', {
      x: 36,
      y: height - 250,
      size: 13,
      font: timesBold,
      color: rgb(0.2, 0.2, 0.2),
    });

    const proofText = [
      'Let phi = C_1 and C_2 and ... C_m be a 3-CNF boolean formula over n variables.',
      'We construct graph G = (V, E) and integer k such that phi is satisfiable iff G has a vertex cover of size k.',
      'For each variable x_i, construct a gadget consisting of two vertices labeled x_i and not(x_i) with an edge.',
      'For each clause C_j = (l_1 or l_2 or l_3), construct a triangle gadget with 3 vertices.',
      'Connecting each clause vertex to its corresponding literal ensures any valid vertex cover must select at least',
      'one literal per clause gadget plus n variable literals. Hence k = n + 2m.',
    ];

    let pY = height - 280;
    for (const line of proofText) {
      page.drawText(line, { x: 36, y: pY, size: 10, font: timesRomanFont, color: rgb(0.35, 0.35, 0.4) });
      pY -= 22;
    }
  }

  // --- PAGE 4: Distributed Systems & CAP Theorem ---
  {
    const { page, height } = createPage(
      'Chapter 3: Distributed Systems Architecture',
      'CAP Theorem, Consistency Models, and Partition Tolerance',
      'PAGE 4 of 6 [HIGH YIELD]'
    );

    page.drawText('1. CAP Theorem Breakdown', {
      x: 36,
      y: height - 175,
      size: 13,
      font: timesBold,
      color: rgb(0.15, 0.2, 0.3),
    });

    const capPoints = [
      '• Consistency (C): Every read receives the most recent write or an error.',
      '• Availability (A): Every non-failing node returns a non-error response, without guarantee of latest write.',
      '• Partition Tolerance (P): The system continues to operate despite arbitrary network message loss or delays.',
      '• Fundamental Law: When network partitions (P) occur, you must choose between Consistency (CP) or Availability (AP).',
    ];

    let capY = height - 200;
    for (const pt of capPoints) {
      page.drawText(pt, { x: 36, y: capY, size: 10.5, font: timesRomanFont, color: rgb(0.2, 0.25, 0.3) });
      capY -= 24;
    }

    page.drawText('2. Cache Invalidation & Write Strategies', {
      x: 36,
      y: height - 330,
      size: 13,
      font: timesBold,
      color: rgb(0.15, 0.2, 0.3),
    });

    const cachePoints = [
      '• Cache-Aside: Application reads from cache; on miss, reads DB, then populates cache.',
      '• Write-Through: Data written to cache and DB simultaneously. High data consistency, higher write latency.',
      '• Write-Back (Write-Behind): Data written to cache immediately; async batched write to DB. Fast, risk of loss.',
    ];

    let cacheY = height - 355;
    for (const cp of cachePoints) {
      page.drawText(cp, { x: 36, y: cacheY, size: 10.5, font: timesRomanFont, color: rgb(0.2, 0.25, 0.3) });
      cacheY -= 24;
    }
  }

  // --- PAGE 5: Historical Appendix (Old 2012 Syllabus) ---
  {
    const { page, height } = createPage(
      'Chapter 4: Historical Legacy Hardware Appendix',
      'Legacy Systems Archive (Obsolete Reference)',
      'PAGE 5 of 6 [PRUNABLE]'
    );

    page.drawRectangle({
      x: 36,
      y: height - 210,
      width: 523,
      height: 40,
      color: rgb(1, 0.95, 0.9),
      borderColor: rgb(0.9, 0.5, 0.1),
      borderWidth: 1,
    });

    page.drawText('ℹ️ NOTICE: Deprecated hardware architectures. Recommended to DELETE for exam focus.', {
      x: 50,
      y: height - 192,
      size: 10,
      font: timesBold,
      color: rgb(0.7, 0.35, 0.05),
    });

    page.drawText('Legacy Bus Protocols & Magnetic Core Memory Architecture', {
      x: 36,
      y: height - 250,
      size: 12,
      font: timesBold,
      color: rgb(0.3, 0.3, 0.3),
    });

    page.drawText('This appendix covers legacy serial interconnects from 1995-2005. Safe to prune.', {
      x: 36,
      y: height - 275,
      size: 10,
      font: timesRomanFont,
      color: rgb(0.4, 0.4, 0.4),
    });
  }

  // --- PAGE 6: Quick Formula Cheat Sheet ---
  {
    const { page, height } = createPage(
      'Summary: Quick Exam Formula Reference',
      'Formulas, Master Theorem, and Latency Numbers',
      'PAGE 6 of 6 [HIGH YIELD]'
    );

    page.drawText('Master Theorem for Recurrences: T(n) = a T(n/b) + f(n)', {
      x: 36,
      y: height - 175,
      size: 12,
      font: timesBold,
      color: rgb(0.15, 0.2, 0.3),
    });

    const formulas = [
      '• Case 1: If f(n) = O(n^(log_b(a) - epsilon)), then T(n) = Theta(n^(log_b(a)))',
      '• Case 2: If f(n) = Theta(n^(log_b(a))), then T(n) = Theta(n^(log_b(a)) * log n)',
      '• Case 3: If f(n) = Omega(n^(log_b(a) + epsilon)), and a*f(n/b) <= c*f(n), then T(n) = Theta(f(n))',
      '',
      'Key Latency Numbers Every Engineer Should Know:',
      '• L1 Cache Reference: 0.5 ns',
      '• Branch Mispredict: 5 ns',
      '• L2 Cache Reference: 7 ns',
      '• Main Memory Reference: 100 ns',
      '• Read 1 MB sequentially from memory: 3,000 ns (3 us)',
      '• Send 1 KB packet over 1 Gbps network: 10,000 ns (10 us)',
      '• Read 1 MB sequentially from SSD: 49,000 ns (49 us)',
      '• Round trip within same datacenter: 500,000 ns (500 us)',
    ];

    let fY = height - 200;
    for (const f of formulas) {
      if (f.startsWith('Key Latency')) {
        page.drawText(f, { x: 36, y: fY, size: 11, font: timesBold, color: rgb(0.1, 0.25, 0.5) });
      } else {
        page.drawText(f, { x: 36, y: fY, size: 9.5, font: courier, color: rgb(0.2, 0.25, 0.3) });
      }
      fY -= 20;
    }
  }

  const pdfBytes = await pdfDoc.save();
  const buffer = pdfBytes.buffer.slice(pdfBytes.byteOffset, pdfBytes.byteOffset + pdfBytes.byteLength) as ArrayBuffer;
  return buffer;
}
