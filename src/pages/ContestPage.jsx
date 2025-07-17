import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = '/api/v4/contests/1/problems?strict=false';

const ContestPage = () => {
    const [problems, setProblems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProblems = async () => {
            try {
                const response = await fetch(API_URL);
                if (!response.ok) throw new Error('Failed to fetch problems');
                const data = await response.json();
                setProblems(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchProblems();
    }, []);

    if (loading) return <div>Loading problems...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className='contest-page'>
            <h1>Contest Problems</h1>
            <table>
                <thead>
                    <tr>
                        <th>Label</th>
                        <th>Problem Name</th>
                    </tr>
                </thead>
                <tbody>
                    {problems.map((problem) => (
                        <tr key={problem.id}>
                            <td>{problem.label}</td>
                            <td>
                                {problem.statement && problem.statement.length > 0 ? (
                                    <a
                                        href={problem.statement[0].href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            navigate(`/problem/${problem.id}`);
                                        }}
                                    >
                                        {problem.name}
                                    </a>
                                ) : (
                                    problem.name
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ContestPage;