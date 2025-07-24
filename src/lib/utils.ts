
import type { Participant } from '../App.tsx';

export const exportToCSV = (winners: Participant[], eventTitle: string) => {
  if (winners.length === 0) {
    alert('沒有中獎紀錄可以匯出。');
    return;
  }

  const headers = ['名次', '姓名'];
  const rows = winners.map((winner, index) => [winners.length - index, winner.name]);

  let csvContent = "data:text/csv;charset=utf-8,\uFEFF"; // \uFEFF for BOM
  csvContent += headers.join(',') + '\r\n';

  rows.forEach(rowArray => {
    const row = rowArray.join(',');
    csvContent += row + '\r\n';
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  const sanitizedTitle = eventTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  link.setAttribute('download', `${sanitizedTitle}_winners_${new Date().toISOString().slice(0,10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};