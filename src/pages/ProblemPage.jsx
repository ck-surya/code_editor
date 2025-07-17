'use client';

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { submitToDomjudge } from '../components/submitToDomjudge';
import { useParams } from 'react-router-dom';
import ProblemText from '../components/ProblemText';
import CodeEditor from '../components/CodeEditor';
import styles from './ProblemPage.module.css';

// If you're using react-router-dom
// import { useParams } from 'react-router-dom';

const ProblemPage = () => {
  const { problemId } = useParams();
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('python');
  const [runInput, setRunInput] = useState('');
  const [runOutput, setRunOutput] = useState('');
  const [submitStatus, setSubmitStatus] = useState('');
  const navigate = useNavigate();

  const handleRun = async () => {
    setRunOutput('⏳ Running...');
    setTimeout(() => {
      setRunOutput(`✅ Output:\n${runInput}\n\n(Code execution result placeholder)`);
    }, 1000);
  };

  const handleSubmit = async () => {
    setSubmitStatus('⏳ Submitting...');
    try {
      const res = await submitToDomjudge({ code, language, problemId });
      console.log('Submission response:', res);
      // Store submission in localStorage
      const submission = {
        id: res.id || Date.now(),
        problemId,
        language,
        code,
        time: new Date().toISOString(),
        status: res.status || 'pending',
      };
      let submissions = [];
      try {
        submissions = JSON.parse(localStorage.getItem('submissions')) || [];
      } catch {}
      submissions.unshift(submission);
      localStorage.setItem('submissions', JSON.stringify(submissions));
      setSubmitStatus('✅ Submitted!');
      // Optionally, navigate to submissions page
      // navigate('/submissions');
    } catch (err) {
      setSubmitStatus('❌ Submission failed: ' + err.message);
    }
  };

  return (
    <div className={styles['problem-page-root']}>
      {/* Problem Statement Panel */}
      <div className={styles['problem-panel']}>
        <ProblemText problemId={problemId} />
      </div>
      {/* Code Editor Panel */}
      <div className={styles['editor-panel']}>
        {/* Language Selector */}
        <div className={styles['lang-select-row']}>
          <label>
            <b>Language:</b>{' '}
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className={styles['lang-select']}
            >
              <option value="python">Python</option>
              <option value="c">C</option>
              <option value="c++">C++</option>
              <option value="java">Java</option>
            </select>
          </label>
        </div>
        {/* Code Editor */}
        <CodeEditor language={language} value={code} onChange={setCode} />
        {/* Input Area */}
        <div className={styles['input-area']}>
          <label>
            <b>Input:</b>
            <textarea
              className={styles['input-box']}
              value={runInput}
              onChange={(e) => setRunInput(e.target.value)}
              placeholder="Enter input for your code"
            />
          </label>
          <button className={styles['run-btn']} onClick={handleRun}>
            Run
          </button>
          <button className={styles['sub-btn']} onClick={handleSubmit}>
            Submit
          </button>
          {submitStatus && <div style={{ marginTop: 8 }}>{submitStatus}</div>}
        </div>
        {/* Output Area */}
        <div className={styles['output-area']}>
          <b>Output:</b>
          <pre className={styles['output-box']}>
            {runOutput}
          </pre>
        </div>
        {/* Navigation Buttons at Bottom */}
        <div className={styles['nav-btn-row']} style={{ marginTop: 32, justifyContent: 'center' }}>
          <button className={styles['nav-btn']} onClick={() => navigate(-1)}>← Previous</button>
          <button className={styles['nav-btn']} onClick={() => navigate('/submissions')}>My Submissions</button>
        </div>
      </div>
    </div>
  );
};

export default ProblemPage;
