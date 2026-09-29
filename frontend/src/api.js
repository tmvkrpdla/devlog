export async function api(path, options = {}) {
  let response;
  try {
    response = await fetch(`/api${path}`, { ...options, headers: { 'Content-Type': 'application/json', ...options.headers } });
  } catch { throw new Error('서버에 연결할 수 없습니다. 백엔드 실행 상태를 확인해 주세요.'); }
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.message || `요청에 실패했습니다 (${response.status}).`);
  }
  if (response.status === 204) return null;
  return response.json();
}
