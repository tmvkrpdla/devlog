import React, {useEffect, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {BrowserRouter, Link, Routes, Route, useNavigate, useParams, useSearchParams} from 'react-router-dom';
import {api} from './api';
import './style.css';

const empty = {
    title: '',
    symptom: '',
    cause: '',
    solution: '',
    codeSnippet: '',
    techStack: '',
    project: '',
    prevention: '',
    tags: ''
};
const date = value => new Date(value).toLocaleDateString('ko-KR');

function ErrorMessage({message}) {
    return message ? <div className="error" role="alert">{message}</div> : null;
}

function Tags({tags = []}) {
    return <div className="tags">{tags.map(t => <span key={t.id}>#{t.name}</span>)}</div>;
}

function ListPage() {
    const [params, setParams] = useSearchParams();
    const query = params.toString();
    const [data, setData] = useState(null), [error, setError] = useState(''), [tags, setTags] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        let active = true;
        setLoading(true);
        setError('');
        Promise.all([api(`/troubleshootings?${query}`), api('/tags')])
            .then(([d, t]) => {
                if (active) {
                    setData(d);
                    setTags(t);
                }
            })
            .catch(e => {
                if (active) setError(e.message);
            })
            .finally(() => {
                if (active) setLoading(false);
            });
        return () => {
            active = false;
        };
    }, [query]);

    function search(e) {
        e.preventDefault();
        const next = new URLSearchParams();
        for (const [k, v] of new FormData(e.currentTarget)) if (v.trim()) next.set(k, v.trim());
        setParams(next);
    }

    function page(delta) {
        const next = new URLSearchParams(params);
        next.set('page', data.page + delta);
        setParams(next);
    }

    return <>
        <section className="hero">
            <div><p className="eyebrow">YOUR PERSONAL DEBUGGING JOURNAL</p><h1>한 번 해결한 문제,<br/><em>다음엔 더 빠르게.</em></h1>
                <p className="muted">증상부터 해결까지. 흩어진 경험을 나만의 개발 기록으로 모으세요.</p></div>
            <div className="hero-mark" aria-hidden="true">{'{ }'}<small>FIX. LOG. REPEAT.</small></div>
        </section>
        <form className="search-panel" onSubmit={search} key={query}>
            <label className="search-label">기록 검색<input name="keyword" maxLength={200}
                                                        defaultValue={params.get('keyword') || ''}
                                                        placeholder="어떤 문제였나요? 제목, 증상, 해결책, 코드 검색"/></label>
            <div className="filters"><label>태그<select name="tag" defaultValue={params.get('tag') || ''}>
                <option value="">전체 태그</option>
                {tags.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}</select></label><label>프로젝트<input
                name="project" maxLength={100} defaultValue={params.get('project') || ''}
                placeholder="프로젝트명 (일치)"/></label><label>기술 스택<input name="techStack" maxLength={200}
                                                                     defaultValue={params.get('techStack') || ''}
                                                                     placeholder="예: Spring"/></label>
                <button type="submit">검색</button>
                <button type="button" className="secondary" onClick={() => setParams({})}>초기화</button>
            </div>
        </form>
        <div className="section-title"><h2>해결 기록 <span>{data?.total ?? 0}</span></h2><span
            className="muted">최근 수정순</span></div>
        <ErrorMessage message={error}/>
        {loading ? <p className="empty" role="status">기록을 불러오는 중입니다…</p> : !error && <>
            {data?.items.length ?
                <div className="cards">{data.items.map(item => <Link className="card" to={`/issues/${item.id}`}
                                                                     key={item.id}>
                    <div className="card-meta"><span>{item.project || '개인 기록'}</span>
                        <time>{date(item.updatedAt)}</time>
                    </div>
                    <h3>{item.title}</h3><p className="excerpt">{item.symptom}</p><Tags tags={item.tags}/>
                    <div className="card-bottom"><span>{item.techStack || '기술 스택 미지정'}</span><span>기록 보기 ↗</span></div>
                </Link>)}</div> :
                <div className="empty"><h3>{query ? '검색 결과가 없습니다.' : '첫 번째 해결 기록을 남겨보세요.'}</h3><p>오늘 해결한 작은 문제도 다음의 시간을
                    아껴줍니다.</p><Link className="button" to="/issues/new">+ 새 기록</Link></div>}
            {data && data.total > data.size && <div className="pagination">
                <button className="secondary" disabled={data.page === 0} onClick={() => page(-1)}>이전</button>
                <span>{data.page + 1} / {Math.ceil(data.total / data.size)}</span>
                <button className="secondary" disabled={(data.page + 1) * data.size >= data.total}
                        onClick={() => page(1)}>다음
                </button>
            </div>}
        </>}
    </>;
}

function DetailPage() {
    const {id} = useParams(), navigate = useNavigate();
    const [item, setItem] = useState(null), [error, setError] = useState(''), [busy, setBusy] = useState(false);
    useEffect(() => {
        let active = true;
        setItem(null);
        setError('');
        api(`/troubleshootings/${id}`).then(d => {
            if (active) setItem(d);
        }).catch(e => {
            if (active) setError(e.message);
        });
        return () => {
            active = false;
        };
    }, [id]);

    async function remove() {
        if (!window.confirm('이 기록을 삭제할까요? 삭제한 기록은 복구할 수 없습니다.')) return;
        setBusy(true);
        setError('');
        try {
            await api(`/troubleshootings/${id}`, {method: 'DELETE'});
            navigate('/');
        } catch (e) {
            setError(e.message);
            setBusy(false);
        }
    }

    return <><Link className="back" to="/">← 기록 목록</Link><ErrorMessage message={error}/>{item ?
        <article className="detail">
            <div className="card-meta">
                <span>{item.project || '개인 기록'} · {item.techStack || '기술 스택 미지정'}</span><span>{date(item.updatedAt)} 수정</span>
            </div>
            <h1>{item.title}</h1><Tags tags={item.tags}/>
            <div className="actions"><Link className="button secondary" to={`/issues/${id}/edit`}>수정</Link>
                <button className="danger" disabled={busy} onClick={remove}>{busy ? '삭제 중…' : '삭제'}</button>
            </div>
            {[['symptom', '증상'], ['cause', '원인'], ['solution', '해결 방법'], ['codeSnippet', '코드'], ['prevention', '재발 방지']].map(([key, label]) =>
                <section className="detail-section" key={key}><h2>{label}</h2>{key === 'codeSnippet' ?
                    <pre><code>{item[key] || '// 기록한 코드가 없습니다.'}</code></pre> :
                    <p className="preserve">{item[key] || '아직 기록하지 않았습니다.'}</p>}</section>)}</article> : !error &&
        <p role="status">불러오는 중…</p>}</>;
}

function EditorPage() {
    const {id} = useParams(), navigate = useNavigate();
    const [form, setForm] = useState(empty), [loading, setLoading] = useState(!!id), [busy, setBusy] = useState(false), [error, setError] = useState('');
    useEffect(() => {
        if (!id) {
            setForm(empty);
            setLoading(false);
            return;
        }
        let active = true;
        setLoading(true);
        api(`/troubleshootings/${id}`).then(d => {
            if (active) {
                setForm({...d, tags: d.tags.map(t => t.name).join(', ')});
                setLoading(false);
            }
        }).catch(e => {
            if (active) setError(e.message);
        });
        return () => {
            active = false;
        };
    }, [id]);

    function field(key, label, required = false, multiline = false, maxLength = 10000) {
        const props = {
            id: key,
            name: key,
            value: form[key],
            required,
            maxLength,
            onChange: e => setForm({...form, [key]: e.target.value})
        };
        return <label className={key === 'codeSnippet' ? 'code-field' : ''} htmlFor={key}>{label}{required &&
            <span className="required"> *</span>}{multiline ?
            <textarea {...props} rows={key === 'codeSnippet' ? 7 : 4}/> : <input {...props}/>}</label>;
    }

    async function save(e) {
        e.preventDefault();
        setError('');
        const tags = [...new Set(form.tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean))];
        if (tags.length > 20 || tags.some(t => t.length > 50)) {
            setError('태그는 최대 20개, 각각 50자까지 입력할 수 있습니다.');
            return;
        }
        setBusy(true);
        try {
            const result = await api(`/troubleshootings${id ? `/${id}` : ''}`, {
                method: id ? 'PUT' : 'POST',
                body: JSON.stringify({...form, tags})
            });
            navigate(`/issues/${result.id}`);
        } catch (e) {
            setError(e.message);
            setBusy(false);
        }
    }

    return <><Link className="back" to={id ? `/issues/${id}` : '/'}>← 돌아가기</Link>
        <div className="editor-heading"><p className="eyebrow">LEAVE A SOLUTION FOR YOUR FUTURE SELF</p>
            <h1>{id ? '기록 수정' : '새로운 해결 기록'}</h1><p className="muted">기억이 생생할 때 남겨두세요. * 표시는 필수 항목입니다.</p></div>
        <ErrorMessage message={error}/>{loading ? !error && <p role="status">불러오는 중…</p> :
            <form className="editor" onSubmit={save}>
                <fieldset disabled={busy}>{field('title', '제목', true, false, 200)}
                    <div
                        className="two-col">{field('project', '프로젝트', false, false, 100)}{field('techStack', '기술 스택', false, false, 200)}</div>
                    {field('symptom', '어떤 증상이 있었나요?', true, true)}{field('cause', '원인은 무엇이었나요?', false, true)}{field('solution', '어떻게 해결했나요?', true, true)}{field('codeSnippet', '관련 코드', false, true)}{field('prevention', '다음에는 어떻게 예방할까요?', false, true)}{field('tags', '태그 (쉼표로 구분)', false, false, 1019)}
                    <div className="actions">
                        <button type="submit">{busy ? '저장 중…' : '기록 저장'}</button>
                        <Link className="button secondary" to={id ? `/issues/${id}` : '/'}>취소</Link></div>
                </fieldset>
            </form>}</>;
}

function App() {
    return <>
        <header>
            <div className="header-inner"><Link className="brand" to="/"><span className="logo">⌘</span> DevLog<span
                className="beta">PERSONAL</span></Link><Link className="button" to="/issues/new">+ 새 기록</Link></div>
        </header>
        <main><Routes><Route path="/" element={<ListPage/>}/><Route path="/issues/new"
                                                                    element={<EditorPage key="new"/>}/><Route
            path="/issues/:id" element={<DetailPage/>}/><Route path="/issues/:id/edit"
                                                               element={<EditorPage key="edit"/>}/><Route path="*"
                                                                                                          element={<div
                                                                                                              className="empty">페이지를
                                                                                                              찾을 수
                                                                                                              없습니다. <Link
                                                                                                                  to="/">목록으로</Link>
                                                                                                          </div>}/></Routes>
        </main>
        <footer>DevLog <span>작은 해결이 쌓여, 나만의 지식이 됩니다.</span></footer>
    </>;
}

createRoot(document.getElementById('root')).render(
    <React.StrictMode><BrowserRouter><App/></BrowserRouter></React.StrictMode>);
