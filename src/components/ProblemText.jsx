'use client';

import React, { useEffect, useState } from 'react';
// No static import of pdfjs-dist or worker; will use dynamic import below
import styles from './ProblemText.module.css'; // CSS module

const ProblemText = ({ problemId }) => {
  const [pdfText, setPdfText] = useState('Loading problem statement...');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPdfText = async () => {
      try {
        // Fetch PDF as blob using the Vite proxy (no /proxy prefix needed)
        const res = await fetch(`/api/v4/contests/1/problems/${problemId}/statement?strict=false`, {
          headers: { Accept: 'application/pdf' }
        });
        if (!res.ok) throw new Error('Failed to fetch problem statement');
        const blob = await res.blob();
        const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
        pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
        const pdf = await pdfjsLib.getDocument({ data: await blob.arrayBuffer() }).promise;
        let fullText = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          const pageText = content.items.map((item) => item.str).join(' ');
          fullText += `${pageText}\n\n`;
        }
        setPdfText(formatProblemText(fullText.trim()));
        setLoading(false);
      } catch (error) {
        console.log(error);
        // Handle error gracefully
        // You might want to log this error or show a user-friendly message
        setPdfText('❌ Failed to load problem statement.');
        setLoading(false);
      }
    };
    loadPdfText();
  }, [problemId]);

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Problem Statement</h2>
      <div className={styles.text}>
        {loading ? 'Loading...' : <div dangerouslySetInnerHTML={{ __html: pdfText }} />}
      </div>

    </div>
  );
};

// Format the extracted problem text for better readability
function formatProblemText(text) {
  // Section keywords and order
  const sectionOrder = [
    'Title',
    'Problem Statement',
    'Constraints',
    'Input Format',
    'Output Format',
    'Sample Input',
    'Sample Output',
    'Hint',
  ];
  const sectionKeys = {
    'Problem Statement:': 'Problem Statement',
    'Constraints:': 'Constraints',
    'Input Format:': 'Input Format',
    'Output Format:': 'Output Format',
    'Sample Input:': 'Sample Input',
    'Sample Output:': 'Sample Output',
    'Hint:': 'Hint',
  };
  // Build a regex to split by all section keywords
  const allKeys = Object.keys(sectionKeys);
  const splitRegex = new RegExp(`(${allKeys.map(k => k.replace(/([.*+?^=!:${}()|[\]\/\\])/g, "\\$1")).join('|')})`, 'g');
  // If the text is a single line, split it by section keywords
  let parts = text.split(splitRegex).filter(Boolean).map(s => s.trim());
  let sections = {};
  let current = 'Title';
  sections[current] = [];
  for (let i = 0; i < parts.length; i++) {
    if (sectionKeys[parts[i] + ':']) {
      current = sectionKeys[parts[i] + ':'];
      if (!sections[current]) sections[current] = [];
      continue;
    }
    // If the part matches a section key with colon, switch section
    if (sectionKeys[parts[i]]) {
      current = sectionKeys[parts[i]];
      if (!sections[current]) sections[current] = [];
      continue;
    }
    if (!sections[current]) sections[current] = [];
    sections[current].push(parts[i]);
  }
  // Compose HTML for each section
  let html = '';
  for (const sec of sectionOrder) {
    if (!sections[sec] || sections[sec].length === 0) continue;
    if (sec === 'Title') {
      html += `<h3 style='margin-bottom:8px;'>${sections[sec][0]}</h3>`;
    } else if (sec === 'Sample Input' || sec === 'Sample Output') {
      html += `<div><b>${sec}:</b></div><pre style='background:#f5f5f5;padding:8px;border-radius:4px;'>${sections[sec].join('\n').trim()}</pre>`;
    } else {
      html += `<div><b>${sec}:</b></div><div style='margin-bottom:8px;'>${sections[sec].join(' ').trim()}</div>`;
    }
  }
  return html;
}

export default ProblemText;
