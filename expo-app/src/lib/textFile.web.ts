// Веб-версия textFile.ts: сохранить — обычная загрузка файла браузером, открыть — окно выбора файла.

export async function shareTextFile(name: string, text: string, mimeType: string): Promise<void> {
  const url = URL.createObjectURL(new Blob([text], { type: mimeType }));
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function pickTextFile(maxBytes: number): Promise<string | null> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,application/json';
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return resolve(null);
      if (file.size > maxBytes) return reject(new Error('Файл слишком большой'));
      file.text().then(resolve, reject);
    };
    input.oncancel = () => resolve(null);
    input.click();
  });
}
