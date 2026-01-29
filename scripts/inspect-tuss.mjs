import XLSX from 'xlsx';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const workbook = XLSX.readFile(path.join(__dirname, '../tuss-data.xls'));
const worksheet = workbook.Sheets[workbook.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(worksheet);

console.log('Total de linhas:', data.length);
console.log('\nPrimeira linha:');
console.log(JSON.stringify(data[0], null, 2));
console.log('\nNomes das colunas:');
console.log(Object.keys(data[0] || {}));
