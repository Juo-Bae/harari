'use client';

import { useState } from 'react';

export default function TestConnectionPage() {
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const testConnection = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/test-connection');
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        error: '테스트 중 오류가 발생했습니다.',
        details: String(error),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Google Sheets API 연결 테스트
        </h1>

        <button
          onClick={testConnection}
          disabled={isLoading}
          className="mb-6 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? '테스트 중...' : '연결 테스트'}
        </button>

        {result && (
          <div
            className={`p-6 rounded-lg ${
              result.success
                ? 'bg-green-50 border border-green-200'
                : 'bg-red-50 border border-red-200'
            }`}
          >
            <h2
              className={`text-xl font-semibold mb-4 ${
                result.success ? 'text-green-800' : 'text-red-800'
              }`}
            >
              {result.success ? '✓ 연결 성공' : '✗ 연결 실패'}
            </h2>

            {result.success ? (
              <div className="space-y-2 text-green-700">
                <p>
                  <strong>스프레드시트 제목:</strong> {result.spreadsheetTitle}
                </p>
                <p>
                  <strong>스프레드시트 ID:</strong> {result.spreadsheetId}
                </p>
                <p className="mt-4 text-sm">{result.message}</p>
              </div>
            ) : (
              <div className="space-y-2 text-red-700">
                <p>
                  <strong>오류:</strong> {result.error}
                </p>
                {result.details && (
                  <p className="text-sm mt-2">
                    <strong>상세:</strong> {result.details}
                  </p>
                )}
                <div className="mt-4 p-4 bg-white rounded border border-red-200">
                  <p className="text-sm font-semibold mb-2">확인 사항:</p>
                  <ul className="text-sm list-disc list-inside space-y-1">
                    <li>.env.local 파일에 GOOGLE_SHEETS_SPREADSHEET_ID가 설정되어 있는지 확인</li>
                    <li>credentials 폴더에 service-account-key.json 파일이 있는지 확인</li>
                    <li>Google 스프레드시트가 서비스 계정 이메일과 공유되어 있는지 확인</li>
                    <li>Google Sheets API가 활성화되어 있는지 확인</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

