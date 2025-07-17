// submitToDomjudge.jsx
// Utility function to submit code to DOMjudge

/**
 * Submits code to DOMjudge via the API.
 * @param {Object} params
 * @param {string} params.code - The code to submit
 * @param {string} params.language - The language (UI value, e.g. 'python', 'cpp')
 * @param {string} params.problemId - The DOMjudge problem ID
 * @returns {Promise<Object>} - The DOMjudge submission response
 */
export async function submitToDomjudge({ code, language, problemId }) {
  const formdata = new FormData();
  formdata.append("problem", problemId);
  formdata.append("language", getDomJudgeLang(language));
  const blob = new Blob([code], { type: "text/plain" });
  formdata.append("code", blob, getFileName(language));
  formdata.append("entry_point", "");

  const res = await fetch('/api/v4/contests/1/submissions', {
    method: 'POST',
    headers: {
      Authorization: 'Basic cmFuaTpyYW5pQGp1c3R1anUuaW4=',
      Accept: 'application/json',
      // Do NOT set Content-Type here!
    },
    body: formdata,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error('Submission failed: ' + err);
  }
  return await res.json();
}

function getFileName(language) {
  switch (language) {
    case 'python': return 'solution.py';
    case 'cpp': return 'solution.cpp';
    case 'javascript': return 'solution.js';
    case 'html': return 'solution.html';
    default: return 'solution.py';
  }
}

function getDomJudgeLang(language) {
  // Map your UI language to DOMjudge language id
  if (language === 'python') return 'python3';
  if (language === 'cpp') return 'cpp';
  if (language === 'javascript') return 'nodejs';
  if (language === 'html') return 'html';
  return language;
}
